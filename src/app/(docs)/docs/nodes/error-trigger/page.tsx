import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Error Trigger Node" };

export default function ErrorTriggerPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Error Trigger" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Error Trigger Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Start a separate error-handling workflow automatically when any node in
        your main workflow throws a non-retriable error. Use it to alert your
        team, log the failure, and recover gracefully.
      </p>

      {/* How It Works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Add an <strong>Error Trigger</strong> node as the first node in a
          dedicated error-handling workflow
        </li>
        <li>
          When any node in any other workflow throws a{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            NonRetriableError
          </code>
          , Nodebase automatically fires this trigger
        </li>
        <li>
          The error details (node name, error message, workflow ID) are
          injected into context
        </li>
        <li>
          Downstream nodes in the error workflow can alert your team, create a
          support ticket, or send a notification
        </li>
      </ol>

      <Callout type="info">
        The Error Trigger fires for <strong>non-retriable errors only</strong>.
        Transient errors (network timeouts, rate limits) are automatically
        retried by Inngest before the Error Trigger fires.
      </Callout>

      {/* Output Variables */}
      <h2 id="output" className="mt-12 text-2xl font-bold">
        Output Variables
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Variable</th>
              <th className="px-4 py-2.5 text-left font-semibold">Type</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">Example</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "{{errorTrigger.message}}",
                "string",
                "The error message from the failed node",
                '"Invalid API key"',
              ],
              [
                "{{errorTrigger.failedNodeName}}",
                "string",
                "Human-readable name of the node that failed",
                '"Shiprocket - Create Order"',
              ],
              [
                "{{errorTrigger.failedNodeId}}",
                "string",
                "Internal node ID",
                '"node_abc123"',
              ],
              [
                "{{errorTrigger.failedNodeType}}",
                "string",
                "Node type identifier",
                '"SHIPROCKET"',
              ],
              [
                "{{errorTrigger.failedAt}}",
                "string",
                "ISO timestamp of the failure",
                '"2026-04-01T10:30:00.000Z"',
              ],
              [
                "{{errorTrigger.workflowId}}",
                "string",
                "ID of the workflow that failed",
                '"wf_xyz789"',
              ],
              [
                "{{errorTrigger.executionId}}",
                "string",
                "ID of the specific execution that failed",
                '"exec_def456"',
              ],
            ].map(([variable, type, desc, example], i) => (
              <tr key={variable} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5">
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-orange">
                    {variable}
                  </code>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {type}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {example}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-slack-alert" className="mt-8 text-xl font-semibold">
        Slack Error Alert
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Alert the engineering team on Slack whenever
        any workflow node fails.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Error Trigger
→ Slack — Send Message
    channel: #alerts
    text:    "🚨 *Workflow Error*
              *Node:* {{errorTrigger.failedNodeName}} ({{errorTrigger.failedNodeType}})
              *Error:* {{errorTrigger.message}}
              *Workflow:* {{errorTrigger.workflowId}}
              *Execution:* {{errorTrigger.executionId}}
              *Time:* {{errorTrigger.failedAt}}"`}
      />

      <h3 id="example-multi-channel" className="mt-8 text-xl font-semibold">
        Multi-Channel Error Notification
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> For critical payment workflow failures, alert
        both Slack and email.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Error Trigger
→ If / Else
    Condition: {{errorTrigger.failedNodeType}} equals "RAZORPAY"
  TRUE  → Gmail — Send Email
            to:      tech@yourcompany.com
            subject: "CRITICAL: Razorpay node failed"
            body:    "Error: {{errorTrigger.message}}
                      Execution: {{errorTrigger.executionId}}"
          → Slack — Send Message
            channel: #critical-alerts
            text: "🔴 CRITICAL: Razorpay failure! {{errorTrigger.message}}"
  FALSE → Slack — Send Message
            channel: #alerts
            text: "⚠️ {{errorTrigger.failedNodeName}} failed: {{errorTrigger.message}}"`}
      />

      <h3 id="example-log-to-sheets" className="mt-8 text-xl font-semibold">
        Log Errors to Google Sheets
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Maintain a full error log for compliance and
        debugging.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Error Trigger
→ Google Sheets — Append Row
    spreadsheetId: {{env.ERROR_LOG_SHEET_ID}}
    values:
      - timestamp:    {{errorTrigger.failedAt}}
      - workflowId:   {{errorTrigger.workflowId}}
      - executionId:  {{errorTrigger.executionId}}
      - nodeName:     {{errorTrigger.failedNodeName}}
      - nodeType:     {{errorTrigger.failedNodeType}}
      - errorMessage: {{errorTrigger.message}}`}
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
                "Error Trigger not firing",
                "Error is retriable — Inngest is still retrying",
                "Error Trigger only fires for NonRetriableError after all retries are exhausted",
              ],
              [
                "Error Trigger workflow itself fails",
                "Misconfigured Slack/Gmail in the error workflow",
                "Test your error workflow manually before relying on it in production",
              ],
              [
                "Too many Slack messages",
                "High-traffic workflow with frequent errors",
                'Add If/Else to only alert for specific node types, or add a Wait node to debounce',
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
          <a href="/docs/nodes/slack" className="text-orange underline">
            Slack
          </a>{" "}
          — send error alerts to your team channel
        </li>
        <li>
          <a href="/docs/nodes/gmail" className="text-orange underline">
            Gmail
          </a>{" "}
          — email critical error details to the dev team
        </li>
        <li>
          <a href="/docs/nodes/if-else" className="text-orange underline">
            If / Else
          </a>{" "}
          — route on{" "}
          <code className="font-mono text-sm">
            {"{{errorTrigger.failedNodeType}}"}
          </code>{" "}
          for different alert levels
        </li>
        <li>
          <a
            href="/docs/nodes/google-sheets"
            className="text-orange underline"
          >
            Google Sheets
          </a>{" "}
          — log errors for long-term audit trail
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
