import { inngest } from "@/inngest/client"
import { NonRetriableError } from "inngest"
import prisma from "@/lib/db"
import { refreshGmailAccessToken } from "@/lib/gmail-auth"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"

export const gmailTriggerHandler = inngest.createFunction(
  { id: "gmail-trigger-handler", name: "Gmail Trigger Handler" },
  { event: "gmail/new-email" },
  async ({ event, step }) => {
    const { workflowId, nodeId, email, historyId, lastHistoryId } = event.data as {
      workflowId: string
      nodeId: string
      email: string
      historyId: string
      lastHistoryId: string
    }

    // Step 1: Load watcher and verify it's still active
    const watcher = await step.run("load-watcher", async () => {
      return prisma.gmailWatcher.findUnique({
        where: { nodeId },
        include: { workflow: { select: { id: true, userId: true } } },
      })
    })

    if (!watcher || !watcher.active) return { skipped: true }

    // Step 2: Fetch new messages using history API
    const newMessages = await step.run("fetch-new-messages", async () => {
      const credential = await prisma.credential.findUnique({
        where: { id: watcher.credentialId },
      })
      if (!credential) throw new NonRetriableError(
        "Gmail trigger: credential not found"
      )

      const { token } = await refreshGmailAccessToken(credential.value)

      // First run — just return empty so future runs have a baseline
      if (!lastHistoryId) {
        return []
      }

      const historyRes = await fetch(
        `${GMAIL_API}/history?` +
        new URLSearchParams({
          startHistoryId: lastHistoryId,
          historyTypes: "messageAdded",
          labelId: "INBOX",
        }).toString(),
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!historyRes.ok) return []

      const historyData = await historyRes.json() as {
        history?: Array<{
          messagesAdded?: Array<{ message: { id: string; threadId: string } }>
        }>
      }

      const addedMessages: Array<{ id: string; threadId: string }> = []
      for (const h of historyData.history ?? []) {
        for (const added of h.messagesAdded ?? []) {
          addedMessages.push(added.message)
        }
      }

      // Apply filterQuery if set
      if (watcher.filterQuery && addedMessages.length > 0) {
        const filtered: Array<{ id: string; threadId: string }> = []
        for (const msg of addedMessages) {
          const msgRes = await fetch(
            `${GMAIL_API}/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (!msgRes.ok) continue
          const msgData = await msgRes.json() as Record<string, unknown>
          const snippet = ((msgData.snippet as string) ?? "").toLowerCase()
          const headers = (msgData.payload as Record<string, unknown>)?.headers as
            Array<{ name: string; value: string }> | undefined
          const subject = headers?.find((h) => h.name === "Subject")?.value?.toLowerCase() ?? ""
          const from = headers?.find((h) => h.name === "From")?.value?.toLowerCase() ?? ""
          const q = watcher.filterQuery.toLowerCase()
          if (snippet.includes(q) || subject.includes(q) || from.includes(q)) {
            filtered.push(msg)
          }
        }
        return filtered
      }

      return addedMessages
    })

    if (newMessages.length === 0) return { skipped: true, reason: "no new messages" }

    // Step 3: Update watcher historyId
    await step.run("update-history-id", async () => {
      await prisma.gmailWatcher.update({
        where: { nodeId },
        data: { lastHistoryId: historyId },
      })
    })

    // Step 4: Fire workflow execution for each new email
    const msgs = newMessages as Array<{ id: string; threadId: string }>
    for (const msg of msgs) {
      await step.run(`trigger-workflow-${msg.id}`, async () => {
        await inngest.send({
          name: "workflow/execute",
          data: {
            workflowId,
            triggerContext: {
              gmail: {
                messageId: msg.id,
                threadId: msg.threadId,
                email,
                historyId,
                triggeredAt: new Date().toISOString(),
              },
            },
          },
        })
      })
    }

    return {
      triggered: true,
      workflowId,
      nodeId,
      email,
      messageCount: msgs.length,
      messageIds: msgs.map((m) => m.id),
    }
  }
)
