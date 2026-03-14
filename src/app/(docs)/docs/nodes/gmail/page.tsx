import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Gmail Node" };

export default function GmailPage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Nodes", href: "/docs/nodes" }, { label: "Gmail" }]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Gmail Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Send and manage emails through Gmail.
      </p>

      {/* Setup */}
      <h2 id="setup" className="mt-12 text-2xl font-bold">
        Setup
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Go to the <strong>Google Cloud Console</strong>
        </li>
        <li>Enable the Gmail API</li>
        <li>Create OAuth credentials</li>
        <li>
          Add a <strong>GMAIL</strong> credential in Nodebase
        </li>
      </ol>

      <Callout type="info">
        OAuth consent screen must be configured with the{" "}
        <code className="font-mono text-sm">gmail.send</code> scope at minimum.
      </Callout>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      <h3 id="send-email" className="mt-8 text-xl font-semibold">
        Send Email
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>To:</strong> recipient email address
        </li>
        <li>
          <strong>Subject:</strong> email subject line
        </li>
        <li>
          <strong>Body:</strong> HTML or plain text content
        </li>
        <li>
          <strong>CC / BCC:</strong> optional
        </li>
      </ul>
      <p className="mt-2 text-sm text-foreground/80">
        All fields support{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          {"{{variables}}"}
        </code>
        .
      </p>

      <CodeBlock
        language="json"
        title="Example output"
        code={`{
  "gmail": {
    "messageId": "18abc123def",
    "threadId": "18abc123def",
    "to": "user@example.com",
    "status": "sent"
  }
}`}
      />

      <h3 id="send-with-attachment" className="mt-8 text-xl font-semibold">
        Send with Attachment
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Attach files by providing a publicly accessible URL. The file is
        downloaded and attached to the email before sending.
      </p>

      <h3 id="list-messages" className="mt-8 text-xl font-semibold">
        List Messages
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Search and list messages using Gmail query syntax (e.g.{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          from:user@example.com after:2024/01/01
        </code>
        ).
      </p>

      <h3 id="get-message" className="mt-8 text-xl font-semibold">
        Get Message
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Fetch a specific email by message ID. Returns subject, body, from, to,
        date, and attachments.
      </p>

      <Callout type="tip">
        Combine with the <strong>Loop</strong> node to send personalized emails
        to a list of recipients from a Google Sheets spreadsheet.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
