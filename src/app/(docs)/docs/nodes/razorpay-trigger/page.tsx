import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Razorpay Trigger Node" };

export default function RazorpayTriggerPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Razorpay Trigger" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">
        Razorpay Trigger Node
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Start a workflow automatically when a Razorpay event fires — payments
        captured, orders paid, refunds created, subscriptions activated, and 25+
        more events. The single most important trigger for Indian D2C stores.
      </p>

      {/* Prerequisites */}
      <h2 id="prerequisites" className="mt-12 text-2xl font-bold">
        Prerequisites
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-2 text-foreground/80">
        <li>A Razorpay account (live or test)</li>
        <li>Access to Razorpay Dashboard → Settings → Webhooks</li>
        <li>
          A Nodebase workflow with a <strong>Razorpay Trigger</strong> node
          added
        </li>
        <li>
          (Optional) A webhook secret — required if you enable{" "}
          <strong>signature verification</strong>
        </li>
      </ul>

      {/* Setup */}
      <h2 id="setup" className="mt-12 text-2xl font-bold">
        Setup
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Add a <strong>Razorpay Trigger</strong> node to your workflow canvas
        </li>
        <li>
          Select the events you want to listen to (e.g.{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            payment.captured
          </code>
          )
        </li>
        <li>
          Click <strong>Save</strong> — Nodebase generates a unique webhook URL
        </li>
        <li>
          Copy the webhook URL from the node panel
        </li>
        <li>
          Go to{" "}
          <strong>
            dashboard.razorpay.com → Settings → Webhooks → Add New Webhook
          </strong>
        </li>
        <li>Paste the URL into the Webhook URL field</li>
        <li>
          (Recommended) Set a <strong>Secret</strong> and paste it into the
          node&apos;s Webhook Secret field — Nodebase will verify every
          incoming request using HMAC-SHA256
        </li>
        <li>Check the events you want Razorpay to send</li>
        <li>Click Save</li>
      </ol>

      <Callout type="warning">
        <strong>Signature Verification:</strong> Always set a webhook secret in
        production. Without it, anyone who knows your webhook URL can send fake
        events to your workflow.
      </Callout>

      {/* Supported Events */}
      <h2 id="events" className="mt-12 text-2xl font-bold">
        Supported Events
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Category</th>
              <th className="px-4 py-2.5 text-left font-semibold">Events</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Payment",
                "payment.captured · payment.failed · payment.authorized",
              ],
              ["Order", "order.paid"],
              [
                "Refund",
                "refund.created · refund.processed · refund.failed",
              ],
              [
                "Subscription",
                "subscription.activated · subscription.charged · subscription.completed · subscription.cancelled · subscription.halted · subscription.paused · subscription.resumed",
              ],
              [
                "Invoice",
                "invoice.paid · invoice.partially_paid · invoice.expired",
              ],
              [
                "Dispute",
                "dispute.created · dispute.won · dispute.lost · dispute.closed",
              ],
              ["Virtual Account", "virtual_account.credited"],
              ["Settlement", "settlement.processed"],
              ["Payout", "payout.processed"],
              ["Transfer", "transfer.processed"],
              ["QR Code", "qr_code.credited"],
            ].map(([cat, events], i) => (
              <tr key={cat} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{cat}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {events}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Output Variables */}
      <h2 id="output" className="mt-12 text-2xl font-bold">
        Output Variables
      </h2>
      <p className="mt-2 text-foreground/80">
        After the trigger fires, the following variables are available to all
        downstream nodes:
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Variable</th>
              <th className="px-4 py-2.5 text-left font-semibold">Type</th>
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
                "{{razorpayTrigger.event}}",
                "string",
                "Event type",
                '"payment.captured"',
              ],
              [
                "{{razorpayTrigger.payload}}",
                "object",
                "Full event payload from Razorpay",
                "{ payment: { entity: {...} } }",
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.id}}",
                "string",
                "Payment ID",
                '"pay_OFj67X3s9kH5rA"',
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.amount}}",
                "number",
                "Amount in paise",
                "50000",
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.currency}}",
                "string",
                "Currency code",
                '"INR"',
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.status}}",
                "string",
                "Payment status",
                '"captured"',
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.email}}",
                "string",
                "Customer email",
                '"rahul@example.com"',
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.contact}}",
                "string",
                "Customer phone (with country code)",
                '"919876543210"',
              ],
              [
                "{{razorpayTrigger.payload.payment.entity.notes}}",
                "object",
                "Custom notes attached to payment",
                '{ orderId: "SHP-001" }',
              ],
              [
                "{{razorpayTrigger.accountId}}",
                "string",
                "Your Razorpay account ID",
                '"acc_OFj67X3s9kH5rA"',
              ],
              [
                "{{razorpayTrigger.receivedAt}}",
                "string",
                "ISO timestamp when webhook was received",
                '"2026-04-01T10:30:00.000Z"',
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

      <Callout type="warning">
        <strong>Amount is in paise.</strong> Razorpay sends all amounts in the
        smallest currency unit. ₹500 = 50,000 paise. Use{" "}
        <code className="font-mono text-sm">
          {"$.number.paiseToRupees({{razorpayTrigger.payload.payment.entity.amount}})"}
        </code>{" "}
        in a Code node to convert.
      </Callout>

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-post-payment" className="mt-8 text-xl font-semibold">
        Post-Payment Order Fulfilment
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> When a customer pays on your Shopify store,
        automatically create a Shiprocket order and send a WhatsApp confirmation.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (event: payment.captured)
→ Shiprocket — Create Order
    orderId:        {{razorpayTrigger.payload.payment.entity.id}}
    billingName:    {{razorpayTrigger.payload.payment.entity.notes.customerName}}
    billingPhone:   {{razorpayTrigger.payload.payment.entity.contact}}
    billingEmail:   {{razorpayTrigger.payload.payment.entity.email}}
    billingPincode: {{razorpayTrigger.payload.payment.entity.notes.pincode}}
    paymentMethod:  prepaid
    subTotal:       {{razorpayTrigger.payload.payment.entity.amount}}
→ WhatsApp — Send Message
    to:      {{razorpayTrigger.payload.payment.entity.contact}}
    message: "Hi {{razorpayTrigger.payload.payment.entity.notes.customerName}},
              your order is confirmed! 🎉
              Tracking: {{shiprocket.awb_code}}"`}
      />

      <h3 id="example-refund" className="mt-8 text-xl font-semibold">
        Refund Notification
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Notify the customer and your team on Slack
        when a refund is processed.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (event: refund.processed)
→ Gmail — Send Email
    to:      {{razorpayTrigger.payload.payment.entity.email}}
    subject: "Your refund of ₹{{razorpayTrigger.payload.payment.entity.amount}} is processed"
    body:    "Hi, your refund has been initiated and will reflect in 5-7 business days."
→ Slack — Send Message
    channel: #refunds
    text:    "Refund processed for {{razorpayTrigger.payload.payment.entity.email}}
              — ₹{{razorpayTrigger.payload.payment.entity.amount}} paise"`}
      />

      <h3 id="example-failed" className="mt-8 text-xl font-semibold">
        Payment Failed Recovery
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Send a payment recovery link when a payment
        fails so the customer can retry.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (event: payment.failed)
→ Razorpay — Create Payment Link
    amount:      {{razorpayTrigger.payload.payment.entity.amount}}
    currency:    INR
    description: "Retry your payment"
→ WhatsApp — Send Message
    to:      {{razorpayTrigger.payload.payment.entity.contact}}
    message: "Hi, your payment of ₹{{razorpayTrigger.payload.payment.entity.amount}} failed.
              Retry here: {{razorpay.short_url}}"`}
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
                "Webhook not firing",
                "Events not checked in Razorpay Dashboard",
                "Go to Razorpay → Settings → Webhooks and ensure the correct events are ticked",
              ],
              [
                "Signature verification failed",
                "Webhook secret mismatch",
                "Make sure the secret in Razorpay Dashboard exactly matches the one in Nodebase",
              ],
              [
                "Amount looks wrong (50000 instead of 500)",
                "Amounts are in paise",
                "Divide by 100 or use $.number.paiseToRupees() in a Code node",
              ],
              [
                "Trigger fires but workflow errors",
                "Null reference on notes fields",
                "Check that payment.entity.notes contains expected keys before using them",
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
          <a href="/docs/nodes/razorpay" className="text-orange underline">
            Razorpay
          </a>{" "}
          — create payment links, fetch orders, initiate refunds
        </li>
        <li>
          <a href="/docs/nodes/shiprocket" className="text-orange underline">
            Shiprocket
          </a>{" "}
          — create shipment immediately after payment
        </li>
        <li>
          <a href="/docs/nodes/whatsapp" className="text-orange underline">
            WhatsApp
          </a>{" "}
          — send order confirmation to customer
        </li>
        <li>
          <a href="/docs/nodes/msg91" className="text-orange underline">
            MSG91
          </a>{" "}
          — send SMS confirmation
        </li>
        <li>
          <a href="/docs/nodes/slack" className="text-orange underline">
            Slack
          </a>{" "}
          — alert your team on new payments
        </li>
        <li>
          <a href="/docs/nodes/if-else" className="text-orange underline">
            If / Else
          </a>{" "}
          — branch on payment status or amount threshold
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
