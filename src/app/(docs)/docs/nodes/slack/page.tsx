import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Slack Node" };

export default function SlackPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Slack" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Slack Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Send messages, manage channels, post reactions, upload files, and manage
        Slack users from your workflows. Use it to alert your team on new
        orders, payment failures, or errors.
      </p>

      {/* Prerequisites */}
      <h2 id="prerequisites" className="mt-12 text-2xl font-bold">
        Prerequisites
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-2 text-foreground/80">
        <li>A Slack workspace where you have permission to add apps</li>
        <li>
          A Slack Bot Token (starts with{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            xoxb-
          </code>
          ) or an Incoming Webhook URL
        </li>
        <li>
          For Bot Token: invite the bot to the channel with{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            /invite @yourbot
          </code>
        </li>
      </ul>

      {/* Credentials */}
      <h2 id="credentials" className="mt-12 text-2xl font-bold">
        Credentials
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Field</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Where to find it
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Bot Token",
                "OAuth bot token for posting messages and managing channels",
                "api.slack.com → Your App → OAuth & Permissions → Bot User OAuth Token",
              ],
              [
                "Webhook URL",
                "Alternative to Bot Token — simpler but send-only",
                "api.slack.com → Your App → Incoming Webhooks → Add New Webhook",
              ],
            ].map(([field, desc, where], i) => (
              <tr key={field} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{field}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      {/* MESSAGE_SEND */}
      <h3 id="message-send" className="mt-8 text-xl font-semibold">
        Send Message
      </h3>
      <p className="mt-2 text-foreground/80">
        Post a message to a Slack channel or user. Supports plain text and
        Block Kit blocks for rich formatting.
      </p>
      <PropertyTable
        properties={[
          {
            name: "channel",
            type: "string",
            required: true,
            description:
              'Channel name (e.g. #orders) or user ID. Supports {{variables}}.',
          },
          {
            name: "text",
            type: "string",
            required: true,
            description: "Message text. Supports {{variables}} and Slack markdown.",
          },
          {
            name: "blocks",
            type: "JSON",
            required: false,
            description: "Block Kit JSON for rich formatting (buttons, sections, images)",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "slack": {
    "ts": "1712051400.123456",
    "channel": "C07ABCDEF12",
    "message": {
      "text": "New order received",
      "ts": "1712051400.123456"
    }
  }
}`}
      />
      <CodeBlock
        language="text"
        title="Example — order alert"
        code={`Razorpay Trigger (payment.captured)
→ Slack — Send Message
    channel: #orders
    text:    "💸 New payment from {{razorpayTrigger.payload.payment.entity.email}}
              Amount: ₹{{razorpayTrigger.payload.payment.entity.amount}} paise
              Payment ID: {{razorpayTrigger.payload.payment.entity.id}}"`}
      />

      <h3 id="other-operations" className="mt-8 text-xl font-semibold">
        Other Operations
      </h3>
      <p className="mt-2 text-foreground/80">
        The Slack node supports 25 operations across messages, channels, users,
        reactions, and files:
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">
                Category
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Operations
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Messages", "Send Message · Update Message · Delete Message · Get Message · Get Thread"],
              ["Channels", "Create Channel · Archive Channel · Invite to Channel · Get Channel Info · List Channels"],
              ["Users", "Get User · Get User by Email · List Users"],
              ["Reactions", "Add Reaction · Remove Reaction · Get Reactions"],
              ["Files", "Upload File · Get File · List Files · Delete File"],
            ].map(([cat, ops], i) => (
              <tr key={cat} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{cat}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{ops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-error-alert" className="mt-8 text-xl font-semibold">
        Workflow Error Alerting
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> When any node in a workflow fails, send an
        alert to Slack with the error details.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Error Trigger
→ Slack — Send Message
    channel: #alerts
    text:    "🚨 Workflow error!
              Node: {{errorTrigger.failedNodeName}} ({{errorTrigger.failedNodeType}})
              Error: {{errorTrigger.message}}
              Workflow: {{errorTrigger.workflowId}}
              Time: {{errorTrigger.failedAt}}"`}
      />

      <h3 id="example-daily-report" className="mt-8 text-xl font-semibold">
        Daily Payment Summary
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Send a daily Slack summary of payments
        received.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Schedule Trigger (daily at 9 AM IST)
→ Razorpay — List Payments
    count: 100
→ Code Node
    const payments = $.get('razorpay.items');
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return { total, count: payments.length };
→ Slack — Send Message
    channel: #finance
    text:    "📊 Yesterday's payments:
              Count: {{code.count}}
              Total: ₹{{code.total}} paise"`}
      />

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
                "not_in_channel error",
                "Bot not invited to channel",
                "Run /invite @yourbot in the Slack channel",
              ],
              [
                "invalid_auth error",
                "Bot token expired or incorrect",
                "Re-generate the Bot User OAuth Token in your Slack app settings",
              ],
              [
                "channel_not_found",
                "Wrong channel name format",
                'Use the channel ID (C07ABCDEF12) instead of #channel-name for reliability',
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
          <a
            href="/docs/nodes/error-trigger"
            className="text-orange underline"
          >
            Error Trigger
          </a>{" "}
          — alert Slack when a workflow node fails
        </li>
        <li>
          <a
            href="/docs/nodes/razorpay-trigger"
            className="text-orange underline"
          >
            Razorpay Trigger
          </a>{" "}
          — notify Slack on new payments
        </li>
        <li>
          <a href="/docs/nodes/gmail" className="text-orange underline">
            Gmail
          </a>{" "}
          — send email alongside Slack notification
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
