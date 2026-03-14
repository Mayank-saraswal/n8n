import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { GmailOperation } from "@/generated/prisma"
import { TRPCError } from "@trpc/server"
import { decrypt } from "@/lib/encryption"
import {
  GOOGLE_GMAIL_CLIENT_ID,
  GOOGLE_GMAIL_CLIENT_SECRET,
} from "@/lib/env"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"

function buildGmailData(input: {
  credentialId: string
  operation: GmailOperation
  variableName: string
  to: string; subject: string; body: string; isHtml: boolean
  cc: string; bcc: string; replyTo: string
  messageId: string; threadId: string; searchQuery: string
  maxResults: number; labelIds: string
  includeBody: boolean; includeHeaders: boolean; pageToken: string
  attachmentData: string; attachmentName: string; attachmentMime: string
  attachmentId: string; attachmentOutputFormat: string
  removeLabelIds: string; labelName: string; draftId: string; messageIds: string
}) {
  return {
    credentialId: input.credentialId,
    operation: input.operation,
    variableName: input.variableName,
    to: input.to, subject: input.subject, body: input.body, isHtml: input.isHtml,
    cc: input.cc, bcc: input.bcc, replyTo: input.replyTo,
    messageId: input.messageId, threadId: input.threadId, searchQuery: input.searchQuery,
    maxResults: input.maxResults, labelIds: input.labelIds,
    includeBody: input.includeBody, includeHeaders: input.includeHeaders,
    pageToken: input.pageToken,
    attachmentData: input.attachmentData, attachmentName: input.attachmentName,
    attachmentMime: input.attachmentMime,
    attachmentId: input.attachmentId, attachmentOutputFormat: input.attachmentOutputFormat,
    removeLabelIds: input.removeLabelIds, labelName: input.labelName,
    draftId: input.draftId, messageIds: input.messageIds,
  }
}

