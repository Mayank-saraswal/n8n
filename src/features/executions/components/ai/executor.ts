import type { NodeExecutor } from "@/features/executions/types"
import { NonRetriableError, RetryAfterError } from "inngest"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { openAiChannel } from "@/inngest/channels/openai"
import { anthropicChannel } from "@/inngest/channels/anthropic"
import { geminiChannel } from "@/inngest/channels/gemini"
import { groqChannel } from "@/inngest/channels/groq"
import { xAiChannel } from "@/inngest/channels/xai"
import { deepseekChannel } from "@/inngest/channels/deepseek"
import { perplexityChannel } from "@/inngest/channels/perplexity"
import { type AICallInput, callProvider } from "./lib/providers"
import type { AIProvider, AIOperation } from "@/generated/prisma"

// Helper to map provider → channel .status() call
type PublishFn = Parameters<NodeExecutor>[0]["publish"]

function publishStatus(
  provider: AIProvider,
  nodeId: string,
  status: "loading" | "success" | "error",
  publish: PublishFn,
) {
  switch (provider) {
    case "OPENAI":
      return publish(openAiChannel().status({ nodeId, status }))
    case "ANTHROPIC":
      return publish(anthropicChannel().status({ nodeId, status }))
    case "GEMINI":
      return publish(geminiChannel().status({ nodeId, status }))
    case "GROQ":
      return publish(groqChannel().status({ nodeId, status }))
    case "XAI":
      return publish(xAiChannel().status({ nodeId, status }))
    case "DEEPSEEK":
      return publish(deepseekChannel().status({ nodeId, status }))
    case "PERPLEXITY":
      return publish(perplexityChannel().status({ nodeId, status }))
    default:
      return Promise.resolve()
  }
}

function tryParseJson<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

type AiNodeData = { nodeId?: string }

