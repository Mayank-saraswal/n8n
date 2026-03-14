import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { GmailOperation } from "@/generated/prisma"
import { TRPCError } from "@trpc/server"

export const gmailRouter = createTRPCRouter({
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
