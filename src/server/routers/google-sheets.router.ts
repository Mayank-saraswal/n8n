import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

const ColumnValueSchema = z.object({
  column: z.string().min(1),
  value: z.string(),
})

const GoogleSheetsOpEnum = z.enum([
  "APPEND_ROW",
  "READ_ROWS",
  "UPDATE_ROW",
  "UPDATE_ROWS_BY_QUERY",
  "DELETE_ROW",
  "GET_ROW_BY_NUMBER",
  "SEARCH_ROWS",
  "CLEAR_RANGE",
  "CREATE_SHEET",
  "GET_SHEET_INFO",
])

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
        operation: GoogleSheetsOpEnum,
        spreadsheetId: z.string().min(1),
        sheetName: z.string().default("Sheet1"),
        range: z.string().default("A:Z"),
        rowData: z.array(ColumnValueSchema).default([]),
        credentialId: z.string(),
        variableName: z.string().default("googleSheets"),
        headerRow: z.boolean().default(true),
        rowNumber: z.string().default(""),
        rowValues: z.string().default(""),
        searchColumn: z.string().default(""),
        searchValue: z.string().default(""),
        clearRange: z.string().default(""),
        newSheetName: z.string().default(""),
        valueInputOption: z.string().default("USER_ENTERED"),
        matchColumn: z.string().default(""),
        matchValue: z.string().default(""),
        updateValues: z.string().default(""),
        maxResults: z.number().int().min(1).max(10000).default(100),
        includeEmptyRows: z.boolean().default(false),
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
          variableName: input.variableName,
          headerRow: input.headerRow,
          rowNumber: input.rowNumber,
          rowValues: input.rowValues,
          searchColumn: input.searchColumn,
          searchValue: input.searchValue,
          clearRange: input.clearRange,
          newSheetName: input.newSheetName,
          valueInputOption: input.valueInputOption,
          matchColumn: input.matchColumn,
          matchValue: input.matchValue,
          updateValues: input.updateValues,
          maxResults: input.maxResults,
          includeEmptyRows: input.includeEmptyRows,
        },
        update: {
          operation: input.operation,
          spreadsheetId: input.spreadsheetId,
          sheetName: input.sheetName,
          range: input.range,
          rowData: input.rowData,
          credentialId: input.credentialId,
          variableName: input.variableName,
          headerRow: input.headerRow,
          rowNumber: input.rowNumber,
          rowValues: input.rowValues,
          searchColumn: input.searchColumn,
          searchValue: input.searchValue,
          clearRange: input.clearRange,
          newSheetName: input.newSheetName,
          valueInputOption: input.valueInputOption,
          matchColumn: input.matchColumn,
          matchValue: input.matchValue,
          updateValues: input.updateValues,
          maxResults: input.maxResults,
          includeEmptyRows: input.includeEmptyRows,
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
