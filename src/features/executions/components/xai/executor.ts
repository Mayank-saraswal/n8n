import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createXai } from "@ai-sdk/xai";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { xAiChannel } from "@/inngest/channels/xai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString)
    return safeString
});

type XaiData = {
    variableName?: string
    credentialId?: string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const xAiExecutor: NodeExecutor<XaiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId
}) => {

    await publish(
        xAiChannel().status({
            nodeId,
            status: "loading"
        })
    )


    if (!data.variableName) {
        await publish(
            xAiChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("X ai node: Variable name is missing")
    }

    if (!data.userPrompt) {
        await publish(
            xAiChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("Xai node: user prompt is missing")
    }

    if (!data.credentialId) {
        await publish(
            xAiChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("xai node: credential is missing")
    }


    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant"

    const userPrompt = data.userPrompt
        ? Handlebars.compile(data.userPrompt)(context)
        : "No prompt provided"

    //Fetch credentials 
    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId
            }
        })
    });

    if (!credential) {
        throw new NonRetriableError("xai node: credential not found")
    }


    const xai = createXai({
        apiKey: decrypt(credential.value)
    })


    try {
        const { steps } = await step.ai.wrap(
            "xai-generate-text",
            generateText,
            {
                model: xai("grok-2") as any,
                prompt: userPrompt,
                system: systemPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true
                }
            },
        )

        const text =
            steps[0].content[0].type === "text"
                ? steps[0].content[0].text
                : ""

        await publish(
            xAiChannel().status({
                nodeId,
                status: "success",

            }),
        )
        return {
            ...context,
            [data.variableName]: {
                aiResponse: text,
            },
        }


    } catch (error) {
        console.error('xAi API Error:', error);
        await publish(
            xAiChannel().status({
                nodeId,
                status: "error",

            })
        )
        throw new NonRetriableError(`xAi API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}