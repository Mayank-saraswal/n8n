import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"
import { FreshdeskOperation } from "@/generated/prisma"

const freshdeskOperationSchema = z.nativeEnum(FreshdeskOperation)

export const freshdeskRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.freshdeskNode.findUnique({
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
        operation: freshdeskOperationSchema.default(FreshdeskOperation.CREATE_TICKET),
        variableName: z.string().default("freshdesk"),

        // Ticket fields
        subject: z.string().default(""),
        description: z.string().default(""),
        descriptionHtml: z.string().default(""),
        email: z.string().default(""),
        name: z.string().default(""),
        phone: z.string().default(""),
        mobilePhone: z.string().default(""),
        subject2: z.string().default(""),
        ticketId: z.string().default(""),
        priority: z.number().int().default(2),
        status: z.number().int().default(2),
        source: z.number().int().default(2),
        ticketType: z.string().default(""),
        responderId: z.string().default(""),
        groupId: z.string().default(""),
        productId: z.string().default(""),
        companyId: z.string().default(""),
        fwdEmail: z.string().default(""),
        tags: z.string().default(""),
        customFields: z.string().default("{}"),

        // Note fields
        noteId: z.string().default(""),
        noteBody: z.string().default(""),
        notePrivate: z.boolean().default(false),
        noteUserId: z.string().default(""),

        // Contact fields
        contactId: z.string().default(""),
        contactEmail: z.string().default(""),
        contactName: z.string().default(""),
        contactPhone: z.string().default(""),
        contactMobile: z.string().default(""),
        contactJobTitle: z.string().default(""),
        contactTimeZone: z.string().default(""),
        contactLanguage: z.string().default(""),
        contactTags: z.string().default(""),
        contactCompanyId: z.string().default(""),
        mergeTargetId: z.string().default(""),

        // Company fields
        companyName: z.string().default(""),
        companyDomain: z.string().default(""),
        companyDescription: z.string().default(""),
        companyNote: z.string().default(""),

        // Agent fields
        agentId: z.string().default(""),

        // Reply fields
        replyBody: z.string().default(""),
        replyFrom: z.string().default(""),
        replyTo: z.string().default(""),
        replyCc: z.string().default(""),
        replyBcc: z.string().default(""),

        // Search / filter
        searchQuery: z.string().default(""),
        filterBy: z.string().default(""),
        orderBy: z.string().default("created_at"),
        orderType: z.string().default("desc"),
        page: z.number().int().default(1),
        perPage: z.number().int().default(30),
        updatedSince: z.string().default(""),
        includeStats: z.boolean().default(false),

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
      return prisma.freshdeskNode.upsert({
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
      const node = await prisma.freshdeskNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.freshdeskNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
