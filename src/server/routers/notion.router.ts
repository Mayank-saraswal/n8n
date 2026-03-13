import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const notionRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.notionNode.findUnique({
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
          "QUERY_DATABASE",
          "CREATE_DATABASE_PAGE",
          "UPDATE_DATABASE_PAGE",
          "GET_PAGE",
          "ARCHIVE_PAGE",
          "APPEND_BLOCK",
          "GET_BLOCK_CHILDREN",
          "SEARCH",
          "GET_DATABASE",
          "GET_USER",
          "GET_USERS",
        ]),
        databaseId: z.string().default(""),
        pageId: z.string().default(""),
        blockContent: z.string().default(""),
        searchQuery: z.string().default(""),
        filterJson: z.string().default("{}"),
        sortsJson: z.string().default("[]"),
        propertiesJson: z.string().default("{}"),
        notionUserId: z.string().default(""),
        pageSize: z.number().min(1).max(100).default(100),
        startCursor: z.string().default(""),
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

      return prisma.notionNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          credentialId: input.credentialId,
          operation: input.operation,
          databaseId: input.databaseId,
          pageId: input.pageId,
          blockContent: input.blockContent,
          searchQuery: input.searchQuery,
          filterJson: input.filterJson,
          sortsJson: input.sortsJson,
          propertiesJson: input.propertiesJson,
          notionUserId: input.notionUserId,
          pageSize: input.pageSize,
          startCursor: input.startCursor,
        },
        update: {
          credentialId: input.credentialId,
          operation: input.operation,
          databaseId: input.databaseId,
          pageId: input.pageId,
          blockContent: input.blockContent,
          searchQuery: input.searchQuery,
          filterJson: input.filterJson,
          sortsJson: input.sortsJson,
          propertiesJson: input.propertiesJson,
          notionUserId: input.notionUserId,
          pageSize: input.pageSize,
          startCursor: input.startCursor,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.notionNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id)
        throw new Error("Unauthorized")
      return prisma.notionNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
