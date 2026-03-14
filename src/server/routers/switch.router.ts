import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const switchRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.switchNode
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
        workflowId: z.string(),
        nodeId: z.string(),
        variableName: z.string().max(200).default("switch"),
        casesJson: z.string().max(50000).default("[]").refine(
          (val) => {
            try {
              const parsed = JSON.parse(val)
              return Array.isArray(parsed) && parsed.length <= 20
            } catch {
              return false
            }
          },
          { message: "Maximum 20 cases per Switch node. Use nested Switch nodes for more complex routing." }
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.switchNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          workflowId: input.workflowId,
          nodeId: input.nodeId,
          variableName: input.variableName,
          casesJson: input.casesJson,
        },
        update: {
          variableName: input.variableName,
          casesJson: input.casesJson,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.switchNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.switchNode.delete({ where: { nodeId: input.nodeId } })
    }),
})
