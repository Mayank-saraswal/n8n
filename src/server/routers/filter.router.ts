import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"
import { filterChannelName } from "@/inngest/channels/filter"

export const filterRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.filterNode.findUnique({
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
        operation: z.enum(["FILTER_ARRAY", "FILTER_OBJECT_KEYS"]).default("FILTER_ARRAY"),
        inputArray: z.string().default(""),
        inputObject: z.string().default(""),
        conditionGroups: z.string().default("[]"),
        rootLogic: z.enum(["AND", "OR"]).default("AND"),
        outputMode: z.enum(["filtered", "rejected", "both", "stats_only"]).default("filtered"),
        variableName: z.string().min(1).max(100).default("filter"),
        stopOnEmpty: z.boolean().default(false),
        includeMetadata: z.boolean().default(false),
        continueOnFail: z.boolean().default(false),
        keyFilterMode: z.enum(["key_name", "key_value", "both"]).default("key_name"),
        keepMatching: z.boolean().default(true),
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

      // Validate conditionGroups is valid JSON
      try {
        JSON.parse(input.conditionGroups)
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "conditionGroups must be valid JSON",
        })
      }

      const { nodeId, workflowId, ...fields } = input

      return prisma.filterNode.upsert({
        where: { nodeId },
        create: { nodeId, workflowId, ...fields },
        update: fields,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.filterNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) throw new TRPCError({ code: "NOT_FOUND" })
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.filterNode.delete({ where: { nodeId: input.nodeId } })
    }),

  getToken: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const token = await getSubscriptionToken(inngest, {
        channel: filterChannelName(input.nodeId),
        topics: ["status"],
      })
      return { token }
    }),
})
