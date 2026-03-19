/**
 * Shared AI Provider Library
 *
 * Implements all operations for all 7 AI providers via direct REST API calls.
 * Using fetch() directly (not AI SDK) to support the full operation set.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type AIProvider =
  | "OPENAI"
  | "ANTHROPIC"
  | "GEMINI"
  | "GROQ"
  | "XAI"
  | "DEEPSEEK"
  | "PERPLEXITY"

export type AIOperation =
  | "CHAT"
  | "CHAT_WITH_HISTORY"
  | "STRUCTURED_OUTPUT"
  | "TOOL_USE"
  | "VISION"
  | "EMBED"
  | "TRANSCRIBE"
  | "GENERATE_IMAGE"
  | "CLASSIFY"

export interface AICallInput {
  operation: AIOperation
  provider: AIProvider
  model: string
  apiKey: string
  systemPrompt: string
  userPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  responseFormat: string
  jsonSchema: string
  toolsJson: string
  toolChoice: string
  imageUrl: string
  imageUrls: string[]
  imageDetail: string
  history: Array<{ role: "user" | "assistant"; content: string }>
  embeddingInput: string
  audioUrl: string
  audioLanguage: string
  transcriptionFormat: string
  imagePrompt: string
  imageSize: string
  imageQuality: string
  imageStyle: string
  imageCount: number
  classifyLabels: string[]
  classifyExamples: Array<{ text: string; label: string }>
}

export interface AICallOutput {
  text?: string
  json?: unknown
  toolCalls?: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }>
  embedding?: number[]
  imageUrls?: string[]
  transcript?: string
  label?: string
  confidence?: number
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCostUsd?: number
  }
  rawResponse?: unknown
}

// ── Helper utilities ──────────────────────────────────────────────────────────

function tryParseJson<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

function parseUsage(usage: Record<string, unknown> | undefined): AICallOutput["usage"] | undefined {
  if (!usage) return undefined
  return {
    promptTokens: (usage.prompt_tokens as number) ?? 0,
    completionTokens: (usage.completion_tokens as number) ?? 0,
    totalTokens: (usage.total_tokens as number) ?? 0,
  }
}

function buildClassifyPrompt(
  userPrompt: string,
  labels: string[],
  examples: Array<{ text: string; label: string }>,
): string {
  const labelsStr = labels.join(", ")
  let prompt = `Classify the following text into exactly one of these categories: ${labelsStr}\n\n`
  if (examples.length > 0) {
    prompt += "Examples:\n"
    for (const ex of examples) {
      prompt += `Text: "${ex.text}"\nLabel: ${ex.label}\n\n`
    }
  }
  prompt += `Text: "${userPrompt}"\nLabel (respond with label name only, no punctuation):`
  return prompt
}

function parseClassifyResponse(
  text: string,
  labels: string[],
): { label: string; confidence: number } {
  const cleaned = text.trim().toLowerCase()
  for (const label of labels) {
    if (cleaned.includes(label.toLowerCase())) {
      return { label, confidence: 0.9 }
    }
  }
  return { label: text.trim(), confidence: 0.5 }
}

// ── OpenAI-compatible chat helper ─────────────────────────────────────────────

interface OAIMessage {
  role: string
  content: OAIContent | string
}

type OAIContent = string | OAIContentPart[]

interface OAIContentPart {
  type: string
  text?: string
  image_url?: { url: string; detail?: string }
}

function buildOpenAIMessages(input: AICallInput): OAIMessage[] {
  const messages: OAIMessage[] = []

  // History
  for (const h of input.history) {
    messages.push({ role: h.role, content: h.content })
  }

  // Current user message
  if (input.operation === "VISION" && input.imageUrls.length > 0) {
    const parts: OAIContentPart[] = []
    if (input.userPrompt) {
      parts.push({ type: "text", text: input.userPrompt })
    }
    for (const url of input.imageUrls) {
      parts.push({ type: "image_url", image_url: { url, detail: input.imageDetail as "auto" | "low" | "high" } })
    }
    messages.push({ role: "user", content: parts })
  } else {
    messages.push({ role: "user", content: input.userPrompt })
  }

  return messages
}

async function callOpenAICompat(
  baseUrl: string,
  apiKey: string,
  input: AICallInput,
  extraHeaders: Record<string, string> = {},
): Promise<AICallOutput> {
  const model = input.model || (baseUrl.includes("groq") ? "llama-3.3-70b-versatile" : "gpt-4o")

  // TRANSCRIBE
  if (input.operation === "TRANSCRIBE") {
    const audioResp = await fetch(input.audioUrl)
    if (!audioResp.ok) throw new Error(`Failed to fetch audio from ${input.audioUrl}`)
    const audioBlob = await audioResp.blob()
    const form = new FormData()
    form.append("file", audioBlob, "audio.mp3")
    form.append("model", model || "whisper-large-v3")
    if (input.audioLanguage) form.append("language", input.audioLanguage)
    form.append("response_format", input.transcriptionFormat || "text")
    const resp = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, ...extraHeaders },
      body: form,
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Transcription error ${resp.status}: ${err}`)
    }
    if (input.transcriptionFormat === "text") {
      return { transcript: await resp.text() }
    }
    const json = await resp.json() as Record<string, unknown>
    return { transcript: (json.text as string) ?? (json as unknown as string), rawResponse: json }
  }

  // EMBED
  if (input.operation === "EMBED") {
    const embedModel = input.model || "text-embedding-3-small"
    const resp = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...extraHeaders },
      body: JSON.stringify({ model: embedModel, input: input.embeddingInput || input.userPrompt }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Embedding error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as { data: Array<{ embedding: number[] }>; usage?: Record<string, unknown> }
    return { embedding: json.data[0]?.embedding ?? [], usage: parseUsage(json.usage) }
  }

  // GENERATE_IMAGE
  if (input.operation === "GENERATE_IMAGE") {
    const imageModel = input.model || "dall-e-3"
    const body: Record<string, unknown> = {
      model: imageModel,
      prompt: input.imagePrompt || input.userPrompt,
      n: input.imageCount,
      size: input.imageSize,
      response_format: "url",
    }
    if (imageModel === "dall-e-3") {
      body.quality = input.imageQuality
      body.style = input.imageStyle
    }
    const resp = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...extraHeaders },
      body: JSON.stringify(body),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Image generation error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as { data: Array<{ url: string }> }
    return { imageUrls: json.data.map((d) => d.url) }
  }

  // CLASSIFY
  if (input.operation === "CLASSIFY") {
    const classifyPrompt = buildClassifyPrompt(
      input.userPrompt,
      input.classifyLabels,
      input.classifyExamples,
    )
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...extraHeaders },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: classifyPrompt }],
        temperature: 0,
        max_tokens: 20,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Classify error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as { choices: Array<{ message: { content: string | null } }> }
    const text = json.choices[0]?.message?.content ?? ""
    const parsed = parseClassifyResponse(text, input.classifyLabels)
    return { ...parsed, text, rawResponse: json }
  }

  // CHAT / CHAT_WITH_HISTORY / STRUCTURED_OUTPUT / TOOL_USE / VISION
  const messages = buildOpenAIMessages(input)
  const body: Record<string, unknown> = {
    model,
    messages: input.systemPrompt
      ? [{ role: "system", content: input.systemPrompt }, ...messages]
      : messages,
    temperature: input.temperature,
    max_tokens: input.maxTokens,
    top_p: input.topP,
    frequency_penalty: input.frequencyPenalty,
    presence_penalty: input.presencePenalty,
  }

  if (input.operation === "STRUCTURED_OUTPUT") {
    if (input.responseFormat === "json_schema" && input.jsonSchema) {
      const schema = tryParseJson<Record<string, unknown>>(input.jsonSchema, {})
      body.response_format = {
        type: "json_schema",
        json_schema: { name: "response", strict: true, schema },
      }
    } else {
      body.response_format = { type: "json_object" }
    }
  }

  if (input.operation === "TOOL_USE" && input.toolsJson) {
    const tools = tryParseJson<unknown[]>(input.toolsJson, [])
    if (tools.length > 0) {
      body.tools = tools
      body.tool_choice = input.toolChoice || "auto"
    }
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...extraHeaders },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Chat error ${resp.status}: ${err}`)
  }
  const json = await resp.json() as {
    choices: Array<{
      message: {
        content: string | null
        tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>
        reasoning_content?: string
      }
    }>
    citations?: string[]
    usage?: Record<string, unknown>
  }

  const message = json.choices[0]?.message
  const text = message?.content ?? ""
  const output: AICallOutput = { text, usage: parseUsage(json.usage), rawResponse: json }

  if (input.operation === "STRUCTURED_OUTPUT" && text) {
    output.json = tryParseJson(text, null)
  }

  if (message?.tool_calls?.length) {
    output.toolCalls = message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tryParseJson<Record<string, unknown>>(tc.function.arguments, {}),
    }))
  }

  return output
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

export async function callOpenAI(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "gpt-4o"
  return callOpenAICompat("https://api.openai.com/v1", input.apiKey, { ...input, model })
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

export async function callAnthropic(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "claude-sonnet-4-5"

  if (input.operation === "CLASSIFY") {
    const classifyPrompt = buildClassifyPrompt(
      input.userPrompt,
      input.classifyLabels,
      input.classifyExamples,
    )
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": input.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 20,
        messages: [{ role: "user", content: classifyPrompt }],
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Anthropic classify error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as { content: Array<{ type: string; text: string }> }
    const text = json.content.find((b) => b.type === "text")?.text ?? ""
    const parsed = parseClassifyResponse(text, input.classifyLabels)
    return { ...parsed, text }
  }

  // Build content array for vision
  const buildContent = (): unknown => {
    if (input.operation === "VISION" && input.imageUrls.length > 0) {
      const parts: unknown[] = []
      for (const url of input.imageUrls) {
        parts.push({ type: "image", source: { type: "url", url } })
      }
      if (input.userPrompt) {
        parts.push({ type: "text", text: input.userPrompt })
      }
      return parts
    }
    return input.userPrompt
  }

  const historyMessages = input.history.map((h) => ({ role: h.role, content: h.content }))
  const messages = [
    ...historyMessages,
    { role: "user" as const, content: buildContent() },
  ]

  const body: Record<string, unknown> = {
    model,
    max_tokens: input.maxTokens,
    messages,
    ...(input.systemPrompt ? { system: input.systemPrompt } : {}),
  }

  if (input.operation === "TOOL_USE" && input.toolsJson) {
    const tools = tryParseJson<unknown[]>(input.toolsJson, [])
    if (tools.length > 0) {
      body.tools = tools
      body.tool_choice = { type: input.toolChoice === "required" ? "any" : input.toolChoice === "none" ? "auto" : "auto" }
    }
  }

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Anthropic error ${resp.status}: ${err}`)
  }

  const json = await resp.json() as {
    content: Array<{ type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }>
    usage?: { input_tokens: number; output_tokens: number }
  }

  const textBlock = json.content.find((b) => b.type === "text")?.text ?? ""
  const toolUseBlocks = json.content.filter((b) => b.type === "tool_use")

  const usage = json.usage
    ? {
        promptTokens: json.usage.input_tokens,
        completionTokens: json.usage.output_tokens,
        totalTokens: json.usage.input_tokens + json.usage.output_tokens,
      }
    : undefined

  const output: AICallOutput = { text: textBlock, usage, rawResponse: json }

  if (input.operation === "STRUCTURED_OUTPUT" && textBlock) {
    output.json = tryParseJson(textBlock, null)
  }

  if (toolUseBlocks.length > 0) {
    output.toolCalls = toolUseBlocks.map((b) => ({
      id: b.id ?? "",
      name: b.name ?? "",
      arguments: b.input ?? {},
    }))
  }

  return output
}

// ── Gemini ────────────────────────────────────────────────────────────────────

export async function callGemini(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "gemini-3.0-flash"
  const base = "https://generativelanguage.googleapis.com/v1beta"

  if (input.operation === "EMBED") {
    const embedModel = input.model || "text-embedding-004"
    const resp = await fetch(`${base}/models/${embedModel}:embedContent?key=${input.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: input.embeddingInput || input.userPrompt }] } }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Gemini embed error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as { embedding: { values: number[] } }
    return { embedding: json.embedding.values }
  }

  if (input.operation === "GENERATE_IMAGE") {
    const imagenModel = input.model || "imagen-3.0-generate-001"
    const resp = await fetch(`${base}/models/${imagenModel}:generateImages?key=${input.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { text: input.imagePrompt || input.userPrompt },
        number_of_images: input.imageCount,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Gemini image generation error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as { generatedImages?: Array<{ imageBytes: string }> }
    const urls = (json.generatedImages ?? []).map(
      (img, i) => `data:image/png;base64,${img.imageBytes}` // Gemini returns base64
    )
    return { imageUrls: urls, rawResponse: json }
  }

  if (input.operation === "CLASSIFY") {
    const classifyPrompt = buildClassifyPrompt(
      input.userPrompt,
      input.classifyLabels,
      input.classifyExamples,
    )
    const resp = await fetch(`${base}/models/${model}:generateContent?key=${input.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: classifyPrompt }] }], generationConfig: { temperature: 0, maxOutputTokens: 20 } }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Gemini classify error ${resp.status}: ${err}`)
    }
    const json = await resp.json() as GeminiResponse
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    const parsed = parseClassifyResponse(text, input.classifyLabels)
    return { ...parsed, text }
  }

  // Build contents array
  const contents: GeminiContent[] = []

  // History
  for (const h of input.history) {
    contents.push({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.content }] })
  }

  // Current user message
  if (input.operation === "VISION" && input.imageUrls.length > 0) {
    const parts: GeminiPart[] = []
    for (const url of input.imageUrls) {
      if (url.startsWith("data:")) {
        const [meta, data] = url.split(",")
        const mimeMatch = meta.match(/data:([^;]+)/)
        parts.push({ inline_data: { mime_type: mimeMatch?.[1] ?? "image/jpeg", data: data } })
      } else {
        parts.push({ file_data: { file_uri: url } })
      }
    }
    if (input.userPrompt) parts.push({ text: input.userPrompt })
    contents.push({ role: "user", parts })
  } else {
    contents.push({ role: "user", parts: [{ text: input.userPrompt }] })
  }

  const generationConfig: Record<string, unknown> = {
    temperature: input.temperature,
    maxOutputTokens: input.maxTokens,
    topP: input.topP,
  }

  if (input.operation === "STRUCTURED_OUTPUT") {
    generationConfig.responseMimeType = "application/json"
    if (input.jsonSchema) {
      const schema = tryParseJson<Record<string, unknown>>(input.jsonSchema, {})
      if (Object.keys(schema).length) {
        generationConfig.responseSchema = schema
      }
    }
  }

  const reqBody: Record<string, unknown> = { contents, generationConfig }
  if (input.systemPrompt) {
    reqBody.systemInstruction = { parts: [{ text: input.systemPrompt }] }
  }

  if (input.operation === "TOOL_USE" && input.toolsJson) {
    const tools = tryParseJson<unknown[]>(input.toolsJson, [])
    if (tools.length > 0) reqBody.tools = [{ function_declarations: tools }]
  }

  const resp = await fetch(`${base}/models/${model}:generateContent?key=${input.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Gemini error ${resp.status}: ${err}`)
  }

  const json = await resp.json() as GeminiResponse
  const candidate = json.candidates?.[0]
  const textPart = candidate?.content?.parts?.find((p) => "text" in p)
  const text = textPart?.text ?? ""

  const funcCalls = candidate?.content?.parts?.filter((p) => "functionCall" in p) ?? []

  const usage = json.usageMetadata
    ? {
        promptTokens: json.usageMetadata.promptTokenCount,
        completionTokens: json.usageMetadata.candidatesTokenCount,
        totalTokens: json.usageMetadata.totalTokenCount,
      }
    : undefined

  const output: AICallOutput = { text, usage, rawResponse: json }

  if (input.operation === "STRUCTURED_OUTPUT" && text) {
    output.json = tryParseJson(text, null)
  }

  if (funcCalls.length > 0) {
    output.toolCalls = funcCalls.map((p) => ({
      id: `${p.functionCall!.name}-${Date.now()}`,
      name: p.functionCall!.name,
      arguments: p.functionCall!.args ?? {},
    }))
  }

  return output
}

// Gemini types
interface GeminiPart {
  text?: string
  inline_data?: { mime_type: string; data: string }
  file_data?: { file_uri: string }
  functionCall?: { name: string; args?: Record<string, unknown> }
}
interface GeminiContent { role: string; parts: GeminiPart[] }
interface GeminiResponse {
  candidates?: Array<{ content: GeminiContent; finishReason?: string }>
  usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number }
}

// ── Groq (OpenAI-compatible) ──────────────────────────────────────────────────

export async function callGroq(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "llama-3.3-70b-versatile"
  return callOpenAICompat("https://api.groq.com/openai/v1", input.apiKey, { ...input, model })
}

// ── xAI (OpenAI-compatible) ───────────────────────────────────────────────────

export async function callXAI(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "grok-3-beta"
  return callOpenAICompat("https://api.x.ai/v1", input.apiKey, { ...input, model })
}

// ── DeepSeek (OpenAI-compatible) ─────────────────────────────────────────────

export async function callDeepSeek(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "deepseek-chat"
  const output = await callOpenAICompat("https://api.deepseek.com", input.apiKey, { ...input, model })
  // Extract reasoning_content from deepseek-reasoner responses
  const raw = output.rawResponse as { choices?: Array<{ message?: { reasoning_content?: string } }> } | undefined
  const reasoning = raw?.choices?.[0]?.message?.reasoning_content
  if (reasoning && typeof reasoning === "string") {
    return { ...output, rawResponse: { ...((output.rawResponse as object) ?? {}), reasoning_content: reasoning } }
  }
  return output
}

// ── Perplexity (OpenAI-compatible) ───────────────────────────────────────────

export async function callPerplexity(input: AICallInput): Promise<AICallOutput> {
  const model = input.model || "sonar-pro"
  const output = await callOpenAICompat("https://api.perplexity.ai", input.apiKey, { ...input, model })
  return output
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export async function callProvider(input: AICallInput): Promise<AICallOutput> {
  switch (input.provider) {
    case "OPENAI":
      return callOpenAI(input)
    case "ANTHROPIC":
      return callAnthropic(input)
    case "GEMINI":
      return callGemini(input)
    case "GROQ":
      return callGroq(input)
    case "XAI":
      return callXAI(input)
    case "DEEPSEEK":
      return callDeepSeek(input)
    case "PERPLEXITY":
      return callPerplexity(input)
    default:
      throw new Error(`Unknown AI provider: ${String(input.provider)}`)
  }
}
