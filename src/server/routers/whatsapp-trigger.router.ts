import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { encryptVerifyToken, decryptVerifyToken } from "@/lib/whatsapp-secret"
import { randomUUID } from "crypto"
import type { WhatsAppTrigger } from "@/generated/prisma"

export const whatsappTriggerRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.whatsAppTrigger.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })

      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) return null

      // Decrypt the verify token to return to the client (read-only for UI display).
      // This is safe: token is user-owned, transmitted over TLS, and not a password.
      const verifyToken = decryptVerifyToken(node.verifyTokenEncrypted, node.verifyToken)

      // Drop the raw encrypted/legacy fields from the response
      const { verifyToken: _legacy, verifyTokenEncrypted: _enc, ...safeFields } = node

      return { ...safeFields, verifyToken }
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        phoneNumberId: z.string().default(""),
        activeEvents: z.array(z.string()).default([]),
        messageTypes: z.array(z.string()).default([]),
        ignoreOwnMessages: z.boolean().default(true),
        variableName: z.string().max(200).default("whatsappTrigger"),
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

      const { nodeId, workflowId, phoneNumberId, activeEvents, messageTypes, ignoreOwnMessages, variableName } = input

      // Check if a row already exists
      const existing = await prisma.whatsAppTrigger.findUnique({ where: { nodeId } })

      let node: WhatsAppTrigger

      if (!existing) {
        // CREATE — generate and encrypt a new verify token
        const plainToken = randomUUID()
        const encryptedToken = encryptVerifyToken(plainToken)
        node = await prisma.whatsAppTrigger.create({
            data: {
                nodeId,
                workflowId,
                phoneNumberId,
                activeEvents: JSON.stringify(activeEvents),
                messageTypes: JSON.stringify(messageTypes),
                ignoreOwnMessages,
                variableName,
                verifyTokenEncrypted: encryptedToken,
                verifyToken: null,
            },
        })
      } else {
        // UPDATE — never rotate the verify token
        node = await prisma.whatsAppTrigger.update({
            where: { nodeId },
            data: {
                phoneNumberId,
                activeEvents: JSON.stringify(activeEvents),
                messageTypes: JSON.stringify(messageTypes),
                ignoreOwnMessages,
                variableName,
            },
        })
      }

      // Decrypt for the response (client needs to display it)
      const verifyToken = decryptVerifyToken(node.verifyTokenEncrypted, node.verifyToken)
      const { verifyToken: _l, verifyTokenEncrypted: _e, ...safeFields } = node
      return { ...safeFields, verifyToken }
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.whatsAppTrigger.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.whatsAppTrigger.delete({ where: { nodeId: input.nodeId } })
    }),
})
