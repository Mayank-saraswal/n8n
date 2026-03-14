import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Code Node" };

export default function CodeNodePage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Nodes", href: "/docs/nodes" }, { label: "Code" }]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Code Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Write custom JavaScript to transform data or add logic.
      </p>

      {/* Access Context */}
      <h2 id="access-context" className="mt-12 text-2xl font-bold">
        Access Context
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        The entire workflow context is available as the{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          context
        </code>{" "}
        variable. This is a plain JavaScript object containing all upstream node
        outputs.
      </p>

      {/* Return Value */}
      <h2 id="return-value" className="mt-12 text-2xl font-bold">
        Return Value
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Return an object — it is spread into context for downstream nodes.
      </p>
      <CodeBlock
        language="javascript"
        code={`return { processedData: result }
// Access as: {{processedData.field}}`}
      />

      {/* Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Examples
      </h2>

      <h3 id="filter-array" className="mt-8 text-xl font-semibold">
        Filter an Array
      </h3>
      <CodeBlock
        language="javascript"
        code={`const users = context.users.httpResponse.data
const premium = users.filter(u => u.plan === "premium")
return { premiumUsers: premium, count: premium.length }`}
      />

      <h3 id="format-data" className="mt-8 text-xl font-semibold">
        Format Data
      </h3>
      <CodeBlock
        language="javascript"
        code={`const order = context.razorpay
return {
  message: \`Order \${order.orderId} for ₹\${order.amountInRupees} confirmed!\`
}`}
      />

      <h3 id="calculate-totals" className="mt-8 text-xl font-semibold">
        Calculate Totals
      </h3>
      <CodeBlock
        language="javascript"
        code={`const items = context.notion.data.results
const total = items.reduce((sum, item) => {
  return sum + (item.properties.Amount?.number || 0)
}, 0)
return { total, formattedTotal: \`₹\${total.toLocaleString('en-IN')}\` }`}
      />

      <Callout type="info">
        The Code node runs in a sandboxed environment. It has access to standard
        JavaScript APIs but not to Node.js modules or the file system.
      </Callout>

      <Callout type="tip">
        Use the Code node to reshape data before passing it to other nodes — for
        example, extracting specific fields from an API response or calculating
        derived values.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
