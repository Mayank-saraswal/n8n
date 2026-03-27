import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"
import { CashfreeOperation } from "@/generated/prisma"
import { getSubscriptionToken } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { cashfreeChannel } from "@/inngest/channels/cashfree"

export const cashfreeRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.cashfreeNode.findUnique({
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
        operation: z.nativeEnum(CashfreeOperation).default(CashfreeOperation.CREATE_ORDER),
        variableName: z.string().default("cashfree"),
        continueOnFail: z.boolean().default(false),
        // Order fields
        orderId: z.string().default(""),
        orderAmount: z.string().default(""),
        orderCurrency: z.string().default("INR"),
        orderNote: z.string().default(""),
        orderMeta: z.string().default("{}"),
        // Customer fields
        customerId: z.string().default(""),
        customerEmail: z.string().default(""),
        customerPhone: z.string().default(""),
        customerName: z.string().default(""),
        customerBankAccountNumber: z.string().default(""),
        customerBankIfsc: z.string().default(""),
        customerBankCode: z.string().default(""),
        // Payment fields
        cfPaymentId: z.string().default(""),
        cfOrderId: z.string().default(""),
        paymentMethod: z.string().default(""),
        // Refund fields
        refundId: z.string().default(""),
        refundAmount: z.string().default(""),
        refundNote: z.string().default(""),
        refundSpeed: z.string().default("STANDARD"),
        refundSplits: z.string().default("[]"),
        // Settlement fields
        settlementId: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default(""),
        cursor: z.string().default(""),
        limit: z.number().int().default(10),
        // Payment link fields
        linkId: z.string().default(""),
        linkAmount: z.string().default(""),
        linkCurrency: z.string().default("INR"),
        linkPurpose: z.string().default(""),
        linkDescription: z.string().default(""),
        linkExpiryTime: z.string().default(""),
        linkNotifyPhone: z.boolean().default(true),
        linkNotifyEmail: z.boolean().default(true),
        linkAutoReminders: z.boolean().default(true),
        linkMinPartialAmount: z.string().default(""),
        linkMeta: z.string().default("{}"),
        // Subscription fields
        subscriptionId: z.string().default(""),
        planId: z.string().default(""),
        planName: z.string().default(""),
        planType: z.string().default("PERIODIC"),
        planIntervalType: z.string().default("MONTH"),
        planIntervals: z.number().int().default(1),
        planMaxCycles: z.number().int().default(0),
        planMaxAmount: z.string().default(""),
        subscriptionFirstChargeTime: z.string().default(""),
        subscriptionExpiryTime: z.string().default(""),
        subscriptionReturnUrl: z.string().default(""),
        subscriptionNotifyUrl: z.string().default(""),
        subscriptionAction: z.string().default("PAUSE"),
        // Payout fields
        beneId: z.string().default(""),
        beneName: z.string().default(""),
        beneEmail: z.string().default(""),
        benePhone: z.string().default(""),
        beneBankAccount: z.string().default(""),
        beneBankIfsc: z.string().default(""),
        beneVpa: z.string().default(""),
        beneAddress: z.string().default(""),
        beneCity: z.string().default(""),
        beneState: z.string().default("India"),
        benePincode: z.string().default(""),
        transferId: z.string().default(""),
        transferAmount: z.string().default(""),
        transferRemarks: z.string().default(""),
        transferMode: z.string().default("banktransfer"),
        batchTransferId: z.string().default(""),
        batchEntries: z.string().default("[]"),
        // UPI fields
        upiVpa: z.string().default(""),
        upiAmount: z.string().default(""),
        upiDescription: z.string().default(""),
        // Offer fields
        offerId: z.string().default(""),
        offerMeta: z.string().default("{}"),
        offerValidations: z.string().default("{}"),
        offerDetails: z.string().default("{}"),
        // Webhook fields
        webhookSignature: z.string().default(""),
        webhookTimestamp: z.string().default(""),
        webhookRawBody: z.string().default(""),
        webhookThrowOnFail: z.boolean().default(true),
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
      return prisma.cashfreeNode.upsert({
        where: { nodeId },
        create: { nodeId, workflowId, ...fields },
        update: { ...fields },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.cashfreeNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.cashfreeNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),

  getToken: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const token = await getSubscriptionToken(inngest, {
        channel: cashfreeChannel(),
        topics: ["status"],
      })
      return { token }
    }),
})
