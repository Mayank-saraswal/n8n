import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { TRPCError } from "@trpc/server"

export const msg91Router = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.msg91Node.findUnique({
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
          "SEND_SMS", "SEND_BULK_SMS", "SEND_TRANSACTIONAL", "SCHEDULE_SMS",
          "SEND_OTP", "VERIFY_OTP", "RESEND_OTP", "INVALIDATE_OTP",
          "SEND_WHATSAPP", "SEND_WHATSAPP_MEDIA",
          "SEND_VOICE_OTP",
          "SEND_EMAIL",
          "GET_BALANCE", "GET_REPORT",
        ]),
        variableName: z.string().default("msg91"),
        mobile: z.string().default(""),
        senderId: z.string().default(""),
        flowId: z.string().default(""),
        smsVariables: z.string().default("{}"),
        message: z.string().default(""),
        route: z.string().default("4"),
        bulkData: z.string().default("[]"),
        scheduleTime: z.string().default(""),
        otpTemplateId: z.string().default(""),
        otpExpiry: z.number().int().default(10),
        otpLength: z.number().int().default(6),
        otpValue: z.string().default(""),
        retryType: z.string().default("text"),
        whatsappTemplate: z.string().default(""),
        whatsappLang: z.string().default("en"),
        whatsappParams: z.string().default("[]"),
        integratedNumber: z.string().default(""),
        mediaType: z.string().default("image"),
        mediaUrl: z.string().default(""),
        mediaCaption: z.string().default(""),
        voiceMessage: z.string().default(""),
        toEmail: z.string().default(""),
        subject: z.string().default(""),
        emailBody: z.string().default(""),
        fromEmail: z.string().default(""),
        fromName: z.string().default(""),
        requestId: z.string().default(""),
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

      return prisma.msg91Node.upsert({
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
      const node = await prisma.msg91Node.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.msg91Node.delete({
        where: { nodeId: input.nodeId },
      })
    }),
})