export const gmailRouter = createTRPCRouter({
  getCredentials: protectedProcedure.query(async ({ ctx }) => {
    const credentials = await prisma.credential.findMany({
      where: {
        userId: ctx.auth.user.id,
        type: { in: ["GMAIL", "GMAIL_OAUTH"] },
      },
      select: { id: true, name: true, type: true, createdAt: true },
      orderBy: [{ type: "desc" }, { createdAt: "desc" }],
    })
    return credentials
  }),

  testCredential: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const credential = await prisma.credential.findUnique({
        where: { id: input.credentialId, userId: ctx.auth.user.id },
      })

      if (!credential) {
        return { ok: false as const, error: "Credential not found" }
      }

      try {
        const raw = decrypt(credential.value)
        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = { refreshToken: raw }
        }

        const refreshToken = parsed.refreshToken as string | undefined
        if (!refreshToken) {
          return { ok: false as const, error: "Missing refreshToken" }
        }

        // Exchange refresh token for access token
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

        if (!tokenRes.ok) {
          const err = (await tokenRes.json().catch(() => ({}))) as Record<string, string>
          return {
            ok: false as const,
            error: err.error_description ?? `Token refresh failed (${tokenRes.status})`,
          }
        }

        const tokenData = (await tokenRes.json()) as { access_token: string }

        // Verify with Gmail profile
        const profileRes = await fetch(`${GMAIL_API}/profile`, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        if (!profileRes.ok) {
          return { ok: false as const, error: "Failed to fetch Gmail profile" }
        }

        const profile = (await profileRes.json()) as { emailAddress?: string }
        return { ok: true as const, email: profile.emailAddress ?? "" }
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }),

  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.gmailNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return node
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        nodeId: z.string(),
        credentialId: z.string(),
        to: z.string().max(1000).default(""),
        subject: z.string().max(500).default(""),
        body: z.string().max(10000).default(""),
        isHtml: z.boolean().default(false),
        cc: z.string().default(""),
        bcc: z.string().default(""),
        replyTo: z.string().default(""),
        messageId: z.string().default(""),
        threadId: z.string().default(""),
        searchQuery: z.string().default(""),
        maxResults: z.number().min(1).max(50).default(10),
        labelIds: z.string().default(""),
        includeBody: z.boolean().default(true),
        includeHeaders: z.boolean().default(false),
        pageToken: z.string().default(""),
        attachmentData: z.string().default(""),
        attachmentName: z.string().default(""),
        attachmentMime: z.string().default("application/octet-stream"),
        attachmentId: z.string().default(""),
        attachmentOutputFormat: z.string().default("base64"),
        removeLabelIds: z.string().default(""),
        labelName: z.string().default(""),
        draftId: z.string().default(""),
        messageIds: z.string().default(""),
        operation: z.nativeEnum(GmailOperation).default(GmailOperation.SEND),
        variableName: z.string().default("gmail"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== ctx.auth.user.id) {
        throw new Error("Unauthorized")
      }
      const data = buildGmailData(input)
      return prisma.gmailNode.upsert({
        where: { nodeId: input.nodeId },
        create: { workflowId: input.workflowId, nodeId: input.nodeId, ...data },
        update: data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.gmailNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new Error("Unauthorized")
      }
      return prisma.gmailNode.delete({ where: { nodeId: input.nodeId } })
    }),

  activateWatch: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        nodeId: z.string(),
        credentialId: z.string(),
        filterQuery: z.string().default(""),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const credential = await prisma.credential.findUnique({
        where: { id: input.credentialId, userId: ctx.auth.user.id },
      })
      if (!credential) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found" })
      }

      // Get access token
      const raw = decrypt(credential.value)
      let parsed: Record<string, unknown>
      try { parsed = JSON.parse(raw) } catch { parsed = { refreshToken: raw } }
      const refreshToken = parsed.refreshToken as string | undefined
      if (!refreshToken) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing refreshToken" })
      }

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
      if (!tokenRes.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Token refresh failed" })
      }
      const tokenData = (await tokenRes.json()) as { access_token: string }

      // Get email address
      const profileRes = await fetch(`${GMAIL_API}/profile`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const profile = profileRes.ok
        ? ((await profileRes.json()) as { emailAddress?: string })
        : { emailAddress: "" }
      const email = profile.emailAddress ?? ""

      // Register Gmail watch
      const topicName = process.env.GMAIL_PUBSUB_TOPIC_NAME ?? ""
      if (!topicName) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "GMAIL_PUBSUB_TOPIC_NAME not configured" })
      }

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
      if (!watchRes.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gmail watch registration failed: ${watchRes.status}`,
        })
      }
      const watchData = (await watchRes.json()) as { historyId: string; expiration: string }

      return prisma.gmailWatcher.upsert({
        where: { nodeId: input.nodeId },
        create: {
          workflowId: input.workflowId,
          nodeId: input.nodeId,
          credentialId: input.credentialId,
          email,
          active: true,
          lastHistoryId: watchData.historyId,
          expiration: watchData.expiration,
          filterQuery: input.filterQuery,
        },
        update: {
          active: true,
          credentialId: input.credentialId,
          email,
          lastHistoryId: watchData.historyId,
          expiration: watchData.expiration,
          filterQuery: input.filterQuery,
        },
      })
    }),

  deactivateWatch: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const watcher = await prisma.gmailWatcher.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!watcher || watcher.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      // Try to stop the watch
      try {
        const credential = await prisma.credential.findUnique({
          where: { id: watcher.credentialId },
        })
        if (credential) {
          const raw = decrypt(credential.value)
          let parsed: Record<string, unknown>
          try { parsed = JSON.parse(raw) } catch { parsed = { refreshToken: raw } }
          const refreshToken = parsed.refreshToken as string | undefined
          if (refreshToken) {
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
            if (tokenRes.ok) {
              const tokenData = (await tokenRes.json()) as { access_token: string }
              await fetch(`${GMAIL_API}/stop`, {
                method: "POST",
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
              })
            }
          }
        }
      } catch {
        // Best effort to stop watch
      }

      return prisma.gmailWatcher.update({
        where: { id: watcher.id },
        data: { active: false },
      })
    }),
})
