import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

export const razorpayRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.razorpayNode.findUnique({
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
        credentialId: z.string().optional(),
        operation: z.enum([
          "CREATE_ORDER",
          "FETCH_ORDER",
          "CREATE_REFUND",
          "FETCH_PAYMENT",
          "FETCH_REFUND",
          "CREATE_CUSTOMER",
          "FETCH_CUSTOMER",
        ]),
        amount: z.string().default(""),
        currency: z.string().default("INR"),
        description: z.string().default(""),
        receipt: z.string().default(""),
        customerId: z.string().default(""),
        paymentId: z.string().default(""),
        orderId: z.string().default(""),
        refundAmount: z.string().default(""),
        refundId: z.string().default(""),
        customerName: z.string().default(""),
        customerEmail: z.string().default(""),
        customerPhone: z.string().default(""),
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

      return prisma.razorpayNode.upsert({
        where: { nodeId: input.nodeId },
        create: {
          nodeId: input.nodeId,
          workflowId: input.workflowId,
          credentialId: input.credentialId,
          operation: input.operation,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          receipt: input.receipt,
          customerId: input.customerId,
          paymentId: input.paymentId,
          orderId: input.orderId,
          refundAmount: input.refundAmount,
          refundId: input.refundId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
        },
        update: {
          credentialId: input.credentialId,
          operation: input.operation,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          receipt: input.receipt,
          customerId: input.customerId,
          paymentId: input.paymentId,
          orderId: input.orderId,
          refundAmount: input.refundAmount,
          refundId: input.refundId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
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
      if (!node || node.workflow.userId !== ctx.auth.user.id)
        throw new Error("Unauthorized")
      return prisma.razorpayNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
