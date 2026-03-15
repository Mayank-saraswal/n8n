import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const waitRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.waitNode
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
        waitMode: z.enum(["duration", "until", "webhook"]).default("duration"),
        duration: z.number().int().min(1).default(30),
        durationUnit: z
          .enum(["seconds", "minutes", "hours", "days", "weeks"])
          .default("minutes"),
        untilDatetime: z.string().default(""),
        timezone: z.string().default("UTC"),
        timeoutDuration: z.number().int().min(1).default(24),
        timeoutUnit: z
          .enum(["seconds", "minutes", "hours", "days", "weeks"])
          .default("hours"),
        continueOnTimeout: z.boolean().default(true),
        variableName: z.string().default("wait"),
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

      return prisma.waitNode.upsert({
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
      const node = await prisma.waitNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.waitNode.delete({ where: { nodeId: input.nodeId } })
    }),
})
