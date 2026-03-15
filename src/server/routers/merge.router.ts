import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const mergeRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.mergeNode
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
        inputCount: z.number().int().min(2).max(10).default(2),
        mergeMode: z
          .enum(["position", "combine", "crossJoin", "keyMatch", "keyDiff"])
          .default("combine"),
        matchKey1: z.string().max(500).default(""),
        matchKey2: z.string().max(500).default(""),
        positionFill: z.enum(["shortest", "longest"]).default("shortest"),
        branchKey1: z.string().max(200).default(""),
        branchKey2: z.string().max(200).default(""),
        branchKeys: z.string().max(2000).default(""),
        waitForAll: z.boolean().default(true),
        variableName: z.string().max(200).default("merge"),
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

      const { nodeId, workflowId, ...data } = input

      return prisma.mergeNode.upsert({
        where: { nodeId },
        create: {
          nodeId,
          workflowId,
          ...data,
        },
        update: data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.mergeNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.mergeNode.delete({ where: { nodeId: input.nodeId } })
    }),
})
