
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




export const executeWorkflow = inngest.createFunction(
  { 
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async({event , step})=>{
  
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
     channels:[
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
      telegramChannel()
    
    ]
  },
  async({event , step, publish})=>{

    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if(!inngestEventId || !workflowId){
      throw new NonRetriableError("Inngest event ID or Workflow ID is missing");
    }

    const execution = await step.run("create-execution", async()=>{
      return await prisma.execution.create({
        data: {
          inngestEventId,
          workflowId,
        },
      });
    });

    const SortedNodes = await step.run("prepare-workflow", async()=>{
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections:true
        },

      });
      return topologicalSort(workflow.nodes, workflow.connections);
      
    })

    const userId = await step.run("find-user-id", async()=>{
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        select:{
          userId:true
        }
      })
      return workflow.userId;
    })

    //Initialize the context with any initial data from the trigger 
    let context = event.data.initialData || {};

    for (const node of SortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish
      })
    }

    await step.run("update-execution", async()=>{
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
      workflowId , 
      result: context
    }
  }
  );