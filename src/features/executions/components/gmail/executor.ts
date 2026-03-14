import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { gmailChannel } from "@/inngest/channels/gmail"
import { GmailOperation } from "@/generated/prisma"

/* ── Types ── */

type GmailData = { nodeId?: string }

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"

/* ── Helper 1: Token refresh ── */

async function getAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_GMAIL_CLIENT_ID,
      client_secret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new NonRetriableError(
      `Gmail: Failed to refresh access token. ` +
        `Your Gmail credential may be invalid or expired. ` +
        `Please re-authenticate your Gmail account in settings. ` +
        `Error: ${(err as Record<string, string>).error_description ?? response.status}`
    )
  }
  const data = (await response.json()) as { access_token: string }
  if (!data.access_token) {
    throw new NonRetriableError(
      "Gmail: Token refresh succeeded but no access_token returned. " +
        "Re-authenticate your Gmail credential."
    )
  }
  return data.access_token
}

/* ── Helper 2: Gmail API request ── */

async function gmailRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  accessToken: string,
  body?: unknown
): Promise<Record<string, unknown>> {
  const url = path.startsWith("http") ? path : `${GMAIL_API}${path}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const errMsg =
      ((err as Record<string, Record<string, string>>).error?.message) ??
      `${response.status} ${response.statusText}`
    throw new NonRetriableError(`Gmail API error: ${errMsg}`)
  }

  const text = await response.text()
  if (!text) return {}
  return JSON.parse(text) as Record<string, unknown>
}

/* ── Helper 3: Fetch message metadata ── */

async function fetchMessageMetadata(
  messageId: string,
  accessToken: string,
  includeBody: boolean
): Promise<Record<string, unknown>> {
  const format = includeBody ? "full" : "metadata"
  const msg = await gmailRequest(
    "GET",
    `/messages/${messageId}?format=${format}`,
    accessToken
  )

  const payload = msg.payload as Record<string, unknown> | undefined
  const headers = (payload?.headers ?? []) as Array<{ name: string; value: string }>

  const hdr = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ""

  // Extract plain-text body from payload parts
  let bodyText = ""
  if (includeBody && payload) {
    const parts = (payload.parts ?? [payload]) as Array<Record<string, unknown>>
    for (const part of parts) {
      if ((part.mimeType as string)?.startsWith("text/plain")) {
        const data = (part.body as Record<string, unknown>)?.data as string | undefined
        if (data) {
          bodyText = Buffer.from(data, "base64url").toString("utf-8")
          break
        }
      }
    }
  }

  return {
    messageId: msg.id,
    threadId: msg.threadId,
    labelIds: msg.labelIds,
    snippet: msg.snippet,
    from: hdr("From"),
    to: hdr("To"),
    subject: hdr("Subject"),
    date: hdr("Date"),
    isUnread: ((msg.labelIds as string[]) ?? []).includes("UNREAD"),
    ...(includeBody ? { bodyText } : {}),
  }
}

/* ── Helper 4: Build RFC 2822 message ── */

function buildRawMessage(opts: {
  to: string
  subject: string
  body: string
  isHtml: boolean
  from?: string
  cc?: string
  bcc?: string
  replyTo?: string
  inReplyTo?: string
  references?: string
  threadId?: string
  attachmentData?: string
  attachmentName?: string
  attachmentMime?: string
}): string {
  const hasAttachment = !!opts.attachmentData

  const boundary = `nodebase_${Date.now()}`
  const lines: string[] = []

  lines.push(`To: ${opts.to}`)
  lines.push(`Subject: ${opts.subject}`)
  if (opts.from) lines.push(`From: ${opts.from}`)
  if (opts.cc) lines.push(`Cc: ${opts.cc}`)
  if (opts.bcc) lines.push(`Bcc: ${opts.bcc}`)
  if (opts.replyTo) lines.push(`Reply-To: ${opts.replyTo}`)
  if (opts.inReplyTo) lines.push(`In-Reply-To: ${opts.inReplyTo}`)
  if (opts.references) lines.push(`References: ${opts.references}`)
  lines.push("MIME-Version: 1.0")

  if (hasAttachment) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
    lines.push("")
    lines.push(`--${boundary}`)
    lines.push(
      opts.isHtml
        ? "Content-Type: text/html; charset=UTF-8"
        : "Content-Type: text/plain; charset=UTF-8"
    )
    lines.push("")
    lines.push(opts.body)
    lines.push(`--${boundary}`)
    lines.push(
      `Content-Type: ${opts.attachmentMime ?? "application/octet-stream"}; name="${opts.attachmentName ?? "attachment"}"`
    )
    lines.push("Content-Transfer-Encoding: base64")
    lines.push(
      `Content-Disposition: attachment; filename="${opts.attachmentName ?? "attachment"}"`
    )
    lines.push("")
    lines.push(opts.attachmentData!)
    lines.push(`--${boundary}--`)
  } else {
    lines.push(
      opts.isHtml
        ? "Content-Type: text/html; charset=UTF-8"
        : "Content-Type: text/plain; charset=UTF-8"
    )
    lines.push("")
    lines.push(opts.body)
  }

  const raw = lines.join("\r\n")
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/* ── Executor ── */

export const gmailExecutor: NodeExecutor<GmailData> = async ({
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(gmailChannel().status({ nodeId, status: "loading" }))

  // Step 1: Load config
  const config = await step.run(`gmail-${nodeId}-load-config`, async () => {
    return prisma.gmailNode.findUnique({ where: { nodeId } })
  })

  if (!config) {
    await publish(gmailChannel().status({ nodeId, status: "error" }))
    throw new NonRetriableError(
      "Gmail node not configured. Open settings to configure."
    )
  }

  // Step 2: Get tokens
  const accessToken = await step.run(
    `gmail-${nodeId}-get-tokens`,
    async () => {
      const credential = await prisma.credential.findUnique({
        where: { id: config.credentialId, userId },
      })

      if (!credential) {
        throw new NonRetriableError(
          "Gmail credential not found. Please re-select your credential."
        )
      }

      const raw = decrypt(credential.value)
      let parsed: { refreshToken?: string }
      try {
        parsed = JSON.parse(raw)
      } catch {
        // Fallback: credential stored as plain refresh token string (backward compat)
        parsed = { refreshToken: raw }
      }

      if (!parsed?.refreshToken) {
        throw new NonRetriableError(
          'Gmail credential missing refreshToken. Store as JSON: {"refreshToken": "..."}'
        )
      }

      return getAccessToken(parsed.refreshToken)
    }
  )

  // Step 3: Execute operation
  let result: Record<string, unknown>
  try {
    result = await step.run(`gmail-${nodeId}-execute`, async () => {
      // Resolve all template fields
      const to = resolveTemplate(config.to, context)
      const subject = resolveTemplate(config.subject, context)
      const body = resolveTemplate(config.body, context)
      const cc = resolveTemplate(config.cc, context)
      const bcc = resolveTemplate(config.bcc, context)
      const replyTo = resolveTemplate(config.replyTo, context)
      const messageId = resolveTemplate(config.messageId, context)
      const threadId = resolveTemplate(config.threadId, context)
      const searchQuery = resolveTemplate(config.searchQuery, context)
      const labelIds = resolveTemplate(config.labelIds, context)
      const pageToken = resolveTemplate(config.pageToken, context)
      const attachmentData = resolveTemplate(config.attachmentData, context)
      const attachmentName = resolveTemplate(config.attachmentName, context)
      const attachmentMime = resolveTemplate(config.attachmentMime, context)

      let apiResult: Record<string, unknown> = {}

      switch (config.operation) {
        /* ── SEND ── */
        case GmailOperation.SEND: {
          if (!to.trim()) {
            throw new NonRetriableError(
              `Gmail: 'To' field resolved to empty string. Template: "${config.to}"`
            )
          }
          const raw = buildRawMessage({
            to,
            subject,
            body,
            isHtml: config.isHtml,
            cc,
            bcc,
            replyTo,
            attachmentData,
            attachmentName,
            attachmentMime,
          })
          const sent = await gmailRequest("POST", "/messages/send", accessToken, {
            raw,
          })
          apiResult = {
            messageId: sent.id,
            threadId: sent.threadId,
            labelIds: sent.labelIds,
            to,
            subject,
            sentAt: new Date().toISOString(),
          }
          break
        }

        /* ── REPLY ── */
        case GmailOperation.REPLY: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail REPLY: messageId is required. " +
              "Use {{gmail.messageId}} from a GET_MESSAGE or SEARCH_MESSAGES operation."
            )
          }
          if (!body.trim()) {
            throw new NonRetriableError(
              "Gmail REPLY: reply body is required."
            )
          }

          // Fetch original message to get threading headers + sender
          const original = await gmailRequest(
            "GET",
            `/messages/${messageId}?format=metadata` +
            `&metadataHeaders=From&metadataHeaders=Subject` +
            `&metadataHeaders=Message-ID&metadataHeaders=References`,
            accessToken
          )
          const origPayload = original.payload as Record<string, unknown> | undefined
          const origHeaders = origPayload?.headers as
            | Array<{ name: string; value: string }>
            | undefined
          const origFrom =
            origHeaders?.find((h) => h.name.toLowerCase() === "from")?.value ?? ""
          const origSubject =
            origHeaders?.find((h) => h.name.toLowerCase() === "subject")?.value ?? ""
          const origMessageId =
            origHeaders?.find((h) => h.name.toLowerCase() === "message-id")?.value ?? messageId
          const origReferences =
            origHeaders?.find((h) => h.name.toLowerCase() === "references")?.value ?? ""

          // Determine reply recipient: explicit replyTo override → original From
          const replyRecipient = replyTo.trim() || origFrom
          if (!replyRecipient) {
            throw new NonRetriableError(
              "Gmail REPLY: Could not determine reply recipient from original message."
            )
          }

          const replySubject = subject || (origSubject.toLowerCase().startsWith("re:") ? origSubject : `Re: ${origSubject}`)
          const refChain = origReferences ? `${origReferences} ${origMessageId}` : origMessageId

          const raw = buildRawMessage({
            to: replyRecipient,
            subject: replySubject,
            body,
            isHtml: config.isHtml,
            cc,
            bcc,
            inReplyTo: origMessageId,
            references: refChain,
          })
          const replyPayload: Record<string, unknown> = {
            raw,
            threadId: (original.threadId as string) || threadId || undefined,
          }
          const sent = await gmailRequest(
            "POST",
            "/messages/send",
            accessToken,
            replyPayload
          )
          apiResult = {
            messageId: sent.id,
            threadId: sent.threadId,
            labelIds: sent.labelIds,
            to: replyRecipient,
            subject: replySubject,
            repliedTo: messageId,
            sentAt: new Date().toISOString(),
          }
          break
        }

        /* ── FORWARD ── */
        case GmailOperation.FORWARD: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail FORWARD: messageId is required."
            )
          }
          if (!to.trim()) {
            throw new NonRetriableError(
              "Gmail FORWARD: 'To' field is required."
            )
          }
          // Fetch original message
          const original = await gmailRequest(
            "GET",
            `/messages/${messageId}?format=full`,
            accessToken
          )
          const payload = original.payload as Record<string, unknown> | undefined
          const msgHeaders = payload?.headers as
            | Array<{ name: string; value: string }>
            | undefined
          const origSubject =
            msgHeaders?.find((h) => h.name.toLowerCase() === "subject")?.value ??
            ""
          const fwdSubject = subject || `Fwd: ${origSubject}`

          // Get the snippet as body fallback
          const origBody = (original.snippet as string) ?? ""
          const fwdBody = body || `---------- Forwarded message ----------\n${origBody}`

          const raw = buildRawMessage({
            to,
            subject: fwdSubject,
            body: fwdBody,
            isHtml: config.isHtml,
            cc,
            bcc,
            replyTo,
            attachmentData,
            attachmentName,
            attachmentMime,
          })
          const sent = await gmailRequest("POST", "/messages/send", accessToken, {
            raw,
          })
          apiResult = {
            messageId: sent.id,
            threadId: sent.threadId,
            forwardedFrom: messageId,
            to,
            subject: fwdSubject,
            sentAt: new Date().toISOString(),
          }
          break
        }

        /* ── GET_MESSAGE ── */
        case GmailOperation.GET_MESSAGE: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail GET_MESSAGE: messageId is required."
            )
          }
          const format = config.includeBody ? "full" : "metadata"
          let fields = "id,threadId,labelIds,snippet,internalDate"
          if (config.includeHeaders) {
            fields += ",payload/headers"
          }
          if (config.includeBody) {
            fields += ",payload"
          }
          const msg = await gmailRequest(
            "GET",
            `/messages/${messageId}?format=${format}&fields=${encodeURIComponent(fields)}`,
            accessToken
          )
          apiResult = {
            id: msg.id,
            threadId: msg.threadId,
            labelIds: msg.labelIds,
            snippet: msg.snippet,
            internalDate: msg.internalDate,
            payload: config.includeBody ? msg.payload : undefined,
          }
          break
        }

        /* ── LIST_MESSAGES ── */
        case GmailOperation.LIST_MESSAGES: {
          const params = new URLSearchParams({
            maxResults: String(config.maxResults),
          })
          if (labelIds.trim()) {
            for (const label of labelIds.split(",")) {
              if (label.trim()) params.append("labelIds", label.trim())
            }
          }
          if (searchQuery.trim()) params.set("q", searchQuery)
          if (pageToken.trim()) params.set("pageToken", pageToken)

          const list = await gmailRequest(
            "GET",
            `/messages?${params.toString()}`,
            accessToken
          )
          const rawMessages = (list.messages as Array<Record<string, unknown>>) ?? []

          // Fetch metadata for each message
          const messages = await Promise.all(
            rawMessages.map((m) =>
              fetchMessageMetadata(m.id as string, accessToken, config.includeBody)
            )
          )

          apiResult = {
            messages,
            resultSizeEstimate: list.resultSizeEstimate,
            nextPageToken: list.nextPageToken ?? null,
            count: messages.length,
          }
          break
        }

        /* ── SEARCH_MESSAGES ── */
        case GmailOperation.SEARCH_MESSAGES: {
          if (!searchQuery.trim()) {
            throw new NonRetriableError(
              "Gmail SEARCH_MESSAGES: searchQuery is required."
            )
          }
          const params = new URLSearchParams({
            q: searchQuery,
            maxResults: String(config.maxResults),
          })
          if (pageToken.trim()) params.set("pageToken", pageToken)

          const list = await gmailRequest(
            "GET",
            `/messages?${params.toString()}`,
            accessToken
          )
          const rawMessages = (list.messages as Array<Record<string, unknown>>) ?? []

          // Fetch metadata for each message
          const messages = await Promise.all(
            rawMessages.map((m) =>
              fetchMessageMetadata(m.id as string, accessToken, config.includeBody)
            )
          )

          apiResult = {
            messages,
            resultSizeEstimate: list.resultSizeEstimate,
            nextPageToken: list.nextPageToken ?? null,
            query: searchQuery,
            count: messages.length,
          }
          break
        }

        /* ── ADD_LABEL ── */
        case GmailOperation.ADD_LABEL: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail ADD_LABEL: messageId is required."
            )
          }
          if (!labelIds.trim()) {
            throw new NonRetriableError(
              "Gmail ADD_LABEL: labelIds is required."
            )
          }
          const addIds = labelIds
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean)
          const modified = await gmailRequest(
            "POST",
            `/messages/${messageId}/modify`,
            accessToken,
            { addLabelIds: addIds }
          )
          apiResult = {
            messageId: modified.id,
            threadId: modified.threadId,
            labelIds: modified.labelIds,
            addedLabels: addIds,
          }
          break
        }

        /* ── REMOVE_LABEL ── */
        case GmailOperation.REMOVE_LABEL: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail REMOVE_LABEL: messageId is required."
            )
          }
          if (!labelIds.trim()) {
            throw new NonRetriableError(
              "Gmail REMOVE_LABEL: labelIds is required."
            )
          }
          const removeIds = labelIds
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean)
          const modified = await gmailRequest(
            "POST",
            `/messages/${messageId}/modify`,
            accessToken,
            { removeLabelIds: removeIds }
          )
          apiResult = {
            messageId: modified.id,
            threadId: modified.threadId,
            labelIds: modified.labelIds,
            removedLabels: removeIds,
          }
          break
        }

        /* ── MARK_READ ── */
        case GmailOperation.MARK_READ: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail MARK_READ: messageId is required."
            )
          }
          const modified = await gmailRequest(
            "POST",
            `/messages/${messageId}/modify`,
            accessToken,
            { removeLabelIds: ["UNREAD"] }
          )
          apiResult = {
            messageId: modified.id,
            threadId: modified.threadId,
            labelIds: modified.labelIds,
            markedRead: true,
          }
          break
        }

        /* ── MARK_UNREAD ── */
        case GmailOperation.MARK_UNREAD: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail MARK_UNREAD: messageId is required."
            )
          }
          const modified = await gmailRequest(
            "POST",
            `/messages/${messageId}/modify`,
            accessToken,
            { addLabelIds: ["UNREAD"] }
          )
          apiResult = {
            messageId: modified.id,
            threadId: modified.threadId,
            labelIds: modified.labelIds,
            markedUnread: true,
          }
          break
        }

        /* ── MOVE_TO_TRASH ── */
        case GmailOperation.MOVE_TO_TRASH: {
          if (!messageId.trim()) {
            throw new NonRetriableError(
              "Gmail MOVE_TO_TRASH: messageId is required."
            )
          }
          const trashed = await gmailRequest(
            "POST",
            `/messages/${messageId}/trash`,
            accessToken
          )
          apiResult = {
            messageId: trashed.id,
            threadId: trashed.threadId,
            labelIds: trashed.labelIds,
            trashed: true,
          }
          break
        }

        /* ── CREATE_DRAFT ── */
        case GmailOperation.CREATE_DRAFT: {
          if (!to.trim()) {
            throw new NonRetriableError(
              "Gmail CREATE_DRAFT: 'To' field is required."
            )
          }
          const raw = buildRawMessage({
            to,
            subject,
            body,
            isHtml: config.isHtml,
            cc,
            bcc,
            replyTo,
            attachmentData,
            attachmentName,
            attachmentMime,
          })
          const draftPayload: Record<string, unknown> = {
            message: { raw, threadId: threadId || undefined },
          }
          const draft = await gmailRequest(
            "POST",
            "/drafts",
            accessToken,
            draftPayload
          )
          const draftMessage = draft.message as Record<string, unknown> | undefined
          apiResult = {
            draftId: draft.id,
            messageId: draftMessage?.id,
            threadId: draftMessage?.threadId,
            to,
            subject,
            createdAt: new Date().toISOString(),
          }
          break
        }

        default:
          throw new NonRetriableError(
            `Unknown or unsupported Gmail operation: ${config.operation}`
          )
      }

      return {
        ...context,
        [config.variableName || "gmail"]: {
          operation: config.operation,
          ...apiResult,
          timestamp: new Date().toISOString(),
        },
      }
    })
  } catch (error) {
    await publish(gmailChannel().status({ nodeId, status: "error" }))
    throw error
  }

  await publish(gmailChannel().status({ nodeId, status: "success" }))
  return result as Record<string, unknown>
}
