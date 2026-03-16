import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Wait Node" };

export default function WaitPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Wait" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Wait Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Pause a workflow for a fixed duration, until a specific datetime, or
        until an external HTTP call resumes it. Powered by Inngest durable
        execution — the workflow state is preserved across the wait period.
      </p>

      {/* How It Works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <p className="mt-3 text-foreground/80">
        When a Wait node is reached, the workflow is suspended and its state is
        saved. No compute resources are used during the wait. Execution resumes
        automatically when the wait condition is met.
      </p>

      {/* Modes */}
      <h2 id="modes" className="mt-12 text-2xl font-bold">
        Modes
      </h2>

      <h3 id="mode-duration" className="mt-8 text-xl font-semibold">
        Duration
      </h3>
      <p className="mt-2 text-foreground/80">
        Pause for a fixed amount of time.
      </p>
      <PropertyTable
        properties={[
          {
            name: "amount",
            type: "number",
            required: true,
            description: "Number of time units to wait",
          },
          {
            name: "unit",
            type: "string",
            required: true,
            description: "seconds · minutes · hours · days · weeks",
          },
        ]}
      />
      <CodeBlock
        language="text"
        title="Example — send a follow-up SMS 24 hours later"
        code={`Razorpay Trigger (payment.captured)
→ MSG91 — Send SMS "Thank you for your order!"
→ Wait — Duration: 24 hours
→ MSG91 — Send SMS "How was your experience? Reply with your rating."`}
      />

      <h3 id="mode-until" className="mt-8 text-xl font-semibold">
        Until
      </h3>
      <p className="mt-2 text-foreground/80">
        Pause until a specific datetime.
      </p>
      <PropertyTable
        properties={[
          {
            name: "datetime",
            type: "string",
            required: true,
            description: "ISO 8601 datetime string, e.g. 2026-04-01T09:00:00+05:30",
          },
          {
            name: "timezone",
            type: "string",
            required: true,
            default: "Asia/Kolkata",
            description: "IANA timezone name",
          },
        ]}
      />
      <CodeBlock
        language="text"
        title="Example — send flash sale notification at 9 AM IST"
        code={`Schedule Trigger (daily at 8:50 AM IST)
→ Wait — Until: 2026-04-01T09:00:00+05:30
→ MSG91 — Send Bulk SMS "Flash sale starts NOW! 50% off for next 2 hours."`}
      />

      <h3 id="mode-webhook" className="mt-8 text-xl font-semibold">
        Webhook Resume
      </h3>
      <p className="mt-2 text-foreground/80">
        Pause the workflow and generate a unique URL. Resume execution by making
        a POST request to that URL with any payload. Use this for human approval
        flows, payment confirmation, or external system callbacks.
      </p>
      <PropertyTable
        properties={[
          {
            name: "timeout",
            type: "number",
            required: false,
            description: "Maximum time to wait in seconds before timing out",
          },
          {
            name: "onTimeout",
            type: "string",
            required: false,
            default: "continue",
            description: '"continue" — proceed after timeout | "fail" — throw error on timeout',
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output (webhook resume mode)"
        code={`{
  "wait": {
    "resumeUrl": "https://app.nodebase.in/api/resume/wf_abc123",
    "waitedMs": 42000,
    "resumedBy": "webhook",
    "resumedAt": "2026-04-01T10:30:00.000Z",
    "webhookData": { "approved": true, "approvedBy": "priya@example.com" }
  }
}`}
      />
      <CodeBlock
        language="text"
        title="Example — human approval flow"
        code={`Webhook Trigger (new refund request)
→ Slack — Send Message
    channel: #approvals
    text:    "Refund request from {{body.email}} — ₹{{body.amount}}
              Approve: POST {{wait.resumeUrl}} with {\"approved\": true}
              Reject:  POST {{wait.resumeUrl}} with {\"approved\": false}"
→ Wait — Webhook Resume (timeout: 86400, onTimeout: continue)
→ If / Else: {{wait.webhookData.approved}} is_true
  TRUE  → Razorpay — Create Refund
          → Gmail "Your refund has been approved"
  FALSE → Gmail "Your refund request was not approved"`}
      />

      <Callout type="info">
        <strong>Durable execution:</strong> The Wait node uses Inngest under the
        hood. Even if the server restarts, your workflow will resume exactly
        where it left off.
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
                "{{wait.waitedMs}}",
                "number",
                "Actual milliseconds waited",
                "86400000",
              ],
              [
                "{{wait.resumedBy}}",
                "string",
                '"duration" | "until" | "webhook" | "timeout"',
                '"webhook"',
              ],
              [
                "{{wait.resumedAt}}",
                "string",
                "ISO timestamp when execution resumed",
                '"2026-04-01T10:30:00.000Z"',
              ],
              [
                "{{wait.resumeUrl}}",
                "string",
                "URL to POST to resume (webhook mode only)",
                '"https://app.nodebase.in/api/resume/..."',
              ],
              [
                "{{wait.webhookData}}",
                "object",
                "Body of the POST request that resumed the workflow",
                '{ "approved": true }',
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
                "Workflow never resumes after webhook",
                "Resume URL called with GET instead of POST",
                "The resume URL only accepts HTTP POST requests",
              ],
              [
                "webhookData is empty",
                "Resume POST request had no body",
                "Send a JSON body in the POST request to the resume URL",
              ],
              [
                "Workflow timed out unexpectedly",
                "onTimeout is set to fail",
                'Change onTimeout to "continue" to proceed after timeout instead of erroring',
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
          <a href="/docs/nodes/if-else" className="text-orange underline">
            If / Else
          </a>{" "}
          — branch on{" "}
          <code className="font-mono text-sm">{"{{wait.webhookData}}"}</code>{" "}
          after webhook resume
        </li>
        <li>
          <a href="/docs/nodes/slack" className="text-orange underline">
            Slack
          </a>{" "}
          — send the resume URL to a Slack approver
        </li>
        <li>
          <a href="/docs/nodes/gmail" className="text-orange underline">
            Gmail
          </a>{" "}
          — email the resume URL for async approval
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
