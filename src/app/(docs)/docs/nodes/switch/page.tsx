import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Switch Node" };

export default function SwitchPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Switch" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Switch Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Route workflow execution to one of several named branches based on a
        value match. Use Switch when you have more than two possible paths — for
        example, routing by event type, message type, or order status.
      </p>

      {/* How It Works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Set the <strong>Input Value</strong> — typically a{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
            {"{{variable}}"}
          </code>{" "}
          from an upstream node
        </li>
        <li>
          Add <strong>Cases</strong> — each case has a match value and connects
          to a separate output branch
        </li>
        <li>
          Add a <strong>Default</strong> branch that runs when no case matches
        </li>
        <li>
          Downstream nodes on each branch only execute when that branch is
          selected
        </li>
      </ol>

      {/* Configuration */}
      <h2 id="configuration" className="mt-12 text-2xl font-bold">
        Configuration
      </h2>
      <PropertyTable
        properties={[
          {
            name: "inputValue",
            type: "string",
            required: true,
            description:
              "The value to match against cases — e.g. {{razorpayTrigger.event}} or {{whatsappTrigger.type}}",
          },
          {
            name: "cases",
            type: "array",
            required: true,
            description:
              'Array of {value, label} objects. Each becomes a separate output handle.',
          },
          {
            name: "defaultBranch",
            type: "boolean",
            required: false,
            default: "true",
            description:
              "Whether to include a Default branch for unmatched values",
          },
        ]}
      />

      <Callout type="tip">
        Case matching is <strong>exact string comparison</strong> by default.
        The input value and case values are both converted to strings before
        comparison.
      </Callout>

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-event-routing" className="mt-8 text-xl font-semibold">
        Route Razorpay Events
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Handle different Razorpay event types with
        separate downstream logic.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (all events)
→ Switch
    inputValue: {{razorpayTrigger.event}}
    Cases:
      "payment.captured"  → Shiprocket Create Order → WhatsApp "Order confirmed!"
      "payment.failed"    → WhatsApp "Payment failed, retry here: {{link}}"
      "refund.processed"  → Gmail "Your refund has been processed"
      Default             → Slack #dev-logs "Unhandled event: {{razorpayTrigger.event}}"`}
      />

      <h3 id="example-message-type" className="mt-8 text-xl font-semibold">
        Handle WhatsApp Message Types
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Different handling for text, image, and
        location messages in a WhatsApp bot.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`WhatsApp Trigger (all message types)
→ Switch
    inputValue: {{whatsappTrigger.type}}
    Cases:
      "text"        → AI Node (answer question from {{whatsappTrigger.text}})
                      → WhatsApp Send Message
      "image"       → Google Sheets Append Row (log complaint)
                      → WhatsApp "Image received, our team will review."
      "location"    → HTTP Request (nearest store lookup)
                      → WhatsApp "Nearest store: {{httpRequest.body.store}}"
      "interactive" → If/Else (check {{whatsappTrigger.buttonId}})
      Default       → WhatsApp "Sorry, I didn't understand that."`}
      />

      <h3 id="example-order-status" className="mt-8 text-xl font-semibold">
        Route by Order Status
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Send different messages based on Shiprocket
        shipment status.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Shiprocket — Track Shipment
    awbCode: {{body.awb}}
→ Switch
    inputValue: {{shiprocket.current_status}}
    Cases:
      "Delivered"     → MSG91 Send SMS "Your order has been delivered!"
      "In Transit"    → MSG91 Send SMS "Your order is on the way. ETA: {{shiprocket.tracking_data.etd}}"
      "Out for Delivery" → MSG91 Send SMS "Your order will be delivered today!"
      Default         → Slack #ops "Unknown status: {{shiprocket.current_status}}"`}
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
                "All cases fall to Default",
                "Case values have extra spaces or wrong casing",
                "Copy-paste exact string values from upstream node output — case-sensitive",
              ],
              [
                "Branch nodes not running",
                "Branch not connected to a downstream node",
                "Every branch needs at least one connected node — add a placeholder node if needed",
              ],
              [
                "Only one branch runs even with OR conditions",
                "Switch routes to first matching case only",
                "Switch exits on first match — use If/Else for OR logic within a branch",
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
          — binary TRUE/FALSE branching
        </li>
        <li>
          <a
            href="/docs/nodes/razorpay-trigger"
            className="text-orange underline"
          >
            Razorpay Trigger
          </a>{" "}
          — use Switch on{" "}
          <code className="font-mono text-sm">
            {"{{razorpayTrigger.event}}"}
          </code>
        </li>
        <li>
          <a
            href="/docs/nodes/whatsapp-trigger"
            className="text-orange underline"
          >
            WhatsApp Trigger
          </a>{" "}
          — use Switch on{" "}
          <code className="font-mono text-sm">
            {"{{whatsappTrigger.type}}"}
          </code>
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
