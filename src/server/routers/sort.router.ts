import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"

const sortKeySchema = z.object({
  field:         z.string().default(""),
  direction:     z.enum(["asc", "desc"]).default("asc"),
  type:          z.enum(["auto", "string", "number", "date", "boolean"]).default("auto"),
  nulls:         z.enum(["first", "last"]).default("last"),
  caseSensitive: z.boolean().default(false),
  locale:        z.string().default(""),
  natural:       z.boolean().default(false),
})

export const sortRouter = createTRPCRouter({

  getByNodeId: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const node = await prisma.sortNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) return null
      if (node.workflow.userId !== ctx.auth.user.id) return null

      // Never leak workflowId or internal fields
      const { workflowId: _wid, workflow: _, ...safeFields } = node
      return {
        ...safeFields,
        sortKeys: JSON.parse(node.sortKeys),
      }
    }),

  upsert: protectedProcedure
    .input(z.object({
      nodeId:       z.string(),
      workflowId:   z.string(),
      operation:    z.enum(["SORT_ARRAY", "SORT_KEYS", "REVERSE", "SHUFFLE"])
                      .default("SORT_ARRAY"),
      sortKeys:     z.array(sortKeySchema).default([]),
      inputPath:    z.string().default(""),
      variableName: z.string().min(1).max(100).default("sort"),
    }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.workflowId },
      })
      if (!workflow || workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const { nodeId, workflowId, sortKeys, ...data } = input

      const node = await prisma.sortNode.upsert({
        where: { nodeId },
        create: {
          nodeId,
          workflowId,
          sortKeys: JSON.stringify(sortKeys),
          ...data,
        },
        update: {
          sortKeys: JSON.stringify(sortKeys),
          ...data,
        },
      })

      const { workflowId: _wid, ...safeFields } = node
      return {
        ...safeFields,
        sortKeys: JSON.parse(node.sortKeys),
      }
    }),

  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.sortNode.findUnique({
        where: { nodeId: input.nodeId },
        include: { workflow: { select: { userId: true } } },
      })
      if (!node) throw new TRPCError({ code: "NOT_FOUND" })
      if (node.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
      await prisma.sortNode.delete({ where: { nodeId: input.nodeId } })
      return { success: true }
    }),
})
