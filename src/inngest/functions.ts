import prisma from "@/lib/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { inngest } from "./client";
import * as Sentry from "@sentry/nextjs"


import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    // await step.sleep("wait-for-ai", "5s");
    console.warn("Something is missing");

    Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' })



    console.error("This is the error i want to track")
    const {steps:geminiSteps}= await step.ai.wrap(
      "gemini-generate-text" ,
      generateText
      ,{
        model:google("gemini-2.5-flash"),
        system : "You are a helpfull assistant",
        prompt : "what is 2+2 ?",
        experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
  },
      })


    const {steps:openaiSteps}= await step.ai.wrap(
      "openai-generate-text" ,
      generateText
      ,{
        model:openai("gpt-4"),
        system : "You are a helpfull assistant",
        prompt : "what is 2+2 ?",
          experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
  },
      }

      
    )

     const {steps:anthropicSteps}= await step.ai.wrap(
      "anthropic-generate-text" ,
      generateText
      ,{
        model:anthropic("claude-sonnet-4-0"),
        system : "You are a helpfull assistant",
        prompt : "what is 2+2 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
      }
    }
      
    )
    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps
    }
    
   
  },
);