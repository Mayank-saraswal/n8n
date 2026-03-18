import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"
import { HubspotOperation } from "@/generated/prisma"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"
import { HUBSPOT_CHANNEL_NAME } from "@/inngest/channels/hubspot"

const hubspotOperationSchema = z.nativeEnum(HubspotOperation)

export const hubspotRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.hubspotNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return node
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        credentialId: z.string().optional(),
        operation: hubspotOperationSchema.default(HubspotOperation.CREATE_CONTACT),
        variableName: z.string().default("hubspot"),
        objectType: z.string().default("contacts"),
        recordId: z.string().default(""),

        email: z.string().default(""),
        firstName: z.string().default(""),
        lastName: z.string().default(""),
        phone: z.string().default(""),
        website: z.string().default(""),
        company: z.string().default(""),
        jobTitle: z.string().default(""),
        lifecycleStage: z.string().default(""),
        leadStatus: z.string().default(""),

        companyName: z.string().default(""),
        domain: z.string().default(""),
        industry: z.string().default(""),
        annualRevenue: z.string().default(""),
        numberOfEmployees: z.string().default(""),
        city: z.string().default(""),
        state: z.string().default(""),
        country: z.string().default("India"),

        dealName: z.string().default(""),
        dealStage: z.string().default(""),
        pipeline: z.string().default("default"),
        amount: z.string().default(""),
        closeDate: z.string().default(""),
        dealType: z.string().default(""),
        priority: z.string().default(""),

        ticketName: z.string().default(""),
        ticketPipeline: z.string().default("0"),
        ticketStatus: z.string().default(""),
        ticketPriority: z.string().default(""),
        ticketDescription: z.string().default(""),
        ticketSource: z.string().default(""),

        noteBody: z.string().default(""),
        taskSubject: z.string().default(""),
        taskBody: z.string().default(""),
        taskStatus: z.string().default("NOT_STARTED"),
        taskPriority: z.string().default("NONE"),
        taskDueDate: z.string().default(""),
        callBody: z.string().default(""),
        callDuration: z.string().default(""),
        callDirection: z.string().default("OUTBOUND"),
        callDisposition: z.string().default(""),
        emailSubject: z.string().default(""),
        emailBody: z.string().default(""),
        emailFrom: z.string().default(""),
        emailTo: z.string().default(""),

        fromObjectType: z.string().default("contacts"),
        fromObjectId: z.string().default(""),
        toObjectType: z.string().default("deals"),
        toObjectId: z.string().default(""),
        associationType: z.string().default(""),

        listId: z.string().default(""),

        searchQuery: z.string().default(""),
        filterProperty: z.string().default(""),
        filterOperator: z.string().default("EQ"),
        filterValue: z.string().default(""),
        sortProperty: z.string().default("createdate"),
        sortDirection: z.string().default("DESCENDING"),
        limit: z.number().int().default(10),
        after: z.string().default(""),

        customProperties: z.string().default("{}"),

        continueOnFail: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const { nodeId, workflowId, ...fields } = input
      return prisma.hubspotNode.upsert({
        where: { nodeId },
        create: {
          nodeId,
          workflowId,
          ...fields,
        },
        update: {
          ...fields,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.hubspotNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.hubspotNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),

  getToken: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const token = await getSubscriptionToken(inngest, {
        channel: `${HUBSPOT_CHANNEL_NAME}:${input.nodeId}`,
        topics: ["status"],
      })
      return { token }
    }),
})
