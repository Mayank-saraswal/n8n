import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Google Sheets Node" };

export default function GoogleSheetsPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Google Sheets" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Google Sheets Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Read, write, and manage Google Sheets spreadsheets.
      </p>

      {/* Setup */}
      <h2 id="setup" className="mt-12 text-2xl font-bold">
        Setup
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Go to the <strong>Google Cloud Console</strong>
        </li>
        <li>Enable the Google Sheets API</li>
        <li>Create OAuth credentials or a Service Account</li>
        <li>
          Add a <strong>GOOGLE_SHEETS</strong> credential in Nodebase
        </li>
      </ol>

      <Callout type="info">
        If using a Service Account, share the spreadsheet with the service
        account email address.
      </Callout>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      <h3 id="read-rows" className="mt-8 text-xl font-semibold">
        Read Rows
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Fetch rows from a spreadsheet. Specify the Spreadsheet ID, Sheet Name,
        and Range (e.g.{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          A1:D100
        </code>
        ).
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{googleSheets.data.rows}}"}
        </code>
      </p>

      <h3 id="append-row" className="mt-8 text-xl font-semibold">
        Append Row
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Add a new row to the end of a sheet. Pass an array of values matching
        the column order.
      </p>

      <h3 id="update-row" className="mt-8 text-xl font-semibold">
        Update Row
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Update a specific row or cell range. Specify the range (e.g.{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          A5:D5
        </code>
        ) and the new values.
      </p>

      <h3 id="clear-range" className="mt-8 text-xl font-semibold">
        Clear Range
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Clear values from a specified range without deleting the cells
        themselves.
      </p>

      <h3 id="create-spreadsheet" className="mt-8 text-xl font-semibold">
        Create Spreadsheet
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Create a new spreadsheet with a given title and optional sheet names.
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{googleSheets.data.spreadsheetId}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{googleSheets.data.url}}"}
        </code>
      </p>

      <Callout type="tip">
        Combine the <strong>Loop</strong> node with Google Sheets to process
        each row individually — e.g. send a personalized email for every row in
        your spreadsheet.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
