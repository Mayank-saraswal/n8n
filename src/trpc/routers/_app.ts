
import prisma from '@/lib/db';
import {  createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { workflowsRouter } from '@/features/workflows/server/routers';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { credentialsRouter } from '@/features/credentials/server/routers';
import { executionRouter } from '@/features/executions/server/routers';
import { webhookTriggerRouter } from '@/server/routers/webhook-trigger.router';
import { scheduleTriggerRouter } from '@/server/routers/schedule-trigger.router';
export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials:credentialsRouter,
  executions:executionRouter,
  webhookTrigger: webhookTriggerRouter,
  scheduleTrigger: scheduleTriggerRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;