import {
  Bot,
  Clock,
  Code,
  CreditCard,
  FileText,
  GitBranch,
  Globe,
  Link,
  Mail,
  MessageCircle,
  MousePointer,
  Repeat,
  Send,
  SlidersHorizontal,
  Table,
  Zap,
} from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Nodes Overview" };

/* ── helpers ─────────────────────────────────────────────────────────── */

function SectionHeader({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <h2 id={id} className="mt-14 text-2xl font-bold">
        {title}
      </h2>
      <p className="mt-2 text-foreground/80">{description}</p>
    </>
  );
}

function NodeCard({
  id,
  title,
  desc,
  icon,
  logo,
  credential,
  operations,
}: {
  id: string;
  title: string;
  desc: string;
  icon?: React.ElementType;
  logo?: string;
  credential?: string;
  operations?: string;
}) {
  const Icon = icon;
  return (
    <div
      id={id}
      className="rounded-xl border border-border bg-card p-5 scroll-mt-20"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
          {logo ? (
            <Image src={logo} alt={title} width={22} height={22} />
          ) : Icon ? (
            <Icon className="size-5 text-orange" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {(credential || operations) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {credential && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              Credential: {credential}
            </span>
          )}
          {operations && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              {operations}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────── */

export default function NodesOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Nodes" }]} />

      <h1 className="text-4xl font-bold tracking-tight">All Nodes</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Nodebase has <strong>29 nodes</strong> across 7 categories.
        Each node performs a specific action — from calling an API to sending a
        WhatsApp message. This page gives you a quick overview of every node available.
      </p>

      <Callout type="tip">
        <strong>Template variables</strong> like{" "}
        <code className="font-mono text-sm">{"{{body.email}}"}</code> let you
        pass data between nodes. Refer to the{" "}
        <a href="/docs/getting-started#template-variables" className="underline">
          Template Variables guide
        </a>{" "}
        for details.
      </Callout>

      {/* ━━━━━━ TRIGGERS ━━━━━━ */}
      <SectionHeader
        id="triggers"
        title=" Trigger Nodes"
        description="Triggers start your workflow. Every workflow needs exactly one trigger."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NodeCard
          id="manual-trigger"
          title="Manual Trigger"
          desc="Click a button to run your workflow. Great for testing and one-off tasks."
          icon={MousePointer}
        />
        <NodeCard
          id="webhook-trigger"
          title="Webhook Trigger"
          desc="Receive HTTP requests from any service. Generates a unique URL automatically."
          icon={Link}
          operations="GET · POST · PUT · PATCH"
        />
        <NodeCard
          id="schedule-trigger"
          title="Schedule Trigger"
          desc="Run workflows on a schedule using cron expressions. Timezone-aware."
          icon={Clock}
        />
        <NodeCard
          id="google-form-trigger"
          title="Google Form Trigger"
          desc="Start a workflow when someone submits a Google Form."
          logo="/logos/googleform.svg"
        />
        <NodeCard
          id="stripe-trigger"
          title="Stripe Trigger"
          desc="React to Stripe payment events — payments, subscriptions, invoices, refunds."
          logo="/logos/stripe.svg"
        />
      </div>

      <h3 className="mt-6 text-lg font-semibold">Trigger Output</h3>
      <p className="mt-1 text-sm text-foreground/80">
        All triggers output data as context. Use template variables to access it:
      </p>
      <CodeBlock
        language="json"
        title="Webhook trigger output example"
        code={`{
  "body": { "name": "Rahul", "email": "rahul@example.com" },
  "headers": { "content-type": "application/json" },
  "query": { "source": "landing-page" },
  "method": "POST"
}`}
      />
      <p className="mt-2 text-sm text-foreground/80">
        Access fields with{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange text-sm">
          {"{{body.email}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange text-sm">
          {"{{query.source}}"}
        </code>
      </p>

      {/* ━━━━━━ AI NODES ━━━━━━ */}
      <SectionHeader
        id="ai-nodes"
        title=" AI Nodes"
        description="Send prompts to large language models and get text responses. All AI nodes share the same interface."
      />
      <p className="mt-3 text-sm text-foreground/80">
        Every AI node takes a <strong>System Prompt</strong> (personality),{" "}
        <strong>User Prompt</strong> (the question), and a{" "}
        <strong>Variable Name</strong> to store the output.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NodeCard
          id="gemini"
          title="Gemini"
          desc="Google's AI model. Fast, powerful, great for most tasks."
          logo="/logos/gemini.svg"
          credential="GEMINI"
          operations="gemini-2.5-flash"
        />
        <NodeCard
          id="openai"
          title="OpenAI"
          desc="GPT-4 by OpenAI. The gold standard for AI text generation."
          logo="/logos/openai.svg"
          credential="OPENAI"
          operations="gpt-4"
        />
        <NodeCard
          id="anthropic"
          title="Anthropic"
          desc="Claude by Anthropic. Known for safety, accuracy, and long-context."
          logo="/logos/anthropic.svg"
          credential="ANTHROPIC"
          operations="claude-sonnet-4-0"
        />
        <NodeCard
          id="xai"
          title="xAI (Grok)"
          desc="Grok by xAI. Built for reasoning and real-time knowledge."
          logo="/logos/xai.svg"
          credential="XAI"
        />
        <NodeCard
          id="deepseek"
          title="DeepSeek"
          desc="Strong reasoning capabilities at competitive pricing."
          logo="/logos/deepseek.svg"
          credential="DEEPSEEK"
        />
        <NodeCard
          id="perplexity"
          title="Perplexity"
          desc="Combines search with AI for research-backed answers."
          logo="/logos/perplexity.svg"
          credential="PERPLEXITY"
        />
        <NodeCard
          id="groq"
          title="Groq"
          desc="Ultra-fast inference for real-time applications."
          logo="/logos/groq.svg"
          credential="GROQ"
        />
      </div>

      <h3 className="mt-6 text-lg font-semibold">AI Node Output</h3>
      <CodeBlock
        language="json"
        title="All AI nodes output the same format"
        code={`{
  "myAI": {
    "aiResponse": "The AI's response text goes here..."
  }
}`}
      />
      <p className="mt-2 text-sm text-foreground/80">
        Use{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange text-sm">
          {"{{myAI.aiResponse}}"}
        </code>{" "}
        in the next node (where <code className="font-mono text-sm">myAI</code> is your chosen variable name).
      </p>

      <Callout type="tip">
        <strong>Example workflow:</strong> Webhook → Gemini (&quot;Summarize this
        feedback: {"{{body.feedback}}"}&quot;) → Slack (post summary)
      </Callout>

      {/* ━━━━━━ MESSAGING ━━━━━━ */}
      <SectionHeader
        id="messaging"
        title=" Messaging Nodes"
        description="Send messages and notifications to your team or customers."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NodeCard
          id="whatsapp-overview"
          title="WhatsApp"
          desc="Send text, templates, images, documents, and reactions via WhatsApp Business API."
          logo="/logos/whatsapp.svg"
          credential="WHATSAPP"
          operations="5 operations"
        />
        <NodeCard
          id="discord"
          title="Discord"
          desc="Send messages to Discord channels via webhooks. Max 2,000 characters."
          logo="/logos/discord.svg"
          operations="Webhook URL"
        />
        <NodeCard
          id="slack"
          title="Slack"
          desc="Post messages to Slack channels via incoming webhooks. Max 2,000 characters."
          logo="/logos/slack.svg"
          operations="Webhook URL"
        />
        <NodeCard
          id="telegram"
          title="Telegram"
          desc="Send messages through a Telegram bot. Max 4,096 characters."
          logo="/logos/telegram.svg"
          operations="Bot Token + Chat ID"
        />
        <NodeCard
          id="x-twitter"
          title="X (Twitter)"
          desc="Post tweets from your workflow. Max 280 characters."
          logo="/logos/x.svg"
          operations="OAuth 1.0a"
        />
      </div>

      <h3 id="discord-setup" className="mt-6 text-lg font-semibold">
        Discord Setup
      </h3>
      <p className="mt-1 text-sm text-foreground/80">
        Right-click a channel → Edit Channel → Integrations → Webhooks → Create
        webhook and copy the URL.
      </p>

      <h3 id="slack-setup" className="mt-6 text-lg font-semibold">
        Slack Setup
      </h3>
      <p className="mt-1 text-sm text-foreground/80">
        Go to <strong>api.slack.com/apps</strong> → Create App → Incoming
        Webhooks → Enable and create a webhook for your channel.
      </p>

      <h3 id="telegram-setup" className="mt-6 text-lg font-semibold">
        Telegram Setup
      </h3>
      <p className="mt-1 text-sm text-foreground/80">
        Message <strong>@BotFather</strong> on Telegram → <code className="font-mono text-sm">/newbot</code> →
        copy the bot token. Add the bot to your group and get the chat ID from the Telegram API.
      </p>

      <Callout type="info">
        All messaging nodes support <strong>template variables</strong> in the
        message content:{" "}
        <code className="font-mono text-sm">
          {"Hi {{body.name}}, your order #{{body.orderId}} is confirmed!"}
        </code>
      </Callout>

      {/* ━━━━━━ GOOGLE ━━━━━━ */}
      <SectionHeader
        id="google-workspace"
        title=" Google Workspace Nodes"
        description="Integrate with Gmail, Google Sheets, and Google Drive."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NodeCard
          id="gmail-overview"
          title="Gmail"
          desc="Send emails — plain text or HTML. Supports template variables in all fields."
          logo="/logos/gmail.svg"
          credential="GMAIL"
          operations="Email + App Password"
        />
        <NodeCard
          id="sheets-overview"
          title="Google Sheets"
          desc="Read rows from or append rows to any Google Spreadsheet."
          logo="/logos/googlesheets.svg"
          credential="GOOGLE_SHEETS"
          operations="APPEND_ROW · READ_ROWS"
        />
        <NodeCard
          id="google-drive"
          title="Google Drive"
          desc="Upload, download, list files, and create folders in Google Drive."
          logo="/logos/google-drive.svg"
          credential="GOOGLE_DRIVE"
          operations="4 operations"
        />
      </div>

      <h3 className="mt-6 text-lg font-semibold">Google Drive Operations</h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Operation</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 font-medium">UPLOAD_FILE</td>
              <td className="px-4 py-2 text-muted-foreground">Upload a file (needs fileContent from a previous node)</td>
            </tr>
            <tr className="bg-muted/30">
              <td className="px-4 py-2 font-medium">DOWNLOAD_FILE</td>
              <td className="px-4 py-2 text-muted-foreground">Download a file by its ID</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">LIST_FILES</td>
              <td className="px-4 py-2 text-muted-foreground">List files in a folder or matching a query</td>
            </tr>
            <tr className="bg-muted/30">
              <td className="px-4 py-2 font-medium">CREATE_FOLDER</td>
              <td className="px-4 py-2 text-muted-foreground">Create a new folder in Drive</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ━━━━━━ PAYMENTS & SAAS ━━━━━━ */}
      <SectionHeader
        id="payments-saas"
        title=" Payments & SaaS Nodes"
        description="Integrate with Razorpay, Notion, and Workday for payments, databases, and HR."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NodeCard
          id="razorpay-overview"
          title="Razorpay"
          desc="Complete Razorpay API — orders, payments, refunds, subscriptions, invoices, payment links, payouts."
          credential="RAZORPAY"
          operations="28 operations"
          icon={CreditCard}
        />
        <NodeCard
          id="notion-overview"
          title="Notion"
          desc="Full Notion API — databases, pages, blocks, search, and user management."
          logo="/logos/notion.svg"
          credential="NOTION"
          operations="11 operations"
        />
        <NodeCard
          id="workday"
          title="Workday"
          desc="HR and finance operations — workers, invoices, expenses, time off, contacts."
          logo="/logos/workday.svg"
          operations="6 operations"
        />
      </div>

      <Callout type="tip">
        See the dedicated <a href="/docs/nodes/razorpay" className="underline font-medium">Razorpay</a>,{" "}
        <a href="/docs/nodes/notion" className="underline font-medium">Notion</a>,{" "}
        and <a href="/docs/nodes/whatsapp" className="underline font-medium">WhatsApp</a> pages
        for full operation details and examples.
      </Callout>

      {/* ━━━━━━ UTILITY & LOGIC ━━━━━━ */}
      <SectionHeader
        id="utility-logic"
        title="🛠️ Utility & Logic Nodes"
        description="Transform data, write code, add conditional logic, and loop over arrays."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NodeCard
          id="http-overview"
          title="HTTP Request"
          desc="Make HTTP calls to any API — GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS."
          icon={Globe}
          operations="4 auth types · 4 body types"
        />
        <NodeCard
          id="if-else"
          title="If / Else"
          desc="Route data down different paths based on conditions. 15 comparison operators."
          icon={GitBranch}
          operations="15 operators"
        />
        <NodeCard
          id="set-variable"
          title="Set Variable"
          desc="Create or rename variables to organize data. Set multiple key-value pairs."
          icon={SlidersHorizontal}
        />
        <NodeCard
          id="code-overview"
          title="Code"
          desc="Write custom JavaScript in a sandboxed environment. 5s timeout, access $input."
          icon={Code}
          operations="Sandboxed JS"
        />
        <NodeCard
          id="loop-overview"
          title="Loop"
          desc="Iterate over an array and run downstream nodes for each item. Max 100 iterations."
          icon={Repeat}
          operations="Max 100 items"
        />
      </div>

      <h3 id="if-else-operators" className="mt-6 text-lg font-semibold">
        If / Else — Available Operators
      </h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Operator</th>
              <th className="px-4 py-2 text-left font-semibold">Example</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Equals", 'body.status equals "paid"'],
              ["Not Equals", 'body.type not equals "test"'],
              ["Contains", 'body.email contains "@gmail.com"'],
              ["Starts With", 'body.phone starts with "+91"'],
              ["Ends With", 'body.email ends with ".in"'],
              ["Greater Than", "body.amount > 1000"],
              ["Less Than", "body.age < 18"],
              ["Is Empty", "body.notes is empty"],
              ["Is True / Is False", "body.isVerified is true"],
              ["Regex Match", "body.phone matches ^\\+91\\d{10}$"],
            ].map(([op, ex], i) => (
              <tr key={op} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2 font-medium">{op}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                  {ex}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 id="set-variable-example" className="mt-8 text-lg font-semibold">
        Set Variable — Example
      </h3>
      <CodeBlock
        language="json"
        title="Flatten complex data into simple variables"
        code={`Pairs:
  customerName  →  "{{body.data.customer.first_name}} {{body.data.customer.last_name}}"
  orderTotal    →  "₹{{body.data.order.total}}"
  customerEmail →  "{{body.data.customer.email}}"

Then use {{customerName}}, {{orderTotal}}, etc. in downstream nodes.`}
      />

      <h3 id="code-example" className="mt-8 text-lg font-semibold">
        Code Node — Available APIs
      </h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Variable</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 font-mono text-orange">$input</td>
              <td className="px-4 py-2 text-muted-foreground">Full workflow context (all upstream data)</td>
            </tr>
            <tr className="bg-muted/30">
              <td className="px-4 py-2 font-mono text-orange">$json</td>
              <td className="px-4 py-2 text-muted-foreground">Alias for $input</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-orange">console.log</td>
              <td className="px-4 py-2 text-muted-foreground">Log to server output</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout type="warning">
        The Code node runs in a <strong>sandbox</strong>. No{" "}
        <code className="font-mono text-sm">fetch</code>,{" "}
        <code className="font-mono text-sm">require</code>,{" "}
        <code className="font-mono text-sm">fs</code>, or{" "}
        <code className="font-mono text-sm">process</code>. Use the{" "}
        <strong>HTTP Request</strong> node for API calls.
      </Callout>

      {/* ━━━━━━ SUMMARY TABLE ━━━━━━ */}
      <h2 id="summary" className="mt-14 text-2xl font-bold">
        Quick Reference
      </h2>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left font-semibold">Node</th>
              <th className="px-3 py-2 text-left font-semibold">Category</th>
              <th className="px-3 py-2 text-left font-semibold">Credential</th>
              <th className="px-3 py-2 text-left font-semibold">Ops</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Manual Trigger", "Trigger", "—", "—"],
              ["Webhook Trigger", "Trigger", "—", "—"],
              ["Schedule Trigger", "Trigger", "—", "—"],
              ["Gemini", "AI", "✅", "1"],
              ["OpenAI", "AI", "✅", "1"],
              ["Anthropic", "AI", "✅", "1"],
              ["xAI", "AI", "✅", "1"],
              ["DeepSeek", "AI", "✅", "1"],
              ["Perplexity", "AI", "✅", "1"],
              ["Groq", "AI", "✅", "1"],
              ["WhatsApp", "Messaging", "✅", "5"],
              ["Discord", "Messaging", "—", "1"],
              ["Slack", "Messaging", "—", "1"],
              ["Telegram", "Messaging", "—", "1"],
              ["X (Twitter)", "Messaging", "—", "1"],
              ["Gmail", "Google", "✅", "1"],
              ["Google Sheets", "Google", "✅", "2"],
              ["Google Drive", "Google", "✅", "4"],
              ["Razorpay", "Payment", "✅", "28"],
              ["Notion", "SaaS", "✅", "11"],
              ["Workday", "SaaS", "—", "6"],
              ["HTTP Request", "Utility", "—", "7"],
              ["If / Else", "Logic", "—", "15 ops"],
              ["Set Variable", "Utility", "—", "1"],
              ["Code", "Utility", "—", "1"],
              ["Loop", "Utility", "—", "1"],
            ].map(([name, cat, cred, ops], i) => (
              <tr key={name} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-3 py-1.5 font-medium">{name}</td>
                <td className="px-3 py-1.5 text-muted-foreground">{cat}</td>
                <td className="px-3 py-1.5 text-center">{cred}</td>
                <td className="px-3 py-1.5 text-center text-muted-foreground">
                  {ops}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>29 nodes</strong> · <strong>13 credential types</strong> ·{" "}
        <strong>90+ operations</strong> — and growing. Missing a node?
        Let us know!
      </Callout>

      <PrevNextLinks />
    </>
  );
}
