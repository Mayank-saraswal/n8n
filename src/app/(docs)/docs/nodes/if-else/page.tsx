import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "If / Else Node" };

export default function IfElsePage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "If / Else" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">If / Else Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Route your workflow down a TRUE or FALSE path based on one or more
        conditions. Use it to branch on payment status, OTP verification, order
        value, message type, and more.
      </p>

      {/* How It Works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Configure one or more conditions using a left-hand value, an operator,
          and a right-hand value
        </li>
        <li>
          Connect downstream nodes to the <strong>TRUE</strong> handle and the{" "}
          <strong>FALSE</strong> handle separately
        </li>
        <li>
          When the workflow reaches the If / Else node, it evaluates the
          condition and routes execution accordingly
        </li>
        <li>
          Nodes on the TRUE branch only run when the condition passes; nodes on
          the FALSE branch only run when it fails
        </li>
      </ol>

      <Callout type="tip">
        Group multiple conditions with <strong>AND</strong> (all must be true)
        or <strong>OR</strong> (any must be true) to build compound logic.
      </Callout>

      {/* Operators */}
      <h2 id="operators" className="mt-12 text-2xl font-bold">
        Available Operators
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Operator</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Example
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "equals",
                "Exact match (string or number)",
                '{{msg91.verified}} equals true',
              ],
              [
                "not_equals",
                "Does not match",
                '{{razorpayTrigger.event}} not_equals "payment.failed"',
              ],
              [
                "contains",
                "String contains substring",
                '{{whatsappTrigger.text}} contains "track"',
              ],
              [
                "not_contains",
                "String does not contain",
                '{{body.email}} not_contains "spam"',
              ],
              [
                "starts_with",
                "String starts with prefix",
                '{{whatsappTrigger.from}} starts_with "91"',
              ],
              [
                "ends_with",
                "String ends with suffix",
                '{{body.email}} ends_with ".in"',
              ],
              [
                "greater_than",
                "Numeric greater than",
                "{{razorpayTrigger.payload.payment.entity.amount}} greater_than 50000",
              ],
              [
                "less_than",
                "Numeric less than",
                "{{shiprocket.shipment_id}} less_than 999999",
              ],
              [
                "greater_than_or_equal",
                "Numeric ≥",
                "{{body.quantity}} greater_than_or_equal 10",
              ],
              [
                "less_than_or_equal",
                "Numeric ≤",
                "{{body.discount}} less_than_or_equal 100",
              ],
              [
                "is_empty",
                "Value is null, undefined, or empty string",
                "{{body.notes}} is_empty",
              ],
              [
                "is_not_empty",
                "Value exists and is non-empty",
                "{{whatsappTrigger.text}} is_not_empty",
              ],
              [
                "is_true",
                "Boolean true check",
                "{{msg91.verified}} is_true",
              ],
              [
                "is_false",
                "Boolean false check",
                "{{shiprocket.serviceable}} is_false",
              ],
              [
                "regex_match",
                "Value matches regex pattern",
                "{{body.phone}} regex_match ^91\\d{10}$",
              ],
            ].map(([op, desc, example], i) => (
              <tr key={op} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5">
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-orange">
                    {op}
                  </code>
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

      <h3 id="example-otp-gate" className="mt-8 text-xl font-semibold">
        OTP Verification Gate
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Only create a user account if the OTP is
        valid.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Webhook Trigger (POST /verify, body: { mobile, otp })
→ MSG91 — Verify OTP
    mobile:   {{body.mobile}}
    otpValue: {{body.otp}}
→ If / Else
    Condition: {{msg91.verified}} equals true
  TRUE  → Set Variable: userPhone = {{body.mobile}}
          → HTTP Response: {"success": true}
  FALSE → HTTP Response: {"error": "Invalid OTP"}`}
      />

      <h3 id="example-high-value" className="mt-8 text-xl font-semibold">
        High-Value Order Alert
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Send a special alert for orders above ₹5,000.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (payment.captured)
→ If / Else
    Condition: {{razorpayTrigger.payload.payment.entity.amount}} greater_than 500000
    (note: 500000 paise = ₹5,000)
  TRUE  → Slack — Send Message
            channel: #vip-orders
            text: "🌟 VIP order! ₹{{razorpayTrigger.payload.payment.entity.amount}} from
                   {{razorpayTrigger.payload.payment.entity.email}}"
  FALSE → (no action — normal flow continues)`}
      />

      <h3 id="example-serviceable" className="mt-8 text-xl font-semibold">
        Delivery Serviceability Check
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Only create a Shiprocket order if the PIN
        code is serviceable.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Webhook Trigger (POST /checkout, body: { pincode, ... })
→ Shiprocket — Check Serviceability
    pickupPostcode:   400001
    deliveryPostcode: {{body.pincode}}
→ If / Else
    Condition: {{shiprocket.serviceable}} is_true
  TRUE  → Shiprocket — Create Order ...
  FALSE → HTTP Response: {"error": "Sorry, we don't deliver to your PIN code yet."}`}
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
                "Condition always goes FALSE",
                "Type mismatch — comparing string to number",
                'Wrap number comparisons in quotes or use greater_than operator instead of equals for numbers',
              ],
              [
                "regex_match not working",
                "Backslashes need escaping",
                "Use \\\\d instead of \\d in the regex pattern field",
              ],
              [
                "Variable is undefined",
                "Upstream node didn't produce that variable",
                "Add an is_not_empty condition first to guard against undefined values",
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
          <a href="/docs/nodes/switch" className="text-orange underline">
            Switch
          </a>{" "}
          — route to one of N branches instead of just TRUE/FALSE
        </li>
        <li>
          <a href="/docs/nodes/msg91" className="text-orange underline">
            MSG91
          </a>{" "}
          — check{" "}
          <code className="font-mono text-sm">{"{{msg91.verified}}"}</code>{" "}
          after Verify OTP
        </li>
        <li>
          <a href="/docs/nodes/shiprocket" className="text-orange underline">
            Shiprocket
          </a>{" "}
          — check{" "}
          <code className="font-mono text-sm">
            {"{{shiprocket.serviceable}}"}
          </code>{" "}
          before creating orders
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
