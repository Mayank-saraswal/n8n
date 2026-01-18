import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import { Variable } from "lucide-react";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Handlebars from "handlebars";
import {geminiChannel } from "@/inngest/channels/gemini";
import { googleGenAIIntegration } from "@sentry/nextjs";
import { generateText } from "ai";


Handlebars.registerHelper("json", (context)=> {
    const jsonString = JSON.stringify(context , null , 2);
    const safeString= new Handlebars.SafeString(jsonString)
    return safeString
});

type GeminiData = {
    variableName?:string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const geminiExecutor:NodeExecutor<GeminiData > = async({
    data,
    nodeId,
    context,
    step,
    publish
}) =>{

     await publish (
        geminiChannel().status({
            nodeId,
            status:"loading"
        })
     )


     if (!data.variableName) {
        await publish(
            geminiChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("gemini node: Variable name is missing")
     }

     if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("gemini node: user prompt is missing")
     }

     //todo throw if cred is missing
 
    const systemPrompt = data.systemPrompt 
    ? Handlebars.compile(data.systemPrompt)(context)
    :   "You are a helpful assistant" 

    const userPrompt = data.userPrompt 
    ? Handlebars.compile(data.userPrompt)(context)
    : "No prompt provided"

    //Fetch credentials 

    const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!

    const google = createGoogleGenerativeAI({
        apiKey: credentialValue
    })


    try {
        const {steps} = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google("gemini-2.5-flash"),
                prompt: userPrompt,
                system: systemPrompt,
                experimental_telemetry:{
                    isEnabled:true,
                    recordInputs:true,
                    recordOutputs:true
                }
            },
        )

        const  text = 
        steps[0].content[0].type==="text"
        ? steps[0].content[0].text
        :""

        await publish(
            geminiChannel().status({
                nodeId,
                status:"success",
                
            }),
        )
            return {
                ...context,
                [data.variableName]:{
                    aiResponse:text,
                },
            }
        
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        await publish(
            geminiChannel().status({
                nodeId,
                status:"error",
                
            })
         )
        throw new NonRetriableError(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}