import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const googleDriveRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.googleDriveNode.findUnique({
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
        operation: z.enum(["UPLOAD_FILE", "DOWNLOAD_FILE", "LIST_FILES", "CREATE_FOLDER"]),
        credentialId: z.string().optional(),
        folderId: z.string().optional(),
        fileId: z.string().optional(),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
        query: z.string().optional(),
        maxResults: z.number().int().min(1).max(100).default(10),
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

      return prisma.googleDriveNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          operation: input.operation,
          credentialId: input.credentialId,
          folderId: input.folderId,
          fileId: input.fileId,
          fileName: input.fileName,
          mimeType: input.mimeType,
          query: input.query,
          maxResults: input.maxResults,
        },
        update: {
          operation: input.operation,
          credentialId: input.credentialId,
          folderId: input.folderId,
          fileId: input.fileId,
          fileName: input.fileName,
          mimeType: input.mimeType,
          query: input.query,
          maxResults: input.maxResults,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.googleDriveNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id)
        throw new Error("Unauthorized")
      return prisma.googleDriveNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
