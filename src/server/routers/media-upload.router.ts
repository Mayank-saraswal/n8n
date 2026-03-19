import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { MediaUploadSource } from "@/generated/prisma"
import { TRPCError } from "@trpc/server"

export const mediaUploadRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.mediaUploadNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      const { workflow: _, ...nodeData } = node
      return nodeData
    }),

  upsert: protectedProcedure
    .input(z.object({
      nodeId: z.string(),
      workflowId: z.string(),
      source: z.nativeEnum(MediaUploadSource).default(MediaUploadSource.URL),
      inputField: z.string().default(""),
      mimeTypeHint: z.string().default("image/png"),
      filename: z.string().default(""),
      credentialId: z.string().nullable().optional(),
      variableName: z.string().default("media"),
      continueOnFail: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.mediaUploadNode.upsert({
        where: { nodeId: input.nodeId },
        create: { ...input },
        update: { ...input },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.mediaUploadNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.mediaUploadNode.delete({ where: { nodeId: input.nodeId } })
    }),
})
