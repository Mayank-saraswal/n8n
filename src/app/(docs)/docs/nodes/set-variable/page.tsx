import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Set Variable Node" };

export default function SetVariablePage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Set Variable" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Set Variable Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Create new variables or transform existing ones in the workflow context.
        Use it to flatten deeply nested data, combine fields, format values, or
        create aliases for long variable paths.
      </p>

      {/* How It Works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>Add one or more key-value pairs</li>
        <li>
          The <strong>Key</strong> is the variable name you want to create
        </li>
        <li>
          The <strong>Value</strong> supports{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
            {"{{variable}}"}
          </code>{" "}
          syntax to reference upstream context
        </li>
        <li>
          All configured keys are added to the workflow context and available
          to downstream nodes as{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
            {"{{keyName}}"}
          </code>
        </li>
      </ol>

      <Callout type="tip">
        Use Set Variable to simplify complex variable paths. Instead of writing{" "}
        <code className="font-mono text-sm">
          {"{{razorpayTrigger.payload.payment.entity.contact}}"}
        </code>{" "}
        in every downstream node, set{" "}
        <code className="font-mono text-sm">customerPhone</code> once and use{" "}
        <code className="font-mono text-sm">{"{{customerPhone}}"}</code>{" "}
        everywhere.
      </Callout>

      {/* Configuration */}
      <h2 id="configuration" className="mt-12 text-2xl font-bold">
        Configuration
      </h2>
      <PropertyTable
        properties={[
          {
            name: "key",
            type: "string",
            required: true,
            description:
              "Variable name to create. Use camelCase, e.g. customerPhone or orderTotal",
          },
          {
            name: "value",
            type: "string",
            required: true,
            description:
              "Value to assign. Supports plain text, numbers, and {{variable}} references",
          },
        ]}
      />

      <p className="mt-4 text-foreground/80">
        You can add multiple key-value pairs in a single Set Variable node.
        All pairs are processed together.
      </p>

      {/* Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Examples
      </h2>

      <h3 id="example-flatten" className="mt-8 text-xl font-semibold">
        Flatten Razorpay Payment Data
      </h3>
      <CodeBlock
        language="text"
        title="Configuration"
        code={`Key: customerName   Value: {{razorpayTrigger.payload.payment.entity.notes.name}}
Key: customerPhone  Value: {{razorpayTrigger.payload.payment.entity.contact}}
Key: customerEmail  Value: {{razorpayTrigger.payload.payment.entity.email}}
Key: amountPaise    Value: {{razorpayTrigger.payload.payment.entity.amount}}
Key: paymentId      Value: {{razorpayTrigger.payload.payment.entity.id}}`}
      />
      <p className="mt-3 text-foreground/80">
        Downstream nodes can now use{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{customerName}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{customerPhone}}"}
        </code>
        , etc. instead of long paths.
      </p>

      <h3 id="example-combine" className="mt-8 text-xl font-semibold">
        Combine Fields
      </h3>
      <CodeBlock
        language="text"
        title="Configuration"
        code={`Key: fullName   Value: {{body.firstName}} {{body.lastName}}
Key: fullAddress Value: {{body.address}}, {{body.city}} - {{body.pincode}}`}
      />

      <h3 id="example-compute" className="mt-8 text-xl font-semibold">
        Mark Step Completion
      </h3>
      <CodeBlock
        language="text"
        title="Configuration"
        code={`Key: orderCreated   Value: true
Key: shipmentId     Value: {{shiprocket.shipment_id}}
Key: processedAt    Value: {{razorpayTrigger.receivedAt}}`}
      />

      <h3 id="example-workflow" className="mt-8 text-xl font-semibold">
        Complete Workflow
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Simplify a post-payment workflow by
        normalising all variable names upfront.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (payment.captured)
→ Set Variable
    customerName:  {{razorpayTrigger.payload.payment.entity.notes.name}}
    customerPhone: {{razorpayTrigger.payload.payment.entity.contact}}
    customerEmail: {{razorpayTrigger.payload.payment.entity.email}}
    orderAmount:   {{razorpayTrigger.payload.payment.entity.amount}}
    paymentId:     {{razorpayTrigger.payload.payment.entity.id}}
→ Shiprocket — Create Order
    billingName:  {{customerName}}
    billingPhone: {{customerPhone}}
    billingEmail: {{customerEmail}}
→ MSG91 — Send SMS
    mobile:  {{customerPhone}}
    message: "Hi {{customerName}}, your order is confirmed!"`}
      />

      {/* Related Nodes */}
      <h2 id="related" className="mt-12 text-2xl font-bold">
        Related Nodes
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <a href="/docs/nodes/code" className="text-orange underline">
            Code
          </a>{" "}
          — for complex transformations that require JavaScript logic
        </li>
        <li>
          <a href="/docs/nodes/if-else" className="text-orange underline">
            If / Else
          </a>{" "}
          — use Set Variable to prepare values before conditional branching
        </li>
        <li>
          <a
            href="/docs/nodes/razorpay-trigger"
            className="text-orange underline"
          >
            Razorpay Trigger
          </a>{" "}
          — flatten deep payment payload fields
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
