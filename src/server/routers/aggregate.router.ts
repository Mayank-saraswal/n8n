import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"
import { aggregateChannelName } from "@/inngest/channels/aggregate"

const aggregateOpSchema = z.object({
  id: z.string(),
  operation: z.string(),
  field: z.string().default(""),
  label: z.string(),
  separator: z.string().optional(),
  percentile: z.number().optional(),
})

const ALL_OPERATIONS = [
  "COUNT", "SUM", "AVERAGE", "MIN", "MAX", "MEDIAN", "MODE",
  "STANDARD_DEVIATION", "CONCATENATE", "FIRST", "LAST", "DISTINCT",
  "GROUP_BY", "PIVOT", "PERCENTILE", "FREQUENCY_DISTRIBUTION", "MULTI",
] as const

export const aggregateRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.aggregateNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      const { workflow: _wf, ...safeFields } = node
      return safeFields
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        operation: z.enum(ALL_OPERATIONS).default("COUNT"),
        inputPath: z.string().default(""),
        field: z.string().default(""),
        groupByField: z.string().default(""),
        pivotRowField: z.string().default(""),
        pivotColField: z.string().default(""),
        pivotValueField: z.string().default(""),
        pivotValueOp: z.enum(["SUM", "COUNT", "AVERAGE", "MIN", "MAX"]).default("SUM"),
        separator: z.string().default(", "),
        percentile: z.number().min(0).max(100).default(90),
        countFilter: z.string().default(""),
        multiOps: z.string().default("[]"),
        groupAggOps: z.string().default("[]"),
        variableName: z.string().min(1).max(100).default("aggregate"),
        includeInput: z.boolean().default(false),
        sortOutput: z.boolean().default(true),
        topN: z.number().int().min(0).default(0),
        nullHandling: z.enum(["exclude", "include_as_zero", "include_as_null"]).default("exclude"),
        roundDecimals: z.number().int().min(0).max(10).default(2),
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
      try {
        JSON.parse(input.multiOps)
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "multiOps must be valid JSON" })
      }
      try {
        JSON.parse(input.groupAggOps)
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "groupAggOps must be valid JSON" })
      }

      const { nodeId, workflowId, ...fields } = input

      return prisma.aggregateNode.upsert({
        where: { nodeId },
        create: { nodeId, workflowId, ...fields },
        update: fields,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.aggregateNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) throw new TRPCError({ code: "NOT_FOUND" })
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.aggregateNode.delete({ where: { nodeId: input.nodeId } })
    }),

  getToken: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const token = await getSubscriptionToken(inngest, {
        channel: aggregateChannelName(input.nodeId),
        topics: ["status"],
      })
      return { token }
    }),
})
