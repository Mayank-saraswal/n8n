import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { encryptWebhookSecret } from "@/lib/razorpay-secret"

export const razorpayTriggerRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.razorpayTrigger.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })

      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) return null

      // Never return secret fields to the client — expose only a boolean indicator.
      const {
        webhookSecret: _legacy,
        webhookSecretEncrypted: _encrypted,
        ...safeFields
      } = node

      return {
        ...safeFields,
        isSecretConfigured: !!(node.webhookSecretEncrypted || node.webhookSecret),
      }
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        // The client sends the plaintext secret (or empty string to leave unchanged).
        // We encrypt it before writing to the DB.
        webhookSecret: z.string().max(500).default(""),
        activeEvents: z.array(z.string()).default([]),
        variableName: z.string().max(200).default("razorpayTrigger"),
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

      const { nodeId, workflowId, webhookSecret, activeEvents, variableName } = input

      // Build the encrypted-secret payload only when a non-empty secret is supplied.
      const secretData = webhookSecret.trim()
        ? {
            webhookSecretEncrypted: encryptWebhookSecret(webhookSecret),
            webhookSecret: null, // clear legacy plaintext
          }
        : {}

      const node = await prisma.razorpayTrigger.upsert({
        where: { nodeId },
        create: {
          nodeId,
          workflowId,
          activeEvents: JSON.stringify(activeEvents),
          variableName,
          ...secretData,
        },
        update: {
          activeEvents: JSON.stringify(activeEvents),
          variableName,
          ...secretData,
        },
      })

      // Strip secret fields before returning to client
      const { webhookSecret: _l, webhookSecretEncrypted: _e, ...safeFields } = node
      return {
        ...safeFields,
        isSecretConfigured: !!(node.webhookSecretEncrypted || node.webhookSecret),
      }
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.razorpayTrigger.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.razorpayTrigger.delete({ where: { nodeId: input.nodeId } })
    }),
})
