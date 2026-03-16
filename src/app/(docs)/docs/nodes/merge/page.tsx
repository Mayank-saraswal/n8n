import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Merge Node" };

export default function MergePage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Merge" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Merge Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Combine data from multiple workflow branches into a single context.
        Supports five merge strategies — from simple object combination to inner
        joins and cartesian products.
      </p>

      {/* How It Works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <p className="mt-3 text-foreground/80">
        The Merge node accepts 2–10 input branches and waits for all of them to
        complete before merging their data. Choose a strategy that fits your use
        case.
      </p>

      {/* Strategies */}
      <h2 id="strategies" className="mt-12 text-2xl font-bold">
        Merge Strategies
      </h2>

      <h3 id="strategy-combine" className="mt-8 text-xl font-semibold">
        Combine
      </h3>
      <p className="mt-2 text-foreground/80">
        Merge all branch contexts into a single object. Keys from later branches
        overwrite keys from earlier branches on collision.
      </p>
      <CodeBlock
        language="text"
        title="Example"
        code={`Branch A: Shiprocket — Track Shipment → { shiprocket: { current_status: "In Transit" } }
Branch B: Razorpay — Fetch Payment   → { razorpay: { status: "captured", amount: 50000 } }

Merge (Combine)
→ Output: { shiprocket: {...}, razorpay: {...} }
→ Gmail — Send Email
    body: "Payment: {{razorpay.status}} | Shipping: {{shiprocket.current_status}}"`}
      />

      <h3 id="strategy-position" className="mt-8 text-xl font-semibold">
        Position
      </h3>
      <p className="mt-2 text-foreground/80">
        Zip arrays from two branches by index. Pairs item[0] from branch A with
        item[0] from branch B, and so on.
      </p>
      <PropertyTable
        properties={[
          {
            name: "fillMode",
            type: "string",
            required: false,
            default: "shortest",
            description:
              '"shortest" — stop at end of shortest array | "longest" — pad with null',
          },
        ]}
      />

      <h3 id="strategy-crossjoin" className="mt-8 text-xl font-semibold">
        Cross Join
      </h3>
      <p className="mt-2 text-foreground/80">
        Create the cartesian product of two arrays — every item from branch A
        paired with every item from branch B (N × M output rows).
      </p>
      <CodeBlock
        language="text"
        title="Example — pair each product with each warehouse"
        code={`Branch A: [ { sku: "TS-S" }, { sku: "TS-M" }, { sku: "TS-L" } ]
Branch B: [ { warehouse: "Mumbai" }, { warehouse: "Delhi" } ]

Merge (Cross Join) → 6 pairs:
  { sku: "TS-S", warehouse: "Mumbai" }
  { sku: "TS-S", warehouse: "Delhi" }
  { sku: "TS-M", warehouse: "Mumbai" }
  ...`}
      />

      <h3 id="strategy-keymatch" className="mt-8 text-xl font-semibold">
        Key Match (Inner Join)
      </h3>
      <p className="mt-2 text-foreground/80">
        Join two arrays where a shared key value matches — like a SQL inner
        join. Items without a matching key are excluded.
      </p>
      <PropertyTable
        properties={[
          {
            name: "keyPath1",
            type: "string",
            required: true,
            description: "Dot-path key in branch 1 array, e.g. orderId",
          },
          {
            name: "keyPath2",
            type: "string",
            required: true,
            description: "Dot-path key in branch 2 array, e.g. order_id",
          },
        ]}
      />

      <h3 id="strategy-keydiff" className="mt-8 text-xl font-semibold">
        Key Difference
      </h3>
      <p className="mt-2 text-foreground/80">
        Return only items from branch 1 that do NOT have a matching key in
        branch 2 — like a SQL LEFT ANTI JOIN. Use to find orders that have not
        been shipped.
      </p>

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
            </tr>
          </thead>
          <tbody>
            {[
              [
                "{{merge.result}}",
                "array | object",
                "The merged output — object for Combine, array for all others",
              ],
              [
                "{{merge.count}}",
                "number",
                "Number of items in result (array strategies)",
              ],
              [
                "{{merge.mode}}",
                "string",
                "The strategy used: combine | position | crossjoin | keymatch | keydiff",
              ],
              [
                "{{merge.mergedAt}}",
                "string",
                "ISO timestamp when merge completed",
              ],
            ].map(([variable, type, desc], i) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-parallel-fetch" className="mt-8 text-xl font-semibold">
        Parallel Data Fetch + Combine
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Fetch payment details and shipping status in
        parallel, then send a combined status email.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Webhook Trigger (GET /order-status?orderId=...)
├─ Branch A → Razorpay — Fetch Payment
│              paymentId: {{body.paymentId}}
└─ Branch B → Shiprocket — Track Shipment
               awbCode: {{body.awb}}

→ Merge (Combine)
→ Gmail — Send Email
    to:   {{body.email}}
    body: "Payment: {{razorpay.status}}
           Shipping: {{shiprocket.current_status}}
           ETA: {{shiprocket.tracking_data.etd}}"`}
      />

      <h3 id="example-unshipped" className="mt-8 text-xl font-semibold">
        Find Unshipped Orders (Key Difference)
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Find all paid orders that don&apos;t have a
        Shiprocket order yet.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Schedule Trigger (daily 8 AM)
├─ Branch A → Razorpay — List Payments (captured, last 24h)
└─ Branch B → Shiprocket — Get Orders List (last 24h)

→ Merge (Key Difference)
    keyPath1: id          (Razorpay payment ID)
    keyPath2: channel_order_id  (Shiprocket's external order ID)
→ Loop over {{merge.result}}
    → Slack — Send Message
        channel: #ops
        text: "Missing shipment for payment {{item.id}} — {{item.email}}"`}
      />

      {/* Related Nodes */}
      <h2 id="related" className="mt-12 text-2xl font-bold">
        Related Nodes
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <a href="/docs/nodes/loop" className="text-orange underline">
            Loop
          </a>{" "}
          — iterate over{" "}
          <code className="font-mono text-sm">{"{{merge.result}}"}</code> after
          an array-type merge
        </li>
        <li>
          <a href="/docs/nodes/if-else" className="text-orange underline">
            If / Else
          </a>{" "}
          — check{" "}
          <code className="font-mono text-sm">{"{{merge.count}}"}</code> before
          processing
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
