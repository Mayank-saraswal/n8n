import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const gmailRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.gmailNode
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
        credentialId: z.string(),
        to: z.string().max(1000),
        subject: z.string().max(500),
        body: z.string().max(10000),
        isHtml: z.boolean().default(false),
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
          to: input.to,
          subject: input.subject,
          body: input.body,
          isHtml: input.isHtml,
        },
        update: {
          credentialId: input.credentialId,
          to: input.to,
          subject: input.subject,
          body: input.body,
          isHtml: input.isHtml,
        },
      })
    }),
})
