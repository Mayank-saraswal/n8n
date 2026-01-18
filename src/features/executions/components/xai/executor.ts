import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createXai} from "@ai-sdk/xai";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { xAiChannel } from "@/inngest/channels/xai";


Handlebars.registerHelper("json", (context)=> {
    const jsonString = JSON.stringify(context , null , 2);
    const safeString= new Handlebars.SafeString(jsonString)
    return safeString
});

type XaiData = {
    variableName?:string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const xAiExecutor:NodeExecutor<XaiData > = async({
    data,
    nodeId,
    context,
    step,
    publish
}) =>{

     await publish (
        xAiChannel().status({
            nodeId,
            status:"loading"
        })
     )


     if (!data.variableName) {
        await publish(
            xAiChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("X ai node: Variable name is missing")
     }

     if (!data.userPrompt) {
        await publish(
            xAiChannel().status({
                nodeId,
                status:"error",
                
            })
         );
         throw new NonRetriableError("Xai node: user prompt is missing")
     }

     //todo throw if cred is missing
 
    const systemPrompt = data.systemPrompt 
    ? Handlebars.compile(data.systemPrompt)(context)
    :   "You are a helpful assistant" 

    const userPrompt = data.userPrompt 
    ? Handlebars.compile(data.userPrompt)(context)
    : "No prompt provided"

    //Fetch credentials 

    const credentialValue = process.env.XAI_API_KEY!

    const xai = createXai({
        apiKey: credentialValue
    })


    try {
        const {steps} = await step.ai.wrap(
            "xai-generate-text",
            generateText,
            {
                model: xai("grok-2") as any,
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
            xAiChannel().status({
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
        console.error('xAi API Error:', error);
        await publish(
            xAiChannel().status({
                nodeId,
                status:"error",
                
            })
         )
        throw new NonRetriableError(`xAi API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}