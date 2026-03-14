import { inngest } from "@/inngest/client"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import {
  GOOGLE_GMAIL_CLIENT_ID,
  GOOGLE_GMAIL_CLIENT_SECRET,
} from "@/lib/env"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"

export const gmailWatchRenewal = inngest.createFunction(
  { id: "gmail-watch-renewal", name: "Gmail Watch Renewal" },
  { cron: "0 6 * * *" }, // runs daily at 6 AM UTC
  async ({ step }) => {
    return await step.run("renew-gmail-watches", async () => {
      // Find watchers expiring within next 25 hours
      const expirationThreshold = String(Date.now() + 25 * 60 * 60 * 1000)
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

          const raw = decrypt(credential.value)
          let parsed: Record<string, unknown>
          try {
            parsed = JSON.parse(raw)
          } catch {
            parsed = { refreshToken: raw }
          }
          const refreshToken = parsed.refreshToken as string | undefined
          if (!refreshToken) continue

          // Get access token
          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: GOOGLE_GMAIL_CLIENT_ID,
              client_secret: GOOGLE_GMAIL_CLIENT_SECRET,
              refresh_token: refreshToken,
              grant_type: "refresh_token",
            }),
          })
          if (!tokenRes.ok) continue

          const tokenData = (await tokenRes.json()) as { access_token: string }

          // Register Gmail watch
          const topicName = process.env.GMAIL_PUBSUB_TOPIC_NAME ?? ""
          if (!topicName) continue

          const watchRes = await fetch(`${GMAIL_API}/watch`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
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
