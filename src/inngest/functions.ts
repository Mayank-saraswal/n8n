
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { buildExecutionLevels, mergeParallelResults } from "@/features/executions/lib/build-execution-levels";
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
import { gmailChannel } from "./channels/gmail";
import { switchChannel } from "./channels/switch";
import { waitChannel } from "./channels/wait";
import { mergeChannel } from "./channels/merge";


export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    concurrency: {
      limit: 3,
      key: "event.data.workflowId",
    },
    onFailure: async ({ event, step }) => {

      return await step.run("mark-execution-failed", async () => {
        return prisma.execution.update({
          where: {
            inngestEventId: event.data.event.id,
          },
          data: {
            status: ExecutionStatus.FAILED,
            error: event.data.error.message,
            errorStack: event.data.error.stack,

          },
        });
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
      razorpayChannel(),
      gmailChannel(),
      switchChannel(),
      waitChannel(),
      mergeChannel()

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

    // Hoist: build a lookup closure once per workflow
    const resolveExecutor = (type: NodeType) => getExecutor(type)

    // Build execution levels — nodes in the same level run in parallel
    const executionLevels = buildExecutionLevels(
      preparedWorkflow.sortedNodes,
      preparedWorkflow.connections
    )

    for (const level of executionLevels) {
      // Filter out nodes that should be skipped
      const executableNodes = level.filter(
        (node) =>
          !skippedNodes.has(node.id) && !executedByLoop.has(node.id)
      )

      if (executableNodes.length === 0) continue

      if (
        executableNodes.length === 1 ||
        executableNodes.some((n) => n.type === NodeType.LOOP)
      ) {
        // ── Sequential path: single node or level contains Loop ──
        for (const node of executableNodes) {
          // Re-check skip sets (a prior node in this level may have updated them)
          if (skippedNodes.has(node.id)) continue
          if (executedByLoop.has(node.id)) continue

          const executor = resolveExecutor(node.type as NodeType)
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
          if (node.type === NodeType.IF_ELSE || node.type === NodeType.SWITCH) {
            const branch = (context as Record<string, unknown>).branch as string | undefined;
            if (branch) {
              const nonTakenConnections = preparedWorkflow.connections.filter(
                (c) => c.fromNodeId === node.id && c.fromOutput !== `source-${branch}`
              );
              const toSkip = nonTakenConnections.map((c) => c.toNodeId);
              while (toSkip.length > 0) {
                const nodeIdToSkip = toSkip.pop()!;
                if (skippedNodes.has(nodeIdToSkip)) continue;
                skippedNodes.add(nodeIdToSkip);
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
              const { _executedByLoop, ...cleanContext } = context;
              context = cleanContext;
            }
          }
        }
      } else {
        // ── Parallel path: multiple independent nodes ──
        // Each node receives the SAME input context (snapshot before this level)
        // Their outputs are merged after all complete
        const contextSnapshot = { ...context }

        const results = await Promise.all(
          executableNodes.map((node) => {
            const executor = resolveExecutor(node.type as NodeType)
            return executor({
              data: node.data as Record<string, unknown>,
              nodeId: node.id,
              userId,
              context: contextSnapshot,
              step,
              publish,
              workflowNodes,
              workflowConnections,
            })
          })
        )

        // Handle IF_ELSE branching and Loop cleanup for parallel results
        for (let i = 0; i < executableNodes.length; i++) {
          const node = executableNodes[i]
          const result = results[i]

          if (node.type === NodeType.IF_ELSE || node.type === NodeType.SWITCH) {
            const branch = (result as Record<string, unknown>).branch as string | undefined;
            if (branch) {
              const nonTakenConnections = preparedWorkflow.connections.filter(
                (c) => c.fromNodeId === node.id && c.fromOutput !== `source-${branch}`
              );
              const toSkip = nonTakenConnections.map((c) => c.toNodeId);
              while (toSkip.length > 0) {
                const nodeIdToSkip = toSkip.pop()!;
                if (skippedNodes.has(nodeIdToSkip)) continue;
                skippedNodes.add(nodeIdToSkip);
                const downstream = preparedWorkflow.connections
                  .filter((c) => c.fromNodeId === nodeIdToSkip)
                  .map((c) => c.toNodeId);
                toSkip.push(...downstream);
              }
            }
          }

          if (node.type === NodeType.LOOP) {
            const loopHandled = (result as Record<string, unknown>)._executedByLoop;
            if (Array.isArray(loopHandled)) {
              for (const id of loopHandled) {
                executedByLoop.add(id as string);
              }
            }
          }
        }

        // Merge all parallel outputs into context for the next level
        context = mergeParallelResults(contextSnapshot, results)

        // Clean up the internal _executedByLoop flag from merged context
        if (context._executedByLoop) {
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