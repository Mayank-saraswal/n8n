import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import { Variable } from "lucide-react";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { googleGenAIIntegration } from "@sentry/nextjs";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { deepseekChannel } from "@/inngest/channels/deepseek";
import { createDeepSeek } from "@ai-sdk/deepseek";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString)
    return safeString
});

type DeepseekData = {
    variableName?: string
    credentialId?: string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const deepseekExecutor: NodeExecutor<DeepseekData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId
}) => {

    await publish(
        deepseekChannel().status({
            nodeId,
            status: "loading"
        })
    )


    if (!data.variableName) {
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("deepseek node: Variable name is missing")
    }

    if (!data.userPrompt) {
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("deepseek node: user prompt is missing")
    }

    if (!data.credentialId) {
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("deepseek node: credential is missing")
    }


    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant"

    const userPrompt = data.userPrompt
        ? Handlebars.compile(data.userPrompt)(context)
        : "No prompt provided"

    //Fetch credentials 
    const credential = await step.run("get-credential", () => {
        return prisma.credenial.findUnique({
            where: {
                id: data.credentialId,
                userId
            }
        })
    });

    if (!credential) {
        throw new NonRetriableError("deepseek node: credential not found")
    }


    const deepseek = createDeepSeek({
        apiKey: decrypt(credential.value)
    })


    try {
        const { steps } = await step.ai.wrap(
            "deepseek-generate-text",
            generateText,
            {
                model: deepseek("deepseek-chat"),
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
            deepseekChannel().status({
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
        console.error('Deepseek API Error:', error);
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",

            })
        )
        throw new NonRetriableError(`Deepseek API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}