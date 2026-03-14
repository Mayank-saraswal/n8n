import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const slackRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.slackNode.findUnique({
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
          "MESSAGE_SEND_WEBHOOK",
          "MESSAGE_SEND",
          "MESSAGE_UPDATE",
          "MESSAGE_DELETE",
          "MESSAGE_GET_PERMALINK",
          "MESSAGE_SEARCH",
          "CHANNEL_CREATE",
          "CHANNEL_ARCHIVE",
          "CHANNEL_UNARCHIVE",
          "CHANNEL_INVITE",
          "CHANNEL_KICK",
          "CHANNEL_SET_TOPIC",
          "CHANNEL_SET_PURPOSE",
          "CHANNEL_HISTORY",
          "CHANNEL_INFO",
          "CHANNEL_LIST",
          "CHANNEL_RENAME",
          "USER_INFO",
          "USER_LIST",
          "USER_GET_PRESENCE",
          "REACTION_ADD",
          "REACTION_REMOVE",
          "REACTION_GET",
          "FILE_UPLOAD",
          "FILE_LIST",
          "FILE_INFO",
          "FILE_DELETE",
          "CONVERSATION_OPEN",
        ]),
        variableName: z.string().default("slack"),
        channel: z.string().default(""),
        message: z.string().default(""),
        threadTs: z.string().default(""),
        messageTs: z.string().default(""),
        searchQuery: z.string().default(""),
        channelName: z.string().default(""),
        channelTopic: z.string().default(""),
        channelPurpose: z.string().default(""),
        userId: z.string().default(""),
        emoji: z.string().default(""),
        fileComment: z.string().default(""),
        webhookUrl: z.string().default(""),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authUserId = ctx.auth.user.id
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== authUserId)
        throw new Error("Unauthorized")

      return prisma.slackNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          credentialId: input.credentialId,
          operation: input.operation,
          variableName: input.variableName,
          channel: input.channel,
          message: input.message,
          threadTs: input.threadTs,
          messageTs: input.messageTs,
          searchQuery: input.searchQuery,
          channelName: input.channelName,
          channelTopic: input.channelTopic,
          channelPurpose: input.channelPurpose,
          userId: input.userId,
          emoji: input.emoji,
          fileComment: input.fileComment,
          webhookUrl: input.webhookUrl,
        },
        update: {
          credentialId: input.credentialId,
          operation: input.operation,
          variableName: input.variableName,
          channel: input.channel,
          message: input.message,
          threadTs: input.threadTs,
          messageTs: input.messageTs,
          searchQuery: input.searchQuery,
          channelName: input.channelName,
          channelTopic: input.channelTopic,
          channelPurpose: input.channelPurpose,
          userId: input.userId,
          emoji: input.emoji,
          fileComment: input.fileComment,
          webhookUrl: input.webhookUrl,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.slackNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id)
        throw new Error("Unauthorized")
      return prisma.slackNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
