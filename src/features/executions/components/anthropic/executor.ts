import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import { Variable } from "lucide-react";
import { createAnthropic} from "@ai-sdk/anthropic";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { anthropicChannel } from "@/inngest/channels/anthropic";


Handlebars.registerHelper("json", (context)=> {
    const jsonString = JSON.stringify(context , null , 2);
    const safeString= new Handlebars.SafeString(jsonString)
    return safeString
});

type AnthropicData = {
    variableName?:string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const anthropicExecutor:NodeExecutor<AnthropicData > = async({
    data,
    nodeId,
    context,
    step,
    publish
}) =>{

     await publish (
        anthropicChannel().status({
            nodeId,
            status:"loading"
        })
     )


     if (!data.variableName) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("Anthropic node: Variable name is missing")
     }

     if (!data.userPrompt) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("Anthropic node: user prompt is missing")
     }

     //todo throw if cred is missing
 
    const systemPrompt = data.systemPrompt 
    ? Handlebars.compile(data.systemPrompt)(context)
    :   "You are a helpful assistant" 

    const userPrompt = data.userPrompt 
    ? Handlebars.compile(data.userPrompt)(context)
    : "No prompt provided"

    //Fetch credentials 

    const credentialValue = process.env.ANTHROPIC_API_KEY!

    const anthropic = createAnthropic({
        apiKey: credentialValue
    })


    try {
        const {steps} = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic("claude-sonnet-4-0"),
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
            anthropicChannel().status({
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
        console.error('Anthropic API Error:', error);
        await publish(
            anthropicChannel().status({
                nodeId,
                status:"error",
                
            })
         )
        throw new NonRetriableError(`Anthropic error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}