import { inngest } from "@/inngest/client"
import prisma from "@/lib/db"
import { getGmailPubsubTopic } from "@/lib/env"
import { refreshGmailAccessToken } from "@/lib/gmail-auth"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"

export const gmailWatchRenewal = inngest.createFunction(
  { id: "gmail-watch-renewal", name: "Gmail Watch Renewal" },
  { cron: "0 6 * * *" }, // runs daily at 6 AM UTC
  async ({ step }) => {
    return await step.run("renew-gmail-watches", async () => {
      // Gmail watches expire after 7 days; renew 25 hours before to ensure continuity
      const RENEWAL_THRESHOLD_MS = 25 * 60 * 60 * 1000
      const expirationThreshold = String(Date.now() + RENEWAL_THRESHOLD_MS)
      const watchers = await prisma.gmailWatcher.findMany({
        where: {
          active: true,
          expiration: { lt: expirationThreshold },
        },
      })

      let renewed = 0
      for (const watcher of watchers) {
        try {
          const credential = await prisma.credential.findUnique({
            where: { id: watcher.credentialId },
          })
          if (!credential) continue

          // Get access token using shared helper
          const { token } = await refreshGmailAccessToken(credential.id, credential.userId)

          // Register Gmail watch
          const topicName = getGmailPubsubTopic()
          if (!topicName) continue

          const watchRes = await fetch(`${GMAIL_API}/watch`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topicName,
              labelIds: ["INBOX"],
              labelFilterBehavior: "INCLUDE",
            }),
          })
          if (!watchRes.ok) continue

          const watchData = (await watchRes.json()) as {
            historyId: string
            expiration: string
          }

          await prisma.gmailWatcher.update({
            where: { id: watcher.id },
            data: {
              expiration: watchData.expiration,
              lastHistoryId: watchData.historyId,
            },
          })
          renewed++
        } catch (err) {
          console.error(
            `Failed to renew watch for watcher ${watcher.id}:`,
            err
          )
        }
      }

      return { checked: watchers.length, renewed }
    })
  }
)
