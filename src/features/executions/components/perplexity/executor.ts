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
import { perplexityChannel } from "@/inngest/channels/perplexity";
import { createPerplexity } from "@ai-sdk/perplexity";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString)
    return safeString
});

type PerplexityData = {
    variableName?: string
    credentialId?: string
    // model?: string;
    userPrompt?: string;
    systemPrompt?: string;
};
export const perplexityExecutor: NodeExecutor<PerplexityData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId
}) => {

    await publish(
        perplexityChannel().status({
            nodeId,
            status: "loading"
        })
    )


    if (!data.variableName) {
        await publish(
            perplexityChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("perplexity node: Variable name is missing")
    }

    if (!data.userPrompt) {
        await publish(
            perplexityChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("perplexity node: user prompt is missing")
    }

    if (!data.credentialId) {
        await publish(
            perplexityChannel().status({
                nodeId,
                status: "error",

            })
        );
        throw new NonRetriableError("perplexity node: credential is missing")
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
        throw new NonRetriableError("perplexity node: credential not found")
    }

    //todo fix this latter
    const perplexity = createPerplexity({
        apiKey: decrypt(credential.value)
    })


    try {
        const { steps } = await step.ai.wrap(
            "perplexity-generate-text",
            generateText,
            {
                model: perplexity("sonar-pro"),
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
            perplexityChannel().status({
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
        console.error('Perplexity API Error:', error);
        await publish(
            perplexityChannel().status({
                nodeId,
                status: "error",

            })
        )
        throw new NonRetriableError(`Perplexity API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}