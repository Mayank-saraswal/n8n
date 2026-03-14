import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { slackChannel } from "@/inngest/channels/slack"
import { SlackOperation } from "@/generated/prisma"

interface SlackBotCredential {
  type: "bot_token"
  token: string
}

interface SlackWebhookCredential {
  type: "webhook"
  webhookUrl: string
}

type SlackCredential = SlackBotCredential | SlackWebhookCredential

type SlackData = {
  nodeId?: string
}

const MAX_WEBHOOK_MESSAGE_LENGTH = 2000

async function slackRequest(
  method: "GET" | "POST",
  endpoint: string,
  token: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const url = `https://slack.com/api/${endpoint}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new NonRetriableError(
      `Slack API HTTP error: ${response.status} ${response.statusText}`
    )
  }

  const data = (await response.json()) as Record<string, unknown>

  if (data.ok === false) {
    throw new NonRetriableError(
      `Slack API error: ${(data.error as string) ?? "unknown_error"}`
    )
  }

  return data
}

export const slackExecutor: NodeExecutor<SlackData> = async ({
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    })
  )

  // Step 1: Load config from DB
  const config = await step.run(`slack-${nodeId}-load-config`, async () => {
    return prisma.slackNode.findUnique({ where: { nodeId } })
  })

  if (!config) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Slack node not configured. Open settings to configure."
    )
  }

  // Step 2: Load and decrypt credential
  const credential = await step.run(
    `slack-${nodeId}-load-credential`,
    async () => {
      if (!config.credentialId) return null
      return prisma.credential.findUnique({
        where: {
          id: config.credentialId,
          userId,
        },
      })
    }
  )

  let creds: SlackCredential | null = null

  if (credential) {
    const raw = decrypt(credential.value)
    try {
      creds = JSON.parse(raw) as SlackCredential
    } catch {
      await publish(
        slackChannel().status({
          nodeId,
          status: "error",
        })
      )
      throw new NonRetriableError(
        'Invalid Slack credential format. Expected JSON: {"type": "bot_token", "token": "xoxb-..."} or {"type": "webhook", "webhookUrl": "..."}'
      )
    }
  }

  const isWebhookOp = config.operation === SlackOperation.MESSAGE_SEND_WEBHOOK

  if (!isWebhookOp && (!creds || creds.type !== "bot_token")) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Slack Bot Token credential required for API operations. Add a SLACK credential with type: bot_token."
    )
  }

  // Step 3: Execute operation
  let result: Record<string, unknown>
  try {
    result = await step.run(`slack-${nodeId}-execute`, async () => {
      const channel = resolveTemplate(config.channel, context)
      const message = resolveTemplate(config.message, context)
      const threadTs = resolveTemplate(config.threadTs, context)
      const messageTs = resolveTemplate(config.messageTs, context)
      const searchQuery = resolveTemplate(config.searchQuery, context)
      const channelName = resolveTemplate(config.channelName, context)
      const channelTopic = resolveTemplate(config.channelTopic, context)
      const channelPurpose = resolveTemplate(config.channelPurpose, context)
      const slackUserId = resolveTemplate(config.userId, context)
      const emoji = resolveTemplate(config.emoji, context)
      const fileComment = resolveTemplate(config.fileComment, context)
      const webhookUrl = resolveTemplate(config.webhookUrl, context)

      let apiResult: Record<string, unknown> = {}

      switch (config.operation) {
        // ── Message Operations ──
        case SlackOperation.MESSAGE_SEND_WEBHOOK: {
          const url =
            creds?.type === "webhook" ? creds.webhookUrl : webhookUrl
          if (!url) {
            throw new NonRetriableError(
              "Slack: webhook URL is required for MESSAGE_SEND_WEBHOOK"
            )
          }
          if (!message) {
            throw new NonRetriableError(
              "Slack: message content is required for MESSAGE_SEND_WEBHOOK"
            )
          }
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
          })
          if (!resp.ok) {
            throw new NonRetriableError(
              `Slack webhook error: HTTP ${resp.status}`
            )
          }
          apiResult = { ok: true, message: message.slice(0, MAX_WEBHOOK_MESSAGE_LENGTH) }
          break
        }

        case SlackOperation.MESSAGE_SEND: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!message)
            throw new NonRetriableError("Slack: message is required")
          const body: Record<string, unknown> = {
            channel,
            text: message,
          }
          if (threadTs) body.thread_ts = threadTs
          apiResult = await slackRequest(
            "POST",
            "chat.postMessage",
            (creds as SlackBotCredential).token,
            body
          )
          break
        }

        case SlackOperation.MESSAGE_UPDATE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!messageTs)
            throw new NonRetriableError("Slack: messageTs is required")
          if (!message)
            throw new NonRetriableError("Slack: message is required")
          apiResult = await slackRequest(
            "POST",
            "chat.update",
            (creds as SlackBotCredential).token,
            { channel, ts: messageTs, text: message }
          )
          break
        }

        case SlackOperation.MESSAGE_DELETE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!messageTs)
            throw new NonRetriableError("Slack: messageTs is required")
          apiResult = await slackRequest(
            "POST",
            "chat.delete",
            (creds as SlackBotCredential).token,
            { channel, ts: messageTs }
          )
          break
        }

        case SlackOperation.MESSAGE_GET_PERMALINK: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!messageTs)
            throw new NonRetriableError("Slack: messageTs is required")
          apiResult = await slackRequest(
            "GET",
            `chat.getPermalink?channel=${encodeURIComponent(channel)}&message_ts=${encodeURIComponent(messageTs)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.MESSAGE_SEARCH: {
          if (!searchQuery)
            throw new NonRetriableError("Slack: searchQuery is required")
          apiResult = await slackRequest(
            "GET",
            `search.messages?query=${encodeURIComponent(searchQuery)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        // ── Channel Operations ──
        case SlackOperation.CHANNEL_CREATE: {
          if (!channelName)
            throw new NonRetriableError("Slack: channelName is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.create",
            (creds as SlackBotCredential).token,
            { name: channelName }
          )
          break
        }

        case SlackOperation.CHANNEL_ARCHIVE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.archive",
            (creds as SlackBotCredential).token,
            { channel }
          )
          break
        }

        case SlackOperation.CHANNEL_UNARCHIVE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.unarchive",
            (creds as SlackBotCredential).token,
            { channel }
          )
          break
        }

        case SlackOperation.CHANNEL_INVITE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!slackUserId)
            throw new NonRetriableError("Slack: userId is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.invite",
            (creds as SlackBotCredential).token,
            { channel, users: slackUserId }
          )
          break
        }

        case SlackOperation.CHANNEL_KICK: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!slackUserId)
            throw new NonRetriableError("Slack: userId is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.kick",
            (creds as SlackBotCredential).token,
            { channel, user: slackUserId }
          )
          break
        }

        case SlackOperation.CHANNEL_SET_TOPIC: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.setTopic",
            (creds as SlackBotCredential).token,
            { channel, topic: channelTopic }
          )
          break
        }

        case SlackOperation.CHANNEL_SET_PURPOSE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.setPurpose",
            (creds as SlackBotCredential).token,
            { channel, purpose: channelPurpose }
          )
          break
        }

        case SlackOperation.CHANNEL_HISTORY: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          apiResult = await slackRequest(
            "GET",
            `conversations.history?channel=${encodeURIComponent(channel)}&limit=100`,
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.CHANNEL_INFO: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          apiResult = await slackRequest(
            "GET",
            `conversations.info?channel=${encodeURIComponent(channel)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.CHANNEL_LIST: {
          apiResult = await slackRequest(
            "GET",
            "conversations.list?limit=200",
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.CHANNEL_RENAME: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!channelName)
            throw new NonRetriableError("Slack: channelName is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.rename",
            (creds as SlackBotCredential).token,
            { channel, name: channelName }
          )
          break
        }

        // ── User Operations ──
        case SlackOperation.USER_INFO: {
          if (!slackUserId)
            throw new NonRetriableError("Slack: userId is required")
          apiResult = await slackRequest(
            "GET",
            `users.info?user=${encodeURIComponent(slackUserId)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.USER_LIST: {
          apiResult = await slackRequest(
            "GET",
            "users.list?limit=200",
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.USER_GET_PRESENCE: {
          if (!slackUserId)
            throw new NonRetriableError("Slack: userId is required")
          apiResult = await slackRequest(
            "GET",
            `users.getPresence?user=${encodeURIComponent(slackUserId)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        // ── Reaction Operations ──
        case SlackOperation.REACTION_ADD: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!messageTs)
            throw new NonRetriableError("Slack: messageTs is required")
          if (!emoji)
            throw new NonRetriableError("Slack: emoji is required")
          apiResult = await slackRequest(
            "POST",
            "reactions.add",
            (creds as SlackBotCredential).token,
            { channel, timestamp: messageTs, name: emoji }
          )
          break
        }

        case SlackOperation.REACTION_REMOVE: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!messageTs)
            throw new NonRetriableError("Slack: messageTs is required")
          if (!emoji)
            throw new NonRetriableError("Slack: emoji is required")
          apiResult = await slackRequest(
            "POST",
            "reactions.remove",
            (creds as SlackBotCredential).token,
            { channel, timestamp: messageTs, name: emoji }
          )
          break
        }

        case SlackOperation.REACTION_GET: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!messageTs)
            throw new NonRetriableError("Slack: messageTs is required")
          apiResult = await slackRequest(
            "GET",
            `reactions.get?channel=${encodeURIComponent(channel)}&timestamp=${encodeURIComponent(messageTs)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        // ── File Operations ──
        case SlackOperation.FILE_UPLOAD: {
          if (!channel)
            throw new NonRetriableError("Slack: channel is required")
          if (!message)
            throw new NonRetriableError(
              "Slack: message (file content) is required"
            )
          apiResult = await slackRequest(
            "POST",
            "files.uploadV2",
            (creds as SlackBotCredential).token,
            {
              channel_id: channel,
              content: message,
              title: fileComment || "Uploaded file",
            }
          )
          break
        }

        case SlackOperation.FILE_LIST: {
          const params = new URLSearchParams({ count: "100" })
          if (channel) params.set("channel", channel)
          apiResult = await slackRequest(
            "GET",
            `files.list?${params.toString()}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.FILE_INFO: {
          if (!messageTs)
            throw new NonRetriableError(
              "Slack: messageTs (file ID) is required"
            )
          apiResult = await slackRequest(
            "GET",
            `files.info?file=${encodeURIComponent(messageTs)}`,
            (creds as SlackBotCredential).token
          )
          break
        }

        case SlackOperation.FILE_DELETE: {
          if (!messageTs)
            throw new NonRetriableError(
              "Slack: messageTs (file ID) is required"
            )
          apiResult = await slackRequest(
            "POST",
            "files.delete",
            (creds as SlackBotCredential).token,
            { file: messageTs }
          )
          break
        }

        // ── Conversation Operations ──
        case SlackOperation.CONVERSATION_OPEN: {
          if (!slackUserId)
            throw new NonRetriableError("Slack: userId is required")
          apiResult = await slackRequest(
            "POST",
            "conversations.open",
            (creds as SlackBotCredential).token,
            { users: slackUserId }
          )
          break
        }

        default:
          throw new NonRetriableError(
            `Unknown Slack operation: ${config.operation}`
          )
      }

      return {
        ...context,
        [config.variableName || "slack"]: {
          operation: config.operation,
          ...apiResult,
          timestamp: new Date().toISOString(),
        },
      }
    })
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw error
  }

  await publish(
    slackChannel().status({
      nodeId,
      status: "success",
    })
  )

  return result as Record<string, unknown>
}