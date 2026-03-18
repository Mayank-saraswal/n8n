import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { ZohoCrmOperation } from "@/generated/prisma"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"
import { ZOHO_CRM_CHANNEL } from "@/features/executions/components/zoho-crm/channels"

export const zohoCrmRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(z.object({
      nodeId: z.string(),
      workflowId: z.string(),
      credentialId: z.string().optional(),
      operation: z.nativeEnum(ZohoCrmOperation),
      variableName: z.string().default("zoho"),
      module: z.string().default("Leads"),
      recordId: z.string().default(""),
      firstName: z.string().default(""),
      lastName: z.string().default(""),
      email: z.string().default(""),
      phone: z.string().default(""),
      mobile: z.string().default(""),
      company: z.string().default(""),
      title: z.string().default(""),
      website: z.string().default(""),
      leadSource: z.string().default(""),
      leadStatus: z.string().default(""),
      industry: z.string().default(""),
      annualRevenue: z.string().default(""),
      noOfEmployees: z.string().default(""),
      rating: z.string().default(""),
      description: z.string().default(""),
      street: z.string().default(""),
      city: z.string().default(""),
      state: z.string().default(""),
      country: z.string().default("India"),
      zipCode: z.string().default(""),
      dealName: z.string().default(""),
      dealStage: z.string().default(""),
      dealAmount: z.string().default(""),
      closingDate: z.string().default(""),
      accountName: z.string().default(""),
      contactName: z.string().default(""),
      probability: z.string().default(""),
      dealType: z.string().default(""),
      accountOwner: z.string().default(""),
      billingCity: z.string().default(""),
      billingState: z.string().default(""),
      subject: z.string().default(""),
      dueDate: z.string().default(""),
      priority: z.string().default("High"),
      status: z.string().default("Not Started"),
      whoId: z.string().default(""),
      whatId: z.string().default(""),
      whoModule: z.string().default("Contacts"),
      whatModule: z.string().default("Deals"),
      callDuration: z.string().default(""),
      callDirection: z.string().default("Outbound"),
      callResult: z.string().default(""),
      callStartTime: z.string().default(""),
      callDescription: z.string().default(""),
      meetingStart: z.string().default(""),
      meetingEnd: z.string().default(""),
      meetingAgenda: z.string().default(""),
      participants: z.string().default("[]"),
      noteTitle: z.string().default(""),
      noteContent: z.string().default(""),
      parentModule: z.string().default("Leads"),
      searchTerm: z.string().default(""),
      searchField: z.string().default("Email"),
      criteria: z.string().default(""),
      page: z.number().default(1),
      perPage: z.number().default(10),
      createDeal: z.boolean().default(false),
      overwrite: z.boolean().default(false),
      customFields: z.string().default("{}"),
      duplicateCheckField: z.string().default("Email"),
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

      const { nodeId, workflowId, ...fields } = input

      return prisma.zohoCrmNode.upsert({
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

  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.zohoCrmNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return node
    }),

  get: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.zohoCrmNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return node
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.zohoCrmNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.zohoCrmNode.delete({ where: { nodeId: input.nodeId } })
    }),

  getToken: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const token = await getSubscriptionToken(inngest, {
        channel: ZOHO_CRM_CHANNEL + (input.nodeId ? `:${input.nodeId}` : ""),
        topics: ["status"],
      })
      return { token }
    }),
})
