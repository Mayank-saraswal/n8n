import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"
import { postgresChannelName } from "@/inngest/channels/postgres"
import { testConnection } from "@/features/executions/components/postgres/postgres-engine"
import type { PostgresConnectionConfig } from "@/features/executions/components/postgres/postgres-engine"
import { decrypt } from "@/lib/encryption"

const ALL_OPERATIONS = [
  "EXECUTE_QUERY", "SELECT", "SELECT_ONE", "COUNT", "EXISTS",
  "INSERT", "UPDATE", "DELETE", "UPSERT", "INSERT_MANY",
  "EXECUTE_TRANSACTION", "GET_TABLE_SCHEMA", "LIST_TABLES",
  "LIST_SCHEMAS", "CREATE_TABLE", "DROP_TABLE", "EXECUTE_FUNCTION",
  "COPY_FROM", "EXECUTE_EXPLAIN", "FULL_TEXT_SEARCH",
  "JSON_PATH_QUERY", "JSON_SET_FIELD", "JSON_AGGREGATE"
] as const

export const postgresRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.postgresNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      // Strip workflow connection to avoid leaking info
      const { workflow: _wf, ...safeFields } = node
      return safeFields
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        operation: z.enum(ALL_OPERATIONS).default("EXECUTE_QUERY"),
        credentialId: z.string().nullable().optional(),
        tableName: z.string().default(""),
        schemaName: z.string().default("public"),
        selectColumns: z.string().default("[]"),
        whereConditions: z.string().default("[]"),
        orderBy: z.string().default("[]"),
        limitRows: z.number().int().min(0).default(0),
        offsetRows: z.number().int().min(0).default(0),
        joins: z.string().default("[]"),
        insertData: z.string().default(""),
        conflictColumns: z.string().default("[]"),
        updateOnConflict: z.string().default("[]"),
        updateData: z.string().default(""),
        insertManyPath: z.string().default(""),
        insertManyColumns: z.string().default("[]"),
        query: z.string().default(""),
        queryParams: z.string().default("[]"),
        transactionStatements: z.string().default("[]"),
        functionName: z.string().default(""),
        functionArgs: z.string().default("[]"),
        searchColumn: z.string().default(""),
        searchQuery: z.string().default(""),
        searchLanguage: z.string().default("english"),
        searchLimit: z.number().int().min(1).default(10),
        jsonColumn: z.string().default(""),
        jsonPath: z.string().default(""),
        jsonSetColumn: z.string().default(""),
        jsonSetPath: z.string().default(""),
        jsonSetValue: z.string().default(""),
        columnDefinitions: z.string().default("[]"),
        createTableIfNotExists: z.boolean().default(true),
        variableName: z.string().min(1).default("postgres"),
        returnData: z.boolean().default(true),
        continueOnFail: z.boolean().default(false),
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

      // Validate JSON fields
      const jsonFields = [
        "selectColumns", "whereConditions", "orderBy", "joins",
        "conflictColumns", "updateOnConflict", "insertManyColumns",
        "queryParams", "transactionStatements", "functionArgs",
        "columnDefinitions"
      ] as const

      for (const field of jsonFields) {
        try {
          JSON.parse(input[field] as string)
        } catch {
          throw new TRPCError({ code: "BAD_REQUEST", message: `${field} must be valid JSON` })
        }
      }

      const { nodeId, workflowId, ...fields } = input

      // Handle nullable credentialId correctly for Prisma
      const dataToSave = {
        ...fields,
        credentialId: fields.credentialId || null,
      }

      return prisma.postgresNode.upsert({
        where: { nodeId },
        create: { nodeId, workflowId, ...dataToSave },
        update: dataToSave,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.postgresNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) throw new TRPCError({ code: "NOT_FOUND" })
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.postgresNode.delete({ where: { nodeId: input.nodeId } })
    }),

  getToken: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const token = await getSubscriptionToken(inngest, {
        channel: postgresChannelName(input.nodeId), // String — per Rule 5
        topics: ["status"],
      })
      return { token }
    }),

  testConnection: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const credential = await prisma.credential.findFirst({
        where: { id: input.credentialId, userId: ctx.auth.user.id }
      })
      // Using prisma.credential, fallback to type casting if schema still says 'Credenial' 
      // User noted: `prisma.credenial.findFirst` if Prisma schema typo is present. Let's use any if TS complains
      // Let's use string keys for generic query if needed
      if (!credential) {
         // Fallback to "Credenial" if not fixed
         const fallbackCred = await (prisma as any).credenial?.findFirst?.({
           where: { id: input.credentialId, userId: ctx.auth.user.id }
         })
         if (!fallbackCred) {
           throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found" })
         }
         const config = JSON.parse(decrypt(fallbackCred.value)) as PostgresConnectionConfig
         const result = await testConnection(config)
         if (!result.success) {
           throw new TRPCError({ code: "BAD_REQUEST", message: result.error ?? "Connection failed" })
         }
         return { latencyMs: result.latencyMs, success: true }
      }

      const config = JSON.parse(decrypt(credential.value)) as PostgresConnectionConfig
      const result = await testConnection(config)

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error ?? "Connection failed"
        })
      }

      return { latencyMs: result.latencyMs, success: true }
    }),
})
