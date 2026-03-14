import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Getting Started" };

export default function GettingStartedPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Getting Started" }]} />

      <h1 className="text-4xl font-bold tracking-tight">
        Getting Started with Nodebase
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Everything you need to start automating workflows in minutes.
      </p>

      {/* ---- What is Nodebase ---- */}
      <h2 id="what-is-nodebase" className="mt-12 text-2xl font-bold">
        What is Nodebase?
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Nodebase is a visual workflow automation platform that lets you connect
        apps and automate tasks without writing code. Build powerful
        integrations between services like Notion, WhatsApp, Razorpay, Google
        Sheets, Gmail, and more — all from a drag-and-drop canvas.
      </p>

      {/* ---- Core Concepts ---- */}
      <h2 id="core-concepts" className="mt-12 text-2xl font-bold">
        Core Concepts
      </h2>

      <h3 id="workflows" className="mt-8 text-xl font-semibold">
        Workflows
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        A workflow is a sequence of nodes that execute in order. Each node
        receives data from the previous node via <strong>context</strong> — a
        shared JSON object that flows through the entire execution.
      </p>

      <h3 id="nodes" className="mt-8 text-xl font-semibold">
        Nodes
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Nodes are the building blocks of every workflow. Each node:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>Receives context from upstream nodes</li>
        <li>Performs an action (API call, transformation, etc.)</li>
        <li>Passes updated context to downstream nodes</li>
      </ul>

      <h3 id="context" className="mt-8 text-xl font-semibold">
        Context
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Context is a JSON object that flows through your workflow:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>Each node&apos;s output is merged into context</li>
        <li>
          Reference previous outputs using{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono">
            {"{{variableName.field}}"}
          </code>
        </li>
      </ul>

      <CodeBlock
        language="json"
        title="Example context"
        code={`{
  "userData": {
    "httpResponse": {
      "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": 200,
      "ok": true
    }
  }
}`}
      />

      <Callout type="tip">
        Access nested values with dot notation:{" "}
        <code className="font-mono text-sm">
          {"{{userData.httpResponse.data.email}}"}
        </code>
      </Callout>

      {/* ---- Template Variables ---- */}
      <h3 id="template-variables" className="mt-8 text-xl font-semibold">
        Template Variables
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Use Handlebars syntax to reference data anywhere in your node
        configuration:
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Syntax</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 font-mono text-sm text-orange">
                {"{{variableName.field}}"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                Simple value access
              </td>
            </tr>
            <tr className="bg-muted/30">
              <td className="px-4 py-2 font-mono text-sm text-orange">
                {"{{json variableName}}"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                Stringify an object
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-sm text-orange">
                {"{{variableName.nested.deep}}"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                Nested property access
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ---- Quick Start ---- */}
      <h2 id="quick-start" className="mt-12 text-2xl font-bold">
        Quick Start{" "}
        <span className="text-base font-normal text-muted-foreground">
          (5 minutes)
        </span>
      </h2>

      <ol className="mt-4 list-inside list-decimal space-y-3 text-foreground/80">
        <li>
          <strong>Create account</strong> — sign up at{" "}
          <span className="text-orange">nodebase.app</span>
        </li>
        <li>
          <strong>Add credentials</strong> — go to{" "}
          <em>Credentials → Add your first API key</em>
        </li>
        <li>
          <strong>Create a workflow</strong> — click{" "}
          <em>&quot;New Workflow&quot;</em>
        </li>
        <li>
          <strong>Add a Manual Trigger</strong> — drag it onto the canvas
        </li>
        <li>
          <strong>Add an HTTP Request node</strong> — connect it to the trigger
        </li>
        <li>
          <strong>Execute</strong> — click the <em>Execute</em> button and see
          the results
        </li>
      </ol>

      <Callout type="info">
        Need help? Check out the <strong>Nodes Reference</strong> for detailed
        configuration guides on every node.
      </Callout>

      {/* ---- Credentials ---- */}
      <h2 id="credentials" className="mt-12 text-2xl font-bold">
        Credential Management
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Nodebase securely stores your API keys and tokens. Credentials are
        encrypted at rest and are never exposed in workflow logs. To add a
        credential:
      </p>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Navigate to <strong>Credentials</strong> in the dashboard
        </li>
        <li>
          Click <strong>Add Credential</strong>
        </li>
        <li>Select the service (e.g. Notion, Razorpay, WhatsApp)</li>
        <li>Paste your API key or token and save</li>
      </ol>

      <Callout type="warning">
        Never share your API keys publicly. Nodebase encrypts all credentials
        before storing them.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
