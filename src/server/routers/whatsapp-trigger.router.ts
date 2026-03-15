import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const whatsappTriggerRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.whatsAppTrigger
        .findUnique({
          where: { nodeId: input.nodeId },
          include: { workflow: { select: { userId: true } } },
        })
        .then((node) => {
          if (!node) return null
          if (node.workflow.userId !== ctx.auth.user.id) return null
          return node
        })
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        phoneNumberId: z.string().max(100).default(""),
        activeEvents: z.array(z.string()).default([]),
        messageTypes: z.array(z.string()).default([]),
        ignoreOwnMessages: z.boolean().default(true),
        variableName: z.string().max(200).default("whatsappTrigger"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const { nodeId, workflowId, activeEvents, messageTypes, ...data } = input

      return prisma.whatsAppTrigger.upsert({
        where: { nodeId },
        create: {
          nodeId,
          workflowId,
          activeEvents: JSON.stringify(activeEvents),
          messageTypes: JSON.stringify(messageTypes),
          ...data,
        },
        update: {
          activeEvents: JSON.stringify(activeEvents),
          messageTypes: JSON.stringify(messageTypes),
          ...data,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.whatsAppTrigger.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.whatsAppTrigger.delete({ where: { nodeId: input.nodeId } })
    }),
})
