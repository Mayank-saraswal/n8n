import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"

export const razorpayRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.razorpayNode.findUnique({
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
        operation: z.enum([
          "ORDER_CREATE", "ORDER_FETCH", "ORDER_FETCH_PAYMENTS", "ORDER_LIST",
          "PAYMENT_FETCH", "PAYMENT_CAPTURE", "PAYMENT_LIST", "PAYMENT_UPDATE",
          "REFUND_CREATE", "REFUND_FETCH", "REFUND_LIST",
          "CUSTOMER_CREATE", "CUSTOMER_FETCH", "CUSTOMER_UPDATE",
          "SUBSCRIPTION_CREATE", "SUBSCRIPTION_FETCH", "SUBSCRIPTION_CANCEL",
          "INVOICE_CREATE", "INVOICE_FETCH", "INVOICE_SEND", "INVOICE_CANCEL",
          "PAYMENT_LINK_CREATE", "PAYMENT_LINK_FETCH", "PAYMENT_LINK_UPDATE", "PAYMENT_LINK_CANCEL",
          "PAYOUT_CREATE", "PAYOUT_FETCH",
          "VERIFY_PAYMENT_SIGNATURE",
        ]),
        variableName: z.string().default("razorpay"),
        amount: z.string().default(""),
        currency: z.string().default("INR"),
        description: z.string().default(""),
        receipt: z.string().default(""),
        notes: z.string().default(""),
        partialPayment: z.boolean().default(false),
        orderId: z.string().default(""),
        paymentId: z.string().default(""),
        captureAmount: z.string().default(""),
        refundAmount: z.string().default(""),
        refundSpeed: z.string().default("normal"),
        refundId: z.string().default(""),
        customerId: z.string().default(""),
        customerName: z.string().default(""),
        customerEmail: z.string().default(""),
        customerContact: z.string().default(""),
        failExisting: z.boolean().default(false),
        planId: z.string().default(""),
        totalCount: z.string().default(""),
        quantity: z.string().default("1"),
        startAt: z.string().default(""),
        subscriptionId: z.string().default(""),
        cancelAtCycleEnd: z.boolean().default(false),
        invoiceType: z.string().default("invoice"),
        lineItems: z.string().default(""),
        expireBy: z.string().default(""),
        smsNotify: z.boolean().default(true),
        emailNotify: z.boolean().default(true),
        invoiceId: z.string().default(""),
        paymentLinkId: z.string().default(""),
        referenceId: z.string().default(""),
        reminderEnable: z.boolean().default(true),
        callbackUrl: z.string().default(""),
        callbackMethod: z.string().default(""),
        accountNumber: z.string().default(""),
        fundAccountId: z.string().default(""),
        payoutMode: z.string().default(""),
        payoutPurpose: z.string().default("payout"),
        narration: z.string().default(""),
        queueIfLowBalance: z.boolean().default(false),
        payoutId: z.string().default(""),
        signature: z.string().default(""),
        throwOnInvalid: z.boolean().default(true),
        count: z.string().default(""),
        skip: z.string().default(""),
        fromDate: z.string().default(""),
        toDate: z.string().default(""),
        authorized: z.string().default(""),
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

      return prisma.razorpayNode.upsert({
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
      const node = await prisma.razorpayNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.razorpayNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