export const aiExecutor: NodeExecutor<AiNodeData> = async ({
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  // ── Step 1: Load config ────────────────────────────────────────────────────
  const config = await step.run(`ai-${nodeId}-load`, async () => {
    return prisma.aINode.findUnique({
      where: { nodeId },
      include: { workflow: { select: { userId: true } } },
    })
  })

  // ── Step 2: Validate ───────────────────────────────────────────────────────
  await step.run(`ai-${nodeId}-validate`, async () => {
    if (!config) {
      throw new NonRetriableError(
        "AI node not configured. Open settings and save configuration.",
      )
    }
    if (config.workflow.userId !== userId) {
      throw new NonRetriableError("AI node: unauthorized")
    }
    return { valid: true }
  })

  if (!config) throw new NonRetriableError("AI node not configured")

  await publishStatus(config.provider, nodeId, "loading", publish)

  // ── Step 3: Execute ────────────────────────────────────────────────────────
  return await step.run(`ai-${nodeId}-execute`, async () => {
    const r = (field: string) => resolveTemplate(field, context)

    // Decrypt credential
    let apiKey = ""
    if (config.credentialId) {
      const credential = await prisma.credential.findUnique({
        where: { id: config.credentialId, userId },
      })
      if (!credential) {
        throw new NonRetriableError(
          "AI node: credential not found. Re-select credential in settings.",
        )
      }
      try {
        const parsed = JSON.parse(decrypt(credential.value)) as { apiKey?: string; apikey?: string }
        apiKey = parsed.apiKey ?? parsed.apikey ?? ""
      } catch {
        // credential.value might be a plain decrypted string
        apiKey = decrypt(credential.value)
      }
    }

    if (!apiKey) {
      throw new NonRetriableError(
        "AI node: API key is empty. Check credential configuration.",
      )
    }

    // Build conversation history
    let history: Array<{ role: "user" | "assistant"; content: string }> = []
    if (
      (config.operation === "CHAT_WITH_HISTORY" ||
        config.operation === "CHAT") &&
      config.historyKey
    ) {
      const raw = context[config.historyKey]
      if (Array.isArray(raw)) {
        history = (raw as Array<{ role: "user" | "assistant"; content: string }>)
          .slice(-(config.maxHistory * 2))
      }
    }

    // Resolve image URLs
    const imageUrls: string[] = []
    if (config.imageUrl) imageUrls.push(r(config.imageUrl))
    const extraImageUrls = tryParseJson<string[]>(r(config.imageUrls), [])
    if (Array.isArray(extraImageUrls)) imageUrls.push(...extraImageUrls)

    const callInput: AICallInput = {
      operation: config.operation as AIOperation,
      provider: config.provider as AIProvider,
      model: config.model,
      apiKey,
      systemPrompt: r(config.systemPrompt),
      userPrompt: r(config.userPrompt),
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
      frequencyPenalty: config.frequencyPenalty,
      presencePenalty: config.presencePenalty,
      responseFormat: config.responseFormat,
      jsonSchema: config.jsonSchema,
      toolsJson: r(config.toolsJson),
      toolChoice: config.toolChoice,
      imageUrl: r(config.imageUrl),
      imageUrls,
      imageDetail: config.imageDetail,
      history,
      embeddingInput: r(config.embeddingInput),
      audioUrl: r(config.audioUrl),
      audioLanguage: config.audioLanguage,
      transcriptionFormat: config.transcriptionFormat,
      imagePrompt: r(config.imagePrompt),
      imageSize: config.imageSize,
      imageQuality: config.imageQuality,
      imageStyle: config.imageStyle,
      imageCount: config.imageCount,
      classifyLabels: config.classifyLabels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      classifyExamples: tryParseJson<Array<{ text: string; label: string }>>(
        r(config.classifyExamples),
        [],
      ),
    }

    let output
    try {
      output = await callProvider(callInput)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Rate-limit detection
      if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        await publishStatus(config.provider, nodeId, "error", publish)
        throw new RetryAfterError(`AI rate limit: ${msg}`, "60s")
      }
      await publishStatus(config.provider, nodeId, "error", publish)
      throw new NonRetriableError(`AI call failed: ${msg}`)
    }

    await publishStatus(config.provider, nodeId, "success", publish)

    const variableName = config.variableName || "ai"

    // Build updated history for CHAT_WITH_HISTORY
    const updatedHistory = [
      ...history,
      { role: "user" as const, content: callInput.userPrompt },
      { role: "assistant" as const, content: output.text ?? "" },
    ].slice(-(config.maxHistory * 2))

    // Extract provider-specific extras
    const rawResp = output.rawResponse as Record<string, unknown> | undefined
    const citations = rawResp?.citations as string[] | undefined
    const reasoningContent = (rawResp?.choices as Array<{ message?: { reasoning_content?: string } }>)?.[0]?.message?.reasoning_content
      ?? (rawResp?.reasoning_content as string | undefined)

    return {
      ...context,
      [variableName]: {
        operation: config.operation,
        model: config.model,
        // Chat outputs
        ...(output.text !== undefined ? { text: output.text, aiResponse: output.text } : {}),
        ...(output.json !== undefined ? { json: output.json } : {}),
        ...(output.toolCalls ? { toolCalls: output.toolCalls } : {}),
        // Special outputs
        ...(output.embedding ? { embedding: output.embedding } : {}),
        ...(output.imageUrls
          ? { imageUrls: output.imageUrls, imageUrl: output.imageUrls[0] ?? "" }
          : {}),
        ...(output.transcript !== undefined ? { transcript: output.transcript } : {}),
        ...(output.label !== undefined
          ? { label: output.label, confidence: output.confidence }
          : {}),
        // Provider-specific
        ...(citations ? { citations } : {}),
        ...(reasoningContent ? { reasoning: reasoningContent } : {}),
        // Usage
        usage: output.usage ?? null,
        // History for CHAT_WITH_HISTORY
        history: updatedHistory,
      },
    }
  })
}
