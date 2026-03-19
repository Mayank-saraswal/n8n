import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { AIOperation, AIProvider } from "@/generated/prisma"
import { TRPCError } from "@trpc/server"

export const aiRouter = createTRPCRouter({
  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.aINode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      // Strip the workflow relation before returning
      const { workflow: _w, ...rest } = node
      return rest
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        workflowId: z.string(),
        provider: z.nativeEnum(AIProvider),
        credentialId: z.string().optional(),
        operation: z.nativeEnum(AIOperation).default(AIOperation.CHAT),
        variableName: z.string().default("ai"),
        model: z.string().default(""),
        systemPrompt: z.string().default(""),
        userPrompt: z.string().default(""),
        temperature: z.number().min(0).max(2).default(0.7),
        maxTokens: z.number().min(1).max(100000).default(1000),
        topP: z.number().min(0).max(1).default(1.0),
        frequencyPenalty: z.number().min(-2).max(2).default(0.0),
        presencePenalty: z.number().min(-2).max(2).default(0.0),
        responseFormat: z.string().default("text"),
        jsonSchema: z.string().default(""),
        toolsJson: z.string().default("[]"),
        toolChoice: z.string().default("auto"),
        imageUrl: z.string().default(""),
        imageUrls: z.string().default("[]"),
        imageDetail: z.string().default("auto"),
        historyKey: z.string().default(""),
        maxHistory: z.number().min(1).max(100).default(10),
        embeddingInput: z.string().default(""),
        audioUrl: z.string().default(""),
        audioLanguage: z.string().default(""),
        transcriptionFormat: z.string().default("text"),
        imagePrompt: z.string().default(""),
        imageSize: z.string().default("1024x1024"),
        imageQuality: z.string().default("standard"),
        imageStyle: z.string().default("vivid"),
        imageCount: z.number().min(1).max(10).default(1),
        classifyLabels: z.string().default(""),
        classifyExamples: z.string().default("[]"),
        continueOnFail: z.boolean().default(false),
        timeout: z.number().default(60000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
        select: { userId: true },
      })
      if (!workflow || workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const {
        nodeId,
        workflowId,
        provider,
        credentialId,
        ...rest
      } = input

      return prisma.aINode.upsert({
        where: { nodeId },
        create: {
          nodeId,
          workflowId,
          provider,
          credentialId,
          ...rest,
        },
        update: {
          provider,
          credentialId,
          ...rest,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.aINode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node || node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      return prisma.aINode.delete({ where: { nodeId: input.nodeId } })
    }),
})
