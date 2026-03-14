import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { IfElseOperator } from "@/generated/prisma"

export const IfElseOperatorSchema = z.nativeEnum(IfElseOperator)

export const ifElseRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.ifElseNode
        .findUnique({
          where: { nodeId: input.nodeId },
          include: { workflow: { select: { userId: true } } },
        })
        .then((node) => {
          if (!node) return null
          // Ownership check
          if (node.workflow.userId !== ctx.auth.user.id) return null
          return node
        })
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        nodeId: z.string(),
        field: z.string().max(500),
        operator: IfElseOperatorSchema,
        value: z.string().max(1000),
        conditionsJson: z.string().max(50000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify workflow ownership
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== ctx.auth.user.id) {
        throw new Error("Unauthorized")
      }
      return prisma.ifElseNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          workflowId: input.workflowId,
          nodeId: input.nodeId,
          field: input.field,
          operator: input.operator,
          value: input.value,
          conditionsJson: input.conditionsJson ?? "",
        },
        update: {
          field: input.field,
          operator: input.operator,
          value: input.value,
          conditionsJson: input.conditionsJson ?? "",
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.ifElseNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new Error("Unauthorized")
      }
      return prisma.ifElseNode.delete({ where: { nodeId: input.nodeId } })
    }),
})
