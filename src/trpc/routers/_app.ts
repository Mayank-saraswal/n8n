
import prisma from '@/lib/db';
import {  createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { workflowsRouter } from '@/features/workflows/server/routers';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { credentialsRouter } from '@/features/credentials/server/routers';
import { executionRouter } from '@/features/executions/server/routers';
export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials:credentialsRouter,
  executions:executionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;