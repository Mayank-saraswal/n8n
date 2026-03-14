
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleformTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openAiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { xAiChannel } from "./channels/xai";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { perplexityChannel } from "./channels/perplexity";
import { deepseekChannel } from "./channels/deepseek";
import { groqChannel } from "./channels/groq";
import { telegramChannel } from "./channels/telegram";
import { xChannel } from "./channels/x";
import { workdayChannel } from "./channels/workday";
import { webhookTriggerChannel } from "./channels/webhook-trigger";
import { scheduleTriggerChannel } from "./channels/schedule-trigger";
import { setVariableChannel } from "./channels/set-variable";
import { googleSheetsChannel } from "./channels/google-sheets";
import { googleDriveChannel } from "./channels/google-drive";
import { whatsappChannel } from "./channels/whatsapp"
import { codeChannel } from "./channels/code";
import { loopChannel } from "./channels/loop";
import { notionChannel } from "./channels/notion";
import { razorpayChannel } from "./channels/razorpay";




export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event, step }) => {

      return await prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,

        },
      });
    }

  },
  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleformTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      anthropicChannel(),
      xAiChannel(),
      discordChannel(),
      slackChannel(),
      perplexityChannel(),
      deepseekChannel(),
      groqChannel(),
      telegramChannel(),
      xChannel(),
      workdayChannel(),
      webhookTriggerChannel(),
      scheduleTriggerChannel(),
      setVariableChannel(),
      googleSheetsChannel(),
      googleDriveChannel(),
      codeChannel(),
      whatsappChannel(),
      loopChannel(),
      notionChannel(),
      razorpayChannel()

    ]
  },
  async ({ event, step, publish }) => {

    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Inngest event ID or Workflow ID is missing");
    }

    const execution = await step.run("create-execution", async () => {
      return await prisma.execution.create({
        data: {
          inngestEventId,
          workflowId,
        },
      });
    });

    const preparedWorkflow = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true
        },

      });
      return {
        sortedNodes: topologicalSort(workflow.nodes, workflow.connections),
        connections: workflow.connections,
      };

    })

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        select: {
          userId: true
        }
      })
      return workflow.userId;
    })

    //Initialize the context with any initial data from the trigger 
    let context = event.data.initialData || {};

    // Track nodes to skip due to IF_ELSE branching
    const skippedNodes = new Set<string>();

    // Track nodes already executed by Loop node (per-item downstream execution)
    const executedByLoop = new Set<string>();

    // Prepare workflow graph info to pass to executors (for Loop node)
    const workflowNodes = preparedWorkflow.sortedNodes.map((n) => ({
      id: n.id,
      type: n.type,
      data: n.data as Record<string, unknown>,
    }));
    const workflowConnections = preparedWorkflow.connections.map((c) => ({
      id: c.id,
      fromNodeId: c.fromNodeId,
      toNodeId: c.toNodeId,
      fromOutput: c.fromOutput,
      toInput: c.toInput,
    }));

    for (const node of preparedWorkflow.sortedNodes) {
      // Skip nodes on non-taken branches
      if (skippedNodes.has(node.id)) continue;

      // Skip nodes already executed by Loop node
      if (executedByLoop.has(node.id)) continue;

      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
        workflowNodes,
        workflowConnections,
      })

      // Handle IF_ELSE branching: skip nodes on the non-taken branch
      if (node.type === NodeType.IF_ELSE) {
        const branch = (context as Record<string, unknown>).branch as string | undefined;
        if (branch) {
          // Find connections from this node that DON'T match the taken branch
          const nonTakenConnections = preparedWorkflow.connections.filter(
            (c) => c.fromNodeId === node.id && c.fromOutput !== `source-${branch}`
          );
          // Recursively skip all nodes reachable only through non-taken branches
          const toSkip = nonTakenConnections.map((c) => c.toNodeId);
          while (toSkip.length > 0) {
            const nodeIdToSkip = toSkip.pop()!;
            if (skippedNodes.has(nodeIdToSkip)) continue;
            skippedNodes.add(nodeIdToSkip);
            // Also skip downstream nodes of skipped nodes
            const downstream = preparedWorkflow.connections
              .filter((c) => c.fromNodeId === nodeIdToSkip)
              .map((c) => c.toNodeId);
            toSkip.push(...downstream);
          }
        }
      }

      // Handle Loop node: mark downstream nodes as already executed
      if (node.type === NodeType.LOOP) {
        const loopHandled = context._executedByLoop;
        if (Array.isArray(loopHandled)) {
          for (const id of loopHandled) {
            executedByLoop.add(id as string);
          }
          // Clean up the internal flag from context
          const { _executedByLoop, ...cleanContext } = context;
          context = cleanContext;
        }
      }
    }

    await step.run("update-execution", async () => {
      return await prisma.execution.update({
        where: {
          inngestEventId,
          workflowId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });
    return {
      workflowId,
      result: context
    }
  }
);