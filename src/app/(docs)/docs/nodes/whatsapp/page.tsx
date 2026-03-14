import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "WhatsApp Node" };

export default function WhatsAppPage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Nodes", href: "/docs/nodes" }, { label: "WhatsApp" }]}
      />

      <h1 className="text-4xl font-bold tracking-tight">WhatsApp Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Send messages via WhatsApp Cloud API (Meta).
      </p>

      {/* Setup */}
      <h2 id="setup" className="mt-12 text-2xl font-bold">
        Setup
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Go to <strong>developers.facebook.com</strong>
        </li>
        <li>Create or open a WhatsApp app</li>
        <li>Go to WhatsApp → API Setup</li>
        <li>
          Copy your <strong>Access Token</strong> and{" "}
          <strong>Phone Number ID</strong>
        </li>
        <li>
          Add a <strong>WHATSAPP</strong> credential in Nodebase
        </li>
      </ol>

      <h3 id="credential-format" className="mt-8 text-xl font-semibold">
        Credential Format
      </h3>
      <CodeBlock
        language="json"
        code={`{
  "accessToken": "EAABx...",
  "phoneNumberId": "1234567890"
}`}
      />

      {/* Phone Number */}
      <h2 id="phone-format" className="mt-12 text-2xl font-bold">
        Phone Number Format
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Always use <strong>E.164 format</strong>:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          +91XXXXXXXXXX
        </code>
      </p>
      <Callout type="warning">
        <strong>Incorrect:</strong> 9876543210 <br />
        <strong>Correct:</strong> +919876543210
      </Callout>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      <h3 id="send-text" className="mt-8 text-xl font-semibold">
        Send Text Message
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>To:</strong>{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            +91XXXXXXXXXX
          </code>{" "}
          (supports{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            {"{{variables}}"}
          </code>
          )
        </li>
        <li>
          <strong>Body:</strong> Your message text (supports{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            {"{{variables}}"}
          </code>
          )
        </li>
      </ul>

      <h3 id="send-template" className="mt-8 text-xl font-semibold">
        Send Template Message
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>To:</strong> recipient number
        </li>
        <li>
          <strong>Template Name:</strong> your approved template name
        </li>
        <li>
          <strong>Language Code:</strong> en_US, en, hi, etc.
        </li>
        <li>
          <strong>Parameters:</strong> JSON array of parameter values
        </li>
      </ul>

      <h3 id="send-image" className="mt-8 text-xl font-semibold">
        Send Image
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>To:</strong> recipient number
        </li>
        <li>
          <strong>Image URL:</strong> publicly accessible image URL
        </li>
        <li>
          <strong>Caption:</strong> optional caption text
        </li>
      </ul>

      <h3 id="send-document" className="mt-8 text-xl font-semibold">
        Send Document
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>To:</strong> recipient number
        </li>
        <li>
          <strong>Document URL:</strong> publicly accessible file URL
        </li>
        <li>
          <strong>Filename:</strong> shown to recipient
        </li>
        <li>
          <strong>Caption:</strong> optional
        </li>
      </ul>

      <h3 id="send-reaction" className="mt-8 text-xl font-semibold">
        Send Reaction
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>To:</strong> recipient number
        </li>
        <li>
          <strong>Message ID:</strong> ID of message to react to
        </li>
        <li>
          <strong>Emoji:</strong> single emoji character
        </li>
      </ul>

      {/* Output */}
      <h2 id="output" className="mt-12 text-2xl font-bold">
        Output
      </h2>
      <CodeBlock
        language="json"
        code={`{
  "whatsapp": {
    "messageId": "wamid.xxx",
    "to": "+919876543210",
    "status": "sent",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}`}
      />

      {/* Rate Limits */}
      <h2 id="rate-limits" className="mt-12 text-2xl font-bold">
        Rate Limits
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Meta enforces rate limits per phone number.
      </p>
      <Callout type="info">
        Free tier: <strong>1,000 conversations/month</strong> per phone number.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
