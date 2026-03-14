import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { GmailOperation } from "@/generated/prisma"
import { TRPCError } from "@trpc/server"
import { decrypt } from "@/lib/encryption"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"

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
            client_id: process.env.GOOGLE_GMAIL_CLIENT_ID,
            client_secret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
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
      return prisma.gmailNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          workflowId: input.workflowId,
          nodeId: input.nodeId,
          credentialId: input.credentialId,
          operation: input.operation,
          variableName: input.variableName,
          to: input.to,
          subject: input.subject,
          body: input.body,
          isHtml: input.isHtml,
          cc: input.cc,
          bcc: input.bcc,
          replyTo: input.replyTo,
          messageId: input.messageId,
          threadId: input.threadId,
          searchQuery: input.searchQuery,
          maxResults: input.maxResults,
          labelIds: input.labelIds,
          includeBody: input.includeBody,
          includeHeaders: input.includeHeaders,
          pageToken: input.pageToken,
          attachmentData: input.attachmentData,
          attachmentName: input.attachmentName,
          attachmentMime: input.attachmentMime,
        },
        update: {
          credentialId: input.credentialId,
          operation: input.operation,
          variableName: input.variableName,
          to: input.to,
          subject: input.subject,
          body: input.body,
          isHtml: input.isHtml,
          cc: input.cc,
          bcc: input.bcc,
          replyTo: input.replyTo,
          messageId: input.messageId,
          threadId: input.threadId,
          searchQuery: input.searchQuery,
          maxResults: input.maxResults,
          labelIds: input.labelIds,
          includeBody: input.includeBody,
          includeHeaders: input.includeHeaders,
          pageToken: input.pageToken,
          attachmentData: input.attachmentData,
          attachmentName: input.attachmentName,
          attachmentMime: input.attachmentMime,
        },
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
})
