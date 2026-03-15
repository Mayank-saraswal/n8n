import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const codeRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.codeNode
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
        code: z.string(),
        language: z.string().default("javascript"),
        outputMode: z.enum(["append", "replace", "raw"]).default("append"),
        timeout: z.number().int().min(100).max(30000).default(5000),
        continueOnFail: z.boolean().default(false),
        allowedDomains: z.string().default(""),
        variableName: z.string().default("codeOutput"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== userId) {
        throw new Error("Unauthorized")
      }

      return prisma.codeNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          code: input.code,
          language: input.language,
          outputMode: input.outputMode,
          timeout: input.timeout,
          continueOnFail: input.continueOnFail,
          allowedDomains: input.allowedDomains,
          variableName: input.variableName,
        },
        update: {
          code: input.code,
          language: input.language,
          outputMode: input.outputMode,
          timeout: input.timeout,
          continueOnFail: input.continueOnFail,
          allowedDomains: input.allowedDomains,
          variableName: input.variableName,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.codeNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new Error("Unauthorized")
      }
      return prisma.codeNode.delete({ where: { nodeId: input.nodeId } })
    }),
})
