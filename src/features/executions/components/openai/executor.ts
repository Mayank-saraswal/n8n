import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import { Variable } from "lucide-react";
import { createOpenAI} from "@ai-sdk/openai";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { openAiChannel } from "@/inngest/channels/openai";


Handlebars.registerHelper("json", (context)=> {
    const jsonString = JSON.stringify(context , null , 2);
    const safeString= new Handlebars.SafeString(jsonString)
    return safeString
});

type OpenAiData = {
    variableName?:string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const openAiExecutor:NodeExecutor<OpenAiData > = async({
    data,
    nodeId,
    context,
    step,
    publish
}) =>{

     await publish (
        openAiChannel().status({
            nodeId,
            status:"loading"
        })
     )


     if (!data.variableName) {
        await publish(
            openAiChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("OpenAi node: Variable name is missing")
     }

     if (!data.userPrompt) {
        await publish(
            openAiChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("OpenAi node: user prompt is missing")
     }

     //todo throw if cred is missing
 
    const systemPrompt = data.systemPrompt 
    ? Handlebars.compile(data.systemPrompt)(context)
    :   "You are a helpful assistant" 

    const userPrompt = data.userPrompt 
    ? Handlebars.compile(data.userPrompt)(context)
    : "No prompt provided"

    //Fetch credentials 

    const credentialValue = process.env.OPENAI_API_KEY!

    const openai = createOpenAI({
        apiKey: credentialValue
    })


    try {
        const {steps} = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai("gpt-4"),
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
            openAiChannel().status({
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
        console.error('OpenAi API Error:', error);
        await publish(
            openAiChannel().status({
                nodeId,
                status:"error",
                
            })
         )
        throw new NonRetriableError(`OpenAi API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}