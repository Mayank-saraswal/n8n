import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const whatsappRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.whatsAppNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) return null
      return node
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        credentialId: z.string().optional(),
        operation: z.enum([
          "SEND_TEXT",
          "SEND_TEMPLATE",
          "SEND_IMAGE",
          "SEND_DOCUMENT",
          "SEND_REACTION",
        ]),
        to: z.string().default(""),
        body: z.string().default(""),
        templateName: z.string().default(""),
        templateLang: z.string().default("en_US"),
        templateParams: z.string().default("[]"),
        mediaUrl: z.string().default(""),
        mediaCaption: z.string().default(""),
        reactionEmoji: z.string().default(""),
        reactionMsgId: z.string().default(""),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== userId)
        throw new Error("Unauthorized")

      return prisma.whatsAppNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          credentialId: input.credentialId,
          operation: input.operation,
          to: input.to,
          body: input.body,
          templateName: input.templateName,
          templateLang: input.templateLang,
          templateParams: input.templateParams,
          mediaUrl: input.mediaUrl,
          mediaCaption: input.mediaCaption,
          reactionEmoji: input.reactionEmoji,
          reactionMsgId: input.reactionMsgId,
        },
        update: {
          credentialId: input.credentialId,
          operation: input.operation,
          to: input.to,
          body: input.body,
          templateName: input.templateName,
          templateLang: input.templateLang,
          templateParams: input.templateParams,
          mediaUrl: input.mediaUrl,
          mediaCaption: input.mediaCaption,
          reactionEmoji: input.reactionEmoji,
          reactionMsgId: input.reactionMsgId,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.whatsAppNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id)
        throw new Error("Unauthorized")
      return prisma.whatsAppNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
