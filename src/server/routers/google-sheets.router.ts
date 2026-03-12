import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

const ColumnValueSchema = z.object({
  column: z.string().min(1),
  value: z.string(),
})

export const googleSheetsRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.googleSheetsNode.findUnique({
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
        operation: z.enum(["APPEND_ROW", "READ_ROWS"]),
        spreadsheetId: z.string().min(1),
        sheetName: z.string().default("Sheet1"),
        range: z.string().default("A:Z"),
        rowData: z.array(ColumnValueSchema).default([]),
        credentialId: z.string(),
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

      return prisma.googleSheetsNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          operation: input.operation,
          spreadsheetId: input.spreadsheetId,
          sheetName: input.sheetName,
          range: input.range,
          rowData: input.rowData,
          credentialId: input.credentialId,
        },
        update: {
          operation: input.operation,
          spreadsheetId: input.spreadsheetId,
          sheetName: input.sheetName,
          range: input.range,
          rowData: input.rowData,
          credentialId: input.credentialId,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.googleSheetsNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id)
        throw new Error("Unauthorized")
      return prisma.googleSheetsNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
