import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Notion Node" };

export default function NotionPage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Nodes", href: "/docs/nodes" }, { label: "Notion" }]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Notion Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Interact with Notion databases, pages, blocks, and users.
      </p>

      {/* Setup */}
      <h2 id="setup" className="mt-12 text-2xl font-bold">
        Setup
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Go to <strong>notion.so/my-integrations</strong>
        </li>
        <li>Create an Internal Integration</li>
        <li>
          Copy token (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            secret_xxx…
          </code>
          )
        </li>
        <li>
          Add a <strong>NOTION</strong> credential in Nodebase
        </li>
        <li>
          In Notion: open database → <strong>…</strong> → Add connections →
          select your integration
        </li>
      </ol>

      <Callout type="info">
        The integration must be added to each database you want to access.
      </Callout>

      {/* Output Key */}
      <h2 id="output-key" className="mt-12 text-2xl font-bold">
        Output Key
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        All operations store output under:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{notion.operation}}"}
        </code>{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{notion.data}}"}
        </code>{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{notion.timestamp}}"}
        </code>
      </p>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      {/* Query Database */}
      <h3 id="query-database" className="mt-8 text-xl font-semibold">
        Query Database
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Fetch rows from a Notion database with optional filters.
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>Required:</strong> Database ID
        </li>
        <li>
          <strong>Optional:</strong> Filter JSON, Sorts JSON, Page Size, Start
          Cursor
        </li>
      </ul>
      <CodeBlock
        language="json"
        title="Filter example"
        code={`{"property": "Status", "select": {"equals": "Done"}}`}
      />
      <CodeBlock
        language="json"
        title="Sorts example"
        code={`[{"property": "Created", "direction": "descending"}]`}
      />
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{notion.data.results}}"}
        </code>{" "}
        — array of page objects
      </p>

      {/* Create Page */}
      <h3 id="create-page" className="mt-8 text-xl font-semibold">
        Create Page in Database
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Add a new row to a Notion database.
      </p>
      <CodeBlock
        language="json"
        title="Properties example (Name + Email columns)"
        code={`{
  "Name": {
    "title": [{"text": {"content": "John Doe"}}]
  },
  "Email": {
    "email": "john@example.com"
  }
}`}
      />
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{notion.data.id}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{notion.data.url}}"}
        </code>
      </p>

      {/* Get Page */}
      <h3 id="get-page" className="mt-8 text-xl font-semibold">
        Get Page
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Fetch a page by ID. Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{notion.data.properties}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{notion.data.url}}"}
        </code>
      </p>

      {/* Update Page */}
      <h3 id="update-page" className="mt-8 text-xl font-semibold">
        Update Page
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Update properties of an existing page. Required: Page ID, Properties
        JSON (only changed fields).
      </p>

      {/* Archive Page */}
      <h3 id="archive-page" className="mt-8 text-xl font-semibold">
        Archive Page
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Move a page to trash. Required: Page ID.
      </p>

      {/* Search */}
      <h3 id="search" className="mt-8 text-xl font-semibold">
        Search
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Search across all accessible pages and databases. Optional: query text,
        filter type (page/database/all).
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{notion.data.results}}"}
        </code>
      </p>

      {/* Append Block Children */}
      <h3 id="append-blocks" className="mt-8 text-xl font-semibold">
        Append Block Children
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Add content blocks to a page. Block content can be plain text
        (auto-wrapped as a paragraph block) or a JSON array of block objects.
      </p>

      {/* Get Block Children */}
      <h3 id="get-blocks" className="mt-8 text-xl font-semibold">
        Get Block Children
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Fetch all blocks inside a page or block.
      </p>

      {/* Other Operations */}
      <h3 id="other-operations" className="mt-8 text-xl font-semibold">
        Database &amp; User Operations
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>GET_DATABASE</strong>, <strong>GET_USER</strong>,{" "}
        <strong>GET_USERS</strong> — fetch metadata about databases and
        workspace members.
      </p>

      {/* Database ID */}
      <h2 id="database-id" className="mt-12 text-2xl font-bold">
        Getting Database ID
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        From the Notion URL:
      </p>
      <CodeBlock
        language="text"
        code={`notion.so/workspace/MY-DATABASE-ID?v=viewId
                       ^^^^^^^^^^^^^^^^
Copy the 32-character hex string before ?v=`}
      />

      <Callout type="tip">
        You can also use the <strong>Search</strong> operation to find databases
        by name and retrieve their IDs programmatically.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
