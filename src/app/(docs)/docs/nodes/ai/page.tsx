import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "AI Nodes" };

export default function AiNodesPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "AI Nodes" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">AI Nodes</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Add AI-generated responses to any workflow. Nodebase includes 7 AI
        provider nodes — OpenAI, Anthropic, Gemini, Groq, DeepSeek, Perplexity,
        and xAI. All share the same interface: a prompt, an optional system
        prompt, and an output with the response text and token usage.
      </p>

      {/* Provider Comparison */}
      <h2 id="providers" className="mt-12 text-2xl font-bold">
        Provider Comparison
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Node</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Default Model
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Best For
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Variable Prefix
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "OpenAI",
                "gpt-4o",
                "General purpose, function calling, vision",
                "{{openAI.content}}",
              ],
              [
                "Anthropic",
                "claude-sonnet-4-5",
                "Long context, complex reasoning, document analysis",
                "{{anthropic.content}}",
              ],
              [
                "Gemini",
                "gemini-2.0-flash",
                "Fast, multimodal (image + text)",
                "{{gemini.content}}",
              ],
              [
                "Groq",
                "llama-3.3-70b",
                "Fastest inference — ideal for real-time chatbots",
                "{{groq.content}}",
              ],
              [
                "DeepSeek",
                "deepseek-chat",
                "Cost-effective, strong at coding tasks",
                "{{deepSeek.content}}",
              ],
              [
                "Perplexity",
                "sonar-pro",
                "Web search included — answers with citations",
                "{{perplexity.content}}",
              ],
              [
                "xAI",
                "grok-2-latest",
                "Real-time knowledge, current events",
                "{{xAI.content}}",
              ],
            ].map(([node, model, bestFor, prefix], i) => (
              <tr key={node} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{node}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {model}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{bestFor}</td>
                <td className="px-4 py-2.5">
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-orange">
                    {prefix}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Common Interface */}
      <h2 id="interface" className="mt-12 text-2xl font-bold">
        Common Configuration
      </h2>
      <p className="mt-3 text-foreground/80">
        All AI nodes share the same fields:
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Field</th>
              <th className="px-4 py-2.5 text-left font-semibold">Required</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Supports Variables
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Credential",
                "Yes",
                "API key for the selected provider",
                "No",
              ],
              [
                "Model",
                "Yes",
                "Model name — see provider comparison table above",
                "No",
              ],
              [
                "Prompt",
                "Yes",
                "The user message or question to send to the AI",
                "Yes",
              ],
              [
                "System Prompt",
                "No",
                "Instructions that set the AI's behaviour and persona",
                "Yes",
              ],
            ].map(([field, required, desc, vars], i) => (
              <tr key={field} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{field}</td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className={
                      required === "Yes"
                        ? "text-xs font-medium text-red-500"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {required}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
                <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                  {vars}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Common Output */}
      <h2 id="output" className="mt-12 text-2xl font-bold">
        Output Variables
      </h2>
      <p className="mt-3 text-foreground/80">
        All AI nodes output the same structure (replace{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          nodeName
        </code>{" "}
        with the variable name configured for that node):
      </p>
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "nodeName": {
    "content": "Your order #SHP-001 has been dispatched and will arrive in 3-5 days.",
    "model": "gpt-4o",
    "usage": {
      "prompt_tokens": 85,
      "completion_tokens": 24,
      "total_tokens": 109
    }
  }
}`}
      />

      {/* Credentials Setup */}
      <h2 id="credentials" className="mt-12 text-2xl font-bold">
        Setting Up Credentials
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Provider</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                API Key Location
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["OpenAI", "platform.openai.com → API keys"],
              ["Anthropic", "console.anthropic.com → API Keys"],
              ["Gemini", "aistudio.google.com → Get API Key"],
              ["Groq", "console.groq.com → API Keys"],
              ["DeepSeek", "platform.deepseek.com → API Keys"],
              ["Perplexity", "www.perplexity.ai → Settings → API"],
              ["xAI", "console.x.ai → API Keys"],
            ].map(([provider, location], i) => (
              <tr key={provider} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{provider}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ol className="mt-4 list-inside list-decimal space-y-1 text-foreground/80">
        <li>
          Go to <strong>Settings → Credentials</strong>
        </li>
        <li>
          Click <strong>Add Credential</strong>
        </li>
        <li>Select the provider (e.g. OpenAI)</li>
        <li>Paste the API key</li>
        <li>
          Click <strong>Save</strong>
        </li>
      </ol>

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-whatsapp-bot" className="mt-8 text-xl font-semibold">
        WhatsApp AI Customer Support Bot
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Automatically answer customer questions on
        WhatsApp using Groq for fast responses.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`WhatsApp Trigger (messageTypes: text)
→ Groq
    model:        llama-3.3-70b
    systemPrompt: "You are a helpful customer support agent for Priya's Clothing Store.
                   Answer questions about orders, returns, and products.
                   Be concise — max 3 sentences."
    prompt:       "Customer message: {{whatsappTrigger.text}}
                   Customer name: {{whatsappTrigger.senderName}}"
→ WhatsApp — Send Message
    to:      {{whatsappTrigger.from}}
    message: {{groq.content}}`}
      />

      <h3 id="example-order-summary" className="mt-8 text-xl font-semibold">
        AI Order Confirmation Email
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Generate a personalised, friendly order
        confirmation email using OpenAI.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (payment.captured)
→ OpenAI
    model:        gpt-4o-mini
    systemPrompt: "You are a friendly email writer for an Indian D2C clothing brand.
                   Write warm, professional emails in English."
    prompt:       "Write an order confirmation email for:
                   Customer: {{razorpayTrigger.payload.payment.entity.notes.name}}
                   Amount: ₹{{razorpayTrigger.payload.payment.entity.amount}} (note: divide by 100)
                   Payment ID: {{razorpayTrigger.payload.payment.entity.id}}
                   Keep it under 100 words."
→ Gmail — Send Email
    to:      {{razorpayTrigger.payload.payment.entity.email}}
    subject: "Your order is confirmed! 🎉"
    body:    {{openAI.content}}`}
      />

      <h3
        id="example-perplexity-research"
        className="mt-8 text-xl font-semibold"
      >
        Market Research with Perplexity
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Get up-to-date market data for a product
        category with web search included.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Webhook Trigger (POST /research, body: { category })
→ Perplexity
    model:  sonar-pro
    prompt: "What are the top 5 trending products in the {{body.category}} category
             in India this month? Include prices and where to buy."
→ Slack — Send Message
    channel: #market-research
    text:    "Research for {{body.category}}:\n{{perplexity.content}}"`}
      />

      {/* Choosing a Provider */}
      <h2 id="choosing" className="mt-12 text-2xl font-bold">
        Choosing the Right Provider
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Use Case</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Recommended Provider
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Real-time WhatsApp chatbot",
                "Groq",
                "Fastest inference — sub-second responses",
              ],
              [
                "Long document analysis",
                "Anthropic",
                "200K context window, best at following instructions",
              ],
              [
                "Cost-sensitive bulk processing",
                "DeepSeek",
                "Cheapest per token, good quality",
              ],
              [
                "Research with current data",
                "Perplexity",
                "Built-in web search — no need for separate HTTP request",
              ],
              [
                "Image + text tasks",
                "Gemini",
                "Multimodal support with fast flash model",
              ],
              [
                "General purpose / function calling",
                "OpenAI",
                "Best ecosystem, most reliable, strong reasoning",
              ],
              [
                "Current events / news",
                "xAI",
                "Real-time knowledge cutoff",
              ],
            ].map(([useCase, provider, reason], i) => (
              <tr key={useCase} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{useCase}</td>
                <td className="px-4 py-2.5 font-medium text-orange">
                  {provider}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Common Issues */}
      <h2 id="issues" className="mt-12 text-2xl font-bold">
        Common Issues &amp; Solutions
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Issue</th>
              <th className="px-4 py-2.5 text-left font-semibold">Cause</th>
              <th className="px-4 py-2.5 text-left font-semibold">Solution</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "401 Unauthorized",
                "Invalid or expired API key",
                "Re-generate the API key from the provider dashboard and update the credential",
              ],
              [
                "429 Rate Limit",
                "Too many requests to the provider",
                "Upgrade your provider plan or add a Wait node between AI calls",
              ],
              [
                "Response is cut off",
                "Max tokens limit reached",
                "Increase the max_tokens setting or shorten your prompt",
              ],
              [
                "Slow response in WhatsApp bot",
                "Using a large model",
                "Switch to Groq (llama-3.3-70b) for fastest response time",
              ],
            ].map(([issue, cause, solution], i) => (
              <tr key={issue} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{issue}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{cause}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {solution}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Related Nodes */}
      <h2 id="related" className="mt-12 text-2xl font-bold">
        Related Nodes
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <a href="/docs/nodes/whatsapp-trigger" className="text-orange underline">
            WhatsApp Trigger
          </a>{" "}
          — use AI to respond to incoming messages
        </li>
        <li>
          <a href="/docs/nodes/gmail" className="text-orange underline">
            Gmail
          </a>{" "}
          — send AI-generated email content
        </li>
        <li>
          <a href="/docs/nodes/code" className="text-orange underline">
            Code
          </a>{" "}
          — post-process AI output with custom JavaScript
        </li>
        <li>
          <a href="/docs/nodes/set-variable" className="text-orange underline">
            Set Variable
          </a>{" "}
          — save AI response to a named variable for reuse
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
