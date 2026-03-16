import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "MSG91 Node" };

export default function Msg91Page() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "MSG91" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">MSG91 Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Send SMS, OTP, WhatsApp messages, voice OTPs, and emails via MSG91 —
        India&apos;s most popular messaging API. Use it for order confirmations,
        OTP verification flows, bulk campaign messages, and transactional alerts.
      </p>

      {/* Prerequisites */}
      <h2 id="prerequisites" className="mt-12 text-2xl font-bold">
        Prerequisites
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-2 text-foreground/80">
        <li>
          A MSG91 account at{" "}
          <a
            href="https://msg91.com"
            target="_blank"
            rel="noreferrer"
            className="text-orange underline"
          >
            msg91.com
          </a>
        </li>
        <li>
          Auth Key from <strong>MSG91 Dashboard → API → Auth Key</strong>
        </li>
        <li>
          <strong>DLT registration</strong> for all commercial SMS (mandatory
          for India — see DLT note below)
        </li>
        <li>
          Approved SMS templates on DLT portal (Jio DLT, Vodafone DLT, etc.)
        </li>
        <li>
          For WhatsApp operations: an integrated WhatsApp Business number on
          MSG91
        </li>
      </ul>

      <Callout type="warning">
        <strong>DLT Registration Required.</strong> All commercial SMS in India
        (promotional, transactional, and OTP) requires TRAI DLT registration.
        Register your sender ID, templates, and entity on the Jio DLT or
        Vodafone DLT portal before sending. Your <code className="font-mono text-sm">flowId</code>{" "}
        must correspond to an approved DLT template.
      </Callout>

      {/* Credentials */}
      <h2 id="credentials" className="mt-12 text-2xl font-bold">
        Credentials
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Field</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Where to find it
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2.5 font-medium">Auth Key</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                Your MSG91 API authentication key
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                MSG91 Dashboard → API → Auth Key
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ol className="mt-4 list-inside list-decimal space-y-1 text-foreground/80">
        <li>
          Go to <strong>Settings → Credentials</strong>
        </li>
        <li>
          Click <strong>Add Credential</strong>
        </li>
        <li>
          Select <strong>MSG91</strong>
        </li>
        <li>Paste your Auth Key</li>
        <li>
          Click <strong>Save</strong>
        </li>
      </ol>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      {/* SEND_SMS */}
      <h3 id="send-sms" className="mt-8 text-xl font-semibold">
        Send SMS (Template)
      </h3>
      <p className="mt-2 text-foreground/80">
        Send a DLT-approved template SMS using a flow ID.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code, e.g. 919876543210",
          },
          {
            name: "senderId",
            type: "string",
            required: true,
            description: "6-character DLT-approved sender ID, e.g. NODEBS",
          },
          {
            name: "flowId",
            type: "string",
            required: true,
            description: "MSG91 flow ID linked to a DLT-approved template",
          },
          {
            name: "smsVariables",
            type: "JSON",
            required: false,
            description:
              'Template variables as JSON, e.g. {"VAR1": "500", "VAR2": "ORD-123"}',
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "SEND_SMS",
    "requestId": "9123456789",
    "status": "success",
    "mobile": "919876543210"
  }
}`}
      />

      {/* SEND_TRANSACTIONAL */}
      <h3 id="send-transactional" className="mt-8 text-xl font-semibold">
        Send Transactional SMS
      </h3>
      <p className="mt-2 text-foreground/80">
        Send a plain-text transactional message using route 4 (transactional)
        or route 8 (OTP).
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code",
          },
          {
            name: "senderId",
            type: "string",
            required: true,
            description: "6-character DLT-approved sender ID",
          },
          {
            name: "message",
            type: "string",
            required: true,
            description: "SMS message text",
          },
          {
            name: "route",
            type: "number",
            required: true,
            default: "4",
            description: "4 = transactional, 8 = OTP",
          },
        ]}
      />

      {/* SEND_BULK_SMS */}
      <h3 id="send-bulk-sms" className="mt-8 text-xl font-semibold">
        Send Bulk SMS
      </h3>
      <p className="mt-2 text-foreground/80">
        Send personalized template SMS to multiple numbers in one API call.
      </p>
      <PropertyTable
        properties={[
          {
            name: "senderId",
            type: "string",
            required: true,
            description: "6-character DLT-approved sender ID",
          },
          {
            name: "flowId",
            type: "string",
            required: true,
            description: "MSG91 flow ID for the DLT template",
          },
          {
            name: "bulkData",
            type: "JSON array",
            required: true,
            description:
              'Array of objects: [{"mobile":"91...", "VAR1":"...", "VAR2":"..."}]',
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "SEND_BULK_SMS",
    "requestId": "9123456789",
    "count": 50,
    "status": "success"
  }
}`}
      />

      {/* SCHEDULE_SMS */}
      <h3 id="schedule-sms" className="mt-8 text-xl font-semibold">
        Schedule SMS
      </h3>
      <p className="mt-2 text-foreground/80">
        Schedule a template SMS to be sent at a future time.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code",
          },
          {
            name: "senderId",
            type: "string",
            required: true,
            description: "6-character sender ID",
          },
          {
            name: "flowId",
            type: "string",
            required: true,
            description: "Flow ID for template",
          },
          {
            name: "smsVariables",
            type: "JSON",
            required: false,
            description: "Template variables",
          },
          {
            name: "scheduleTime",
            type: "string",
            required: true,
            description: "Schedule time in YYYY-MM-DD HH:mm:ss format (IST)",
          },
        ]}
      />

      {/* SEND_OTP */}
      <h3 id="send-otp" className="mt-8 text-xl font-semibold">
        Send OTP
      </h3>
      <p className="mt-2 text-foreground/80">
        Send a one-time password to a mobile number. MSG91 generates the OTP
        automatically and sends it directly to the user.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code, e.g. 919876543210",
          },
          {
            name: "otpTemplateId",
            type: "string",
            required: true,
            description: "DLT-approved OTP template ID from MSG91 Dashboard",
          },
          {
            name: "otpLength",
            type: "number",
            required: true,
            default: "6",
            description: "Number of digits: 4, 5, or 6",
          },
          {
            name: "otpExpiry",
            type: "number",
            required: true,
            default: "10",
            description: "Minutes before OTP expires",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "SEND_OTP",
    "status": "success",
    "mobile": "919876543210",
    "message": "OTP sent successfully",
    "timestamp": "2026-04-01T10:00:00.000Z"
  }
}`}
      />
      <Callout type="tip">
        <strong>OTP is never returned in output</strong> — MSG91 sends it
        directly to the user&apos;s phone for security. To verify it, use the{" "}
        <strong>Verify OTP</strong> operation with{" "}
        <code className="font-mono text-sm">{"{{body.otp}}"}</code> from your
        form or webhook input.
      </Callout>

      {/* VERIFY_OTP */}
      <h3 id="verify-otp" className="mt-8 text-xl font-semibold">
        Verify OTP
      </h3>
      <p className="mt-2 text-foreground/80">
        Verify an OTP entered by the user. Returns{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{msg91.verified}}"}
        </code>{" "}
        as true or false. Use an If / Else node immediately after to gate access.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Same phone number used in Send OTP",
          },
          {
            name: "otpValue",
            type: "string",
            required: true,
            description:
              'OTP entered by user — typically {{body.otp}} from form submission',
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "VERIFY_OTP",
    "verified": true,
    "mobile": "919876543210"
  }
}`}
      />
      <Callout type="warning">
        Use an <strong>If / Else</strong> node after Verify OTP checking{" "}
        <code className="font-mono text-sm">{"{{msg91.verified}}"}</code>{" "}
        equals <code className="font-mono text-sm">true</code>. The TRUE branch
        proceeds with account creation; the FALSE branch returns an error
        message.
      </Callout>

      <CodeBlock
        language="text"
        title="OTP Verification Workflow"
        code={`Webhook Trigger (user submits phone)
→ MSG91 — Send OTP
    mobile:          {{body.mobile}}
    otpTemplateId:   abc123def456
    otpLength:       6
    otpExpiry:       10
→ HTTP Response: {"message": "OTP sent"}

───────── (second workflow) ─────────

Webhook Trigger (user submits OTP)
→ MSG91 — Verify OTP
    mobile:   {{body.mobile}}
    otpValue: {{body.otp}}
→ If / Else: {{msg91.verified}} equals true
  TRUE  → Create account → Send welcome SMS
  FALSE → HTTP Response: {"error": "Invalid OTP. Try again."}`}
      />

      {/* RESEND_OTP */}
      <h3 id="resend-otp" className="mt-8 text-xl font-semibold">
        Resend OTP
      </h3>
      <p className="mt-2 text-foreground/80">
        Resend the OTP via SMS text or voice call.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code",
          },
          {
            name: "retryType",
            type: "string",
            required: true,
            description: '"text" to resend via SMS, "voice" to call the number',
          },
        ]}
      />

      {/* INVALIDATE_OTP */}
      <h3 id="invalidate-otp" className="mt-8 text-xl font-semibold">
        Invalidate OTP
      </h3>
      <p className="mt-2 text-foreground/80">
        Immediately expire the active OTP for a mobile number. Use this after a
        successful verification or on logout.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code",
          },
        ]}
      />

      {/* SEND_WHATSAPP */}
      <h3 id="send-whatsapp" className="mt-8 text-xl font-semibold">
        Send WhatsApp (Template)
      </h3>
      <p className="mt-2 text-foreground/80">
        Send a pre-approved WhatsApp template message via MSG91&apos;s
        integrated WhatsApp Business API.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Recipient phone with country code",
          },
          {
            name: "integratedNumber",
            type: "string",
            required: true,
            description: "Your MSG91 integrated WhatsApp number",
          },
          {
            name: "whatsappTemplate",
            type: "string",
            required: true,
            description: "Approved template name",
          },
          {
            name: "whatsappLang",
            type: "string",
            required: true,
            default: "en",
            description: "Template language code, e.g. en, hi, mr",
          },
          {
            name: "whatsappParams",
            type: "JSON array",
            required: false,
            description:
              'Template variable values: ["Rahul", "ORD-123", "₹500"]',
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "SEND_WHATSAPP",
    "messageId": "msg_OFj67X3s9kH5rA",
    "status": "success",
    "mobile": "919876543210"
  }
}`}
      />

      {/* SEND_WHATSAPP_MEDIA */}
      <h3 id="send-whatsapp-media" className="mt-8 text-xl font-semibold">
        Send WhatsApp Media
      </h3>
      <p className="mt-2 text-foreground/80">
        Send an image, video, document, or audio file via WhatsApp.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Recipient phone with country code",
          },
          {
            name: "integratedNumber",
            type: "string",
            required: true,
            description: "Your integrated WhatsApp number",
          },
          {
            name: "mediaType",
            type: "string",
            required: true,
            description: "image · video · document · audio",
          },
          {
            name: "mediaUrl",
            type: "string",
            required: true,
            description: "Public URL of the media file",
          },
          {
            name: "mediaCaption",
            type: "string",
            required: false,
            description: "Caption shown below the media",
          },
        ]}
      />

      {/* SEND_VOICE_OTP */}
      <h3 id="send-voice-otp" className="mt-8 text-xl font-semibold">
        Send Voice OTP
      </h3>
      <p className="mt-2 text-foreground/80">
        Deliver an OTP via automated voice call. Useful as a fallback when SMS
        is not delivered.
      </p>
      <PropertyTable
        properties={[
          {
            name: "mobile",
            type: "string",
            required: true,
            description: "Phone number with country code",
          },
          {
            name: "otpTemplateId",
            type: "string",
            required: true,
            description: "Voice OTP template ID",
          },
          {
            name: "otpLength",
            type: "number",
            required: true,
            default: "6",
            description: "OTP digit length: 4, 5, or 6",
          },
          {
            name: "otpExpiry",
            type: "number",
            required: true,
            default: "10",
            description: "Minutes before OTP expires",
          },
        ]}
      />

      {/* SEND_EMAIL */}
      <h3 id="send-email" className="mt-8 text-xl font-semibold">
        Send Email
      </h3>
      <p className="mt-2 text-foreground/80">
        Send a transactional email via MSG91&apos;s email service.
      </p>
      <PropertyTable
        properties={[
          {
            name: "toEmail",
            type: "string",
            required: true,
            description: "Recipient email address",
          },
          {
            name: "subject",
            type: "string",
            required: true,
            description: "Email subject line",
          },
          {
            name: "emailBody",
            type: "string",
            required: true,
            description: "HTML or plain-text email body",
          },
          {
            name: "fromEmail",
            type: "string",
            required: true,
            description: "Sender email address",
          },
          {
            name: "fromName",
            type: "string",
            required: false,
            description: "Sender display name",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "SEND_EMAIL",
    "status": "success",
    "toEmail": "rahul@example.com"
  }
}`}
      />

      {/* GET_BALANCE */}
      <h3 id="get-balance" className="mt-8 text-xl font-semibold">
        Get Balance
      </h3>
      <p className="mt-2 text-foreground/80">
        Check remaining SMS credits in your MSG91 account.
      </p>
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "operation": "GET_BALANCE",
    "balance": 4850,
    "type": "SMS"
  }
}`}
      />

      {/* GET_REPORT */}
      <h3 id="get-report" className="mt-8 text-xl font-semibold">
        Get Report
      </h3>
      <p className="mt-2 text-foreground/80">
        Fetch delivery report for a previously sent SMS using its request ID.
      </p>
      <PropertyTable
        properties={[
          {
            name: "requestId",
            type: "string",
            required: true,
            description:
              "Request ID from a previous Send SMS operation — use {{msg91.requestId}}",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "msg91": {
    "requestId": "9123456789",
    "reports": [
      { "mobile": "919876543210", "status": "delivered", "deliveredAt": "..." }
    ]
  }
}`}
      />

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3 id="example-order-sms" className="mt-8 text-xl font-semibold">
        Post-Payment Order Confirmation SMS
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Automatically send an order confirmation SMS
        after a Razorpay payment is captured.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (event: payment.captured)
