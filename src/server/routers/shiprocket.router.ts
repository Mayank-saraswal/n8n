import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"

export const shiprocketRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.shiprocketNode.findUnique({
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
          "CREATE_ORDER", "GET_ORDER", "CANCEL_ORDER", "UPDATE_ORDER",
          "GET_ORDER_TRACKING", "CLONE_ORDER", "GENERATE_AWB", "GET_ORDERS_LIST",
          "TRACK_SHIPMENT", "ASSIGN_COURIER", "GENERATE_LABEL", "GENERATE_MANIFEST",
          "REQUEST_PICKUP",
          "GET_COURIER_LIST", "GET_RATE", "CHECK_SERVICEABILITY",
          "CREATE_RETURN", "GET_RETURN_REASONS", "TRACK_RETURN",
          "CREATE_PRODUCT", "GET_PRODUCTS",
          "GET_PICKUP_LOCATIONS", "CREATE_PICKUP_LOCATION",
        ]),
        variableName: z.string().default("shiprocket"),
        orderId: z.string().default(""),
        orderDate: z.string().default(""),
        channelId: z.string().default(""),
        billingName: z.string().default(""),
        billingAddress: z.string().default(""),
        billingAddress2: z.string().default(""),
        billingCity: z.string().default(""),
        billingState: z.string().default(""),
        billingCountry: z.string().default("India"),
        billingPincode: z.string().default(""),
        billingEmail: z.string().default(""),
        billingPhone: z.string().default(""),
        billingAlternatePhone: z.string().default(""),
        shippingIsBilling: z.boolean().default(true),
        shippingName: z.string().default(""),
        shippingAddress: z.string().default(""),
        shippingAddress2: z.string().default(""),
        shippingCity: z.string().default(""),
        shippingState: z.string().default(""),
        shippingCountry: z.string().default("India"),
        shippingPincode: z.string().default(""),
        shippingEmail: z.string().default(""),
        shippingPhone: z.string().default(""),
        orderItems: z.string().default("[]"),
        paymentMethod: z.string().default("prepaid"),
        subTotal: z.string().default(""),
        codAmount: z.string().default("0"),
        length: z.string().default(""),
        breadth: z.string().default(""),
        height: z.string().default(""),
        weight: z.string().default(""),
        shiprocketOrderId: z.string().default(""),
        shipmentId: z.string().default(""),
        awbCode: z.string().default(""),
        courierId: z.string().default(""),
        courierName: z.string().default(""),
        pickupLocation: z.string().default(""),
        pickupPostcode: z.string().default(""),
        deliveryPostcode: z.string().default(""),
        cod: z.string().default("0"),
        returnOrderId: z.string().default(""),
        returnReason: z.string().default(""),
        returnPickupLocation: z.string().default(""),
        productName: z.string().default(""),
        productSku: z.string().default(""),
        productMrp: z.string().default(""),
        productSellingPrice: z.string().default(""),
        productWeight: z.string().default(""),
        productCategory: z.string().default(""),
        productHsn: z.string().default(""),
        filterStatus: z.string().default(""),
        pageNo: z.number().int().default(1),
        perPage: z.number().int().default(10),
        warehouseName: z.string().default(""),
        warehouseEmail: z.string().default(""),
        warehousePhone: z.string().default(""),
        warehouseAddress: z.string().default(""),
        warehouseCity: z.string().default(""),
        warehouseState: z.string().default(""),
        warehousePincode: z.string().default(""),
        warehouseCountry: z.string().default("India"),
        cancelReason: z.string().default(""),
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

      return prisma.shiprocketNode.upsert({
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
      const node = await prisma.shiprocketNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.shiprocketNode.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
