import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Loop Node" };

export default function LoopPage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Nodes", href: "/docs/nodes" }, { label: "Loop" }]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Loop Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Iterate over an array and execute downstream nodes for each item.
      </p>

      {/* How it works */}
      <h2 id="how-it-works" className="mt-12 text-2xl font-bold">
        How It Works
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Loop reads an array from context using <strong>Input Path</strong>
        </li>
        <li>For each item, it runs all downstream nodes</li>
        <li>
          Each iteration has the item available as{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
            {"{{itemVariable}}"}
          </code>
        </li>
        <li>
          Results are collected in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
            {"{{loop.results}}"}
          </code>
        </li>
      </ol>

      {/* Configuration */}
      <h2 id="configuration" className="mt-12 text-2xl font-bold">
        Configuration
      </h2>
      <PropertyTable
        properties={[
          {
            name: "inputPath",
            type: "string",
            required: true,
            description:
              "Dot-notation path to array in context, e.g. users.httpResponse.data",
          },
          {
            name: "itemVariable",
            type: "string",
            required: true,
            description:
              "Name for the current item in each iteration, e.g. user, item, row",
          },
          {
            name: "maxIterations",
            type: "number",
            required: false,
            default: "100",
            description: "Safety limit for maximum iterations",
          },
        ]}
      />

      {/* Output */}
      <h2 id="output" className="mt-12 text-2xl font-bold">
        Output
      </h2>
      <CodeBlock
        language="json"
        code={`{
  "loop": {
    "count": 10,
    "successCount": 9,
    "errorCount": 1,
    "results": [ /* iteration outputs */ ],
    "skipped": 0
  }
}`}
      />

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Key</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["{{loop.count}}", "Total items processed"],
              ["{{loop.successCount}}", "Successful iterations"],
              ["{{loop.errorCount}}", "Failed iterations"],
              ["{{loop.results}}", "Array of all iteration outputs"],
              ["{{loop.skipped}}", "Items skipped (over max)"],
            ].map(([key, desc], i) => (
              <tr key={key} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2">
                  <code className="font-mono text-sm text-orange">{key}</code>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Example */}
      <h2 id="example" className="mt-12 text-2xl font-bold">
        Example
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Fetch users from an API → Loop → Send WhatsApp to each user:
      </p>

      <h3 id="step-1" className="mt-6 text-lg font-semibold">
        Step 1: HTTP Request
      </h3>
      <CodeBlock language="text" code={`GET /users → variableName: "users"`} />

      <h3 id="step-2" className="mt-6 text-lg font-semibold">
        Step 2: Loop Configuration
      </h3>
      <CodeBlock
        language="text"
        code={`Input Path: users.httpResponse.data
Item Variable: user`}
      />

      <h3 id="step-3" className="mt-6 text-lg font-semibold">
        Step 3: WhatsApp (inside loop)
      </h3>
      <CodeBlock
        language="text"
        code={`To: {{user.phone}}
Body: Hi {{user.name}}, your account is ready!`}
      />

      <Callout type="tip">
        Each iteration runs independently. If one fails, the loop continues with
        the next item and records the error.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
