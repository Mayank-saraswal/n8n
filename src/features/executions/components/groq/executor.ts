import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import { Variable } from "lucide-react";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Handlebars from "handlebars";
import {geminiChannel } from "@/inngest/channels/gemini";
import { googleGenAIIntegration } from "@sentry/nextjs";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { groqChannel } from "@/inngest/channels/groq";
import { createGroq } from '@ai-sdk/groq';

Handlebars.registerHelper("json", (context)=> {
    const jsonString = JSON.stringify(context , null , 2);
    const safeString= new Handlebars.SafeString(jsonString)
    return safeString
});

type GroqData = {
    variableName?:string
    credentialId?:string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const groqExecutor:NodeExecutor<GroqData > = async({
    data,
    nodeId,
    context,
    step,
    publish,
    userId
}) =>{

     await publish (
        groqChannel().status({
            nodeId,
            status:"loading"
        })
     )


     if (!data.variableName) {
        await publish(
            groqChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("groq node: Variable name is missing")
     }

     if (!data.userPrompt) {
        await publish(
            groqChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("groq node: user prompt is missing")
     }

     if (!data.credentialId) {
        await publish(
            groqChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("groq node: credential is missing")
     }
    
 
    const systemPrompt = data.systemPrompt 
    ? Handlebars.compile(data.systemPrompt)(context)
    :   "You are a helpful assistant" 

    const userPrompt = data.userPrompt 
    ? Handlebars.compile(data.userPrompt)(context)
    : "No prompt provided"

    //Fetch credentials 
    const credential = await step.run("get-credential",()=>{
        return prisma.credenial.findUnique({
            where:{
                id:data.credentialId,
                userId
            }
        })
    });

    if (!credential) {
        throw new NonRetriableError("groq node: credential not found")
    }


    const groq = createGroq({
        apiKey: decrypt(credential.value)
    })


    try {
        const {steps} = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: groq("qwen/qwen3-32b"),
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
            groqChannel().status({
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
        console.error('Groq API Error:', error);
        await publish(
            groqChannel().status({
                nodeId,
                status:"error",
                
            })
         )
        throw new NonRetriableError(`Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}