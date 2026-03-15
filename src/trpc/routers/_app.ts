
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
import { ifElseRouter } from '@/server/routers/if-else.router';
import { gmailRouter } from '@/server/routers/gmail.router';
import { setVariableRouter } from '@/server/routers/set-variable.router';
import { usageRouter } from '@/server/routers/usage.router';
import { googleSheetsRouter } from '@/server/routers/google-sheets.router';
import { googleDriveRouter } from '@/server/routers/google-drive.router';
import { whatsappRouter } from '@/server/routers/whatsapp.router';
import { codeRouter } from '@/server/routers/code.router';
import { loopRouter } from '@/server/routers/loop.router';
import { notionRouter } from '@/server/routers/notion.router';
import { razorpayRouter } from '@/server/routers/razorpay.router';
import { slackRouter } from '@/server/routers/slack.router';
import { switchRouter } from '@/server/routers/switch.router';
import { waitRouter } from '@/server/routers/wait.router';
import { mergeRouter } from '@/server/routers/merge.router';
import { errorTriggerRouter } from '@/server/routers/error-trigger.router';
import { razorpayTriggerRouter } from '@/server/routers/razorpay-trigger.router';
import { whatsappTriggerRouter } from '@/server/routers/whatsapp-trigger.router';
export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials:credentialsRouter,
  executions:executionRouter,
  webhookTrigger: webhookTriggerRouter,
  scheduleTrigger: scheduleTriggerRouter,
  ifElse: ifElseRouter,
  gmail: gmailRouter,
  setVariable: setVariableRouter,
  usage: usageRouter,
  googleSheets: googleSheetsRouter,
  googleDrive: googleDriveRouter,
  code: codeRouter,
  whatsapp: whatsappRouter,
  loop: loopRouter,
  notion: notionRouter,
  razorpay: razorpayRouter,
  slack: slackRouter,
  switch: switchRouter,
  wait: waitRouter,
  merge: mergeRouter,
  errorTrigger: errorTriggerRouter,
  razorpayTrigger: razorpayTriggerRouter,
  whatsappTrigger: whatsappTriggerRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
