import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { z } from "zod";

export const scheduleTriggerRouter = createTRPCRouter({
    getByWorkflowId: protectedProcedure
        .input(z.object({ workflowId: z.string() }))
        .query(async ({ input }) => {
            return prisma.scheduleTrigger.findUnique({
                where: { workflowId: input.workflowId },
            });
        }),

    createOrUpdateScheduleTrigger: protectedProcedure
        .input(
            z.object({
                workflowId: z.string(),
                cronExpression: z.string(),
                timezone: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            return prisma.scheduleTrigger.upsert({
                where: { workflowId: input.workflowId },
                update: {
                    cronExpression: input.cronExpression,
                    timezone: input.timezone,
                },
                create: {
                    workflowId: input.workflowId,
                    cronExpression: input.cronExpression,
                    timezone: input.timezone,
                    inngestFunctionId: `schedule-${input.workflowId}-${Date.now()}`,
                },
            });
        }),

    toggleScheduleTrigger: protectedProcedure
        .input(
            z.object({
                workflowId: z.string(),
                isActive: z.boolean(),
            })
        )
        .mutation(async ({ input }) => {
            return prisma.scheduleTrigger.update({
                where: { workflowId: input.workflowId },
                data: { isActive: input.isActive },
            });
        }),
});