→ MSG91 — Send SMS
    mobile:       {{razorpayTrigger.payload.payment.entity.contact}}
    senderId:     NODEBS
    flowId:       your_dlt_flow_id
    smsVariables: {
      "VAR1": "{{razorpayTrigger.payload.payment.entity.notes.customerName}}",
      "VAR2": "{{razorpayTrigger.payload.payment.entity.id}}"
    }`}
      />

      <h3 id="example-otp-login" className="mt-8 text-xl font-semibold">
        OTP Login Flow
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Allow users to log in to your app using phone
        number OTP.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Webhook Trigger (POST /send-otp, body: { mobile })
→ MSG91 — Send OTP
    mobile:        {{body.mobile}}
    otpTemplateId: abc123
    otpLength:     6
    otpExpiry:     10
→ HTTP Response: {"message": "OTP sent to your number"}

─────── Second workflow ───────

Webhook Trigger (POST /verify-otp, body: { mobile, otp })
→ MSG91 — Verify OTP
    mobile:   {{body.mobile}}
    otpValue: {{body.otp}}
→ If / Else: {{msg91.verified}} equals true
  TRUE  → Set Variable: userId = {{body.mobile}}
          → HTTP Response: {"token": "...", "message": "Login successful"}
  FALSE → HTTP Response: {"error": "Invalid OTP"}`}
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
                "SMS not delivered (DND numbers)",
                "Number is on Do Not Disturb registry",
                "Use route 4 (transactional) for order updates — DND does not apply",
              ],
              [
                "Flow ID error",
                "DLT template not approved or wrong flow ID",
                "Verify template approval in MSG91 Dashboard → DLT Templates",
              ],
              [
                "OTP verification always fails",
                "OTP expired or wrong mobile number used",
                "Ensure same mobile is used in Send and Verify. Shorten otpExpiry if needed",
              ],
              [
                "Balance is 0",
                "Account ran out of SMS credits",
                "Recharge at MSG91 Dashboard or set up auto-recharge",
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
          <a href="/docs/nodes/razorpay-trigger" className="text-orange underline">
            Razorpay Trigger
          </a>{" "}
          — trigger MSG91 SMS on payment events
        </li>
        <li>
          <a href="/docs/nodes/if-else" className="text-orange underline">
            If / Else
          </a>{" "}
          — gate access based on{" "}
          <code className="font-mono text-sm">{"{{msg91.verified}}"}</code>
        </li>
        <li>
          <a href="/docs/nodes/whatsapp" className="text-orange underline">
            WhatsApp
          </a>{" "}
          — send WhatsApp messages directly via Meta API
        </li>
        <li>
          <a href="/docs/nodes/shiprocket" className="text-orange underline">
            Shiprocket
          </a>{" "}
          — pair with Shiprocket AWB in SMS content
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
