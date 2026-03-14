import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { resolveTemplate } from "@/features/executions/lib/template-resolver";
import { decode } from "html-entities";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";

type SlackData = {
    variableName?:string
    credentialId?:string
    // model?: string;
    webhookUrl?:string
    content?:string
};
export const slackExecutor:NodeExecutor<SlackData > = async({
    data,
    nodeId,
    context,
    step,
    publish,
    userId
}) =>{

     await publish (
        slackChannel().status({
            nodeId,
            status:"loading"
        })
    )





    if (!data.content) {
        await publish(
            slackChannel().status({
                nodeId,
                status:"error",

            })
        );
        throw new NonRetriableError("slack node: content is missing")
    }




    const rawContent = resolveTemplate(data.content, context)
    const content = decode(rawContent)
    //Fetch credentials 



    try {
       const result = await step.run("slack-webhook",async()=>{

            if (!data.webhookUrl) {
                await publish(
                    slackChannel().status({
                        nodeId,
                status:"error",

                    })
                );
                throw new NonRetriableError("slack node: webhook url is missing")
            }
        await ky.post(data.webhookUrl!,{
            json:{
                content:content,  // key depends on workflow config
                }
            })
        });

        if (!data.variableName) {
            await publish(
                slackChannel().status({
                    nodeId,
                status:"error",

                })
            );
            throw new NonRetriableError("slack node: Variable name is missing")
        }

        await publish(
            slackChannel().status({
                nodeId,
                status: "success",

            }),
        )

        return {
            ...context,
            [data.variableName]: {
                messageContent: content.slice(0, 2000),
            },
        }



    } catch (error) {
        console.error('Slack Error:', error);
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",

            })
        )
        throw new NonRetriableError(`slack  error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}