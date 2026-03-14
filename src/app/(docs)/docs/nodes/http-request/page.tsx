import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";
import { TabGroup } from "@/components/docs/tab-group";

export const metadata: Metadata = { title: "HTTP Request Node" };

export default function HttpRequestPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "HTTP Request" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">HTTP Request Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Make HTTP requests to any API or webhook endpoint.
      </p>

      {/* Overview */}
      <h2 id="overview" className="mt-12 text-2xl font-bold">
        Overview
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        The HTTP Request node lets you call any REST API. Configure the method,
        URL, headers, authentication, and body. The response is stored in
        context under your variable name.
      </p>

      {/* Configuration */}
      <h2 id="configuration" className="mt-12 text-2xl font-bold">
        Configuration
      </h2>

      <h3 id="variable-name" className="mt-8 text-xl font-semibold">
        Variable Name
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        The key under which the response is stored in context. Default:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          httpRequest
        </code>
      </p>
      <p className="mt-2 text-foreground/80">
        Reference the output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-orange">
          {"{{variableName.httpResponse.data}}"}
        </code>
      </p>

      <h3 id="method" className="mt-8 text-xl font-semibold">
        Method
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Supported: <strong>GET</strong>, <strong>POST</strong>,{" "}
        <strong>PUT</strong>, <strong>PATCH</strong>, <strong>DELETE</strong>,{" "}
        <strong>HEAD</strong>, <strong>OPTIONS</strong>
      </p>

      <h3 id="url" className="mt-8 text-xl font-semibold">
        URL
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        The endpoint URL. Supports template variables:
      </p>
      <CodeBlock
        language="text"
        code="https://api.example.com/users/{{userId.httpResponse.data.id}}"
      />

      {/* Authentication */}
      <h3 id="authentication" className="mt-8 text-xl font-semibold">
        Authentication
      </h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Type</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["None", "No authentication"],
              ["Bearer Token", "Authorization: Bearer {token}"],
              ["Basic Auth", "Base64 encoded username:password"],
              ["API Key (Header)", "Custom header with API key"],
              ["API Key (Query)", "API key appended to URL"],
            ].map(([type, desc], i) => (
              <tr key={type} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2 font-medium">{type}</td>
                <td className="px-4 py-2 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 id="query-parameters" className="mt-8 text-xl font-semibold">
        Query Parameters
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Key-value pairs appended to the URL automatically. Values support{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          {"{{variables}}"}
        </code>
        .
      </p>

      <h3 id="headers" className="mt-8 text-xl font-semibold">
        Headers
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        Custom request headers. Values support{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          {"{{variables}}"}
        </code>
        .
      </p>

      {/* Body */}
      <h3 id="body" className="mt-8 text-xl font-semibold">
        Body (POST / PUT / PATCH / DELETE)
      </h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Type</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["JSON", "Raw JSON with {{variables}} support"],
              ["Form Data", "Multipart form fields"],
              ["URL Encoded", "application/x-www-form-urlencoded"],
              ["Raw", "Plain text with custom Content-Type"],
            ].map(([type, desc], i) => (
              <tr key={type} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2 font-medium">{type}</td>
                <td className="px-4 py-2 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Response Format */}
      <h3 id="response-format" className="mt-8 text-xl font-semibold">
        Response Format
      </h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-semibold">Value</th>
              <th className="px-4 py-2 text-left font-semibold">Behavior</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Auto", "Detect from Content-Type header"],
              ["JSON", "Force JSON.parse"],
              ["Text", "Return raw text string"],
            ].map(([val, desc], i) => (
              <tr key={val} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2 font-medium">{val}</td>
                <td className="px-4 py-2 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Advanced */}
      <h3 id="advanced-settings" className="mt-8 text-xl font-semibold">
        Advanced Settings
      </h3>
      <PropertyTable
        properties={[
          {
            name: "timeout",
            type: "number",
            required: false,
            default: "30000",
            description: "Request timeout in milliseconds",
          },
          {
            name: "followRedirects",
            type: "boolean",
            required: false,
            default: "true",
            description: "Follow HTTP redirects",
          },
          {
            name: "retryOnStatus",
            type: "string",
            required: false,
            description:
              'Comma-separated status codes to retry, e.g. "429,503"',
          },
          {
            name: "maxRetries",
            type: "number",
            required: false,
            default: "0",
            description: "Max retry attempts (0-5)",
          },
        ]}
      />

      {/* Output Shape */}
      <h2 id="output-shape" className="mt-12 text-2xl font-bold">
        Output Shape
      </h2>
      <CodeBlock
        language="json"
        code={`{
  "[variableName]": {
    "httpResponse": {
      "data": {},
      "status": 200,
      "statusText": "OK",
      "ok": true,
      "headers": {},
      "url": "...",
      "method": "GET",
      "responseTime": 142
    }
  }
}`}
      />

      {/* Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Examples
      </h2>

      <TabGroup
        tabs={[
          {
            label: "GET Request",
            content: (
              <>
                <p className="mb-3 text-sm text-foreground/80">
                  Fetch a user by ID and reference the response downstream.
                </p>
                <PropertyTable
                  properties={[
                    {
                      name: "variableName",
                      type: "string",
                      required: true,
                      default: "userData",
                      description: "Context key for the response",
                    },
                    {
                      name: "method",
                      type: "string",
                      required: true,
                      default: "GET",
                      description: "HTTP method",
                    },
                    {
                      name: "url",
                      type: "string",
                      required: true,
                      description: "https://api.example.com/users/1",
                    },
                  ]}
                />
                <p className="mt-2 text-sm text-foreground/80">
                  Access the response:{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
                    {"{{userData.httpResponse.data.name}}"}
                  </code>
                </p>
              </>
            ),
          },
          {
            label: "POST with Variables",
            content: (
              <>
                <p className="mb-3 text-sm text-foreground/80">
                  Create a Razorpay order using data from a previous node.
                </p>
                <CodeBlock
                  language="json"
                  title="Request Body"
                  code={`{
  "amount": "{{payment.httpResponse.data.amount}}",
  "currency": "INR"
}`}
                />
              </>
            ),
          },
          {
            label: "Chain Requests",
            content: (
              <>
                <p className="mb-3 text-sm text-foreground/80">
                  First fetch a user, then fetch their posts using the user ID.
                </p>
                <CodeBlock
                  language="text"
                  title="Node 1"
                  code={`GET /users/1 → variableName: "user"`}
                />
                <CodeBlock
                  language="text"
                  title="Node 2"
                  code={`GET /posts?userId={{user.httpResponse.data.id}}
→ variableName: "userPosts"`}
                />
              </>
            ),
          },
        ]}
      />

      {/* Error Handling */}
      <h2 id="error-handling" className="mt-12 text-2xl font-bold">
        Error Handling
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Non-2xx responses throw a <strong>NonRetriableError</strong> by default.
        Enable <em>&quot;Continue on error&quot;</em> to handle failures
        gracefully.
      </p>

      <Callout type="tip">
        Check{" "}
        <code className="font-mono text-sm">
          {"{{variableName.httpResponse.ok}}"}
        </code>{" "}
        in the next node to branch on success or failure.
      </Callout>

      <PrevNextLinks />
    </>
  );
}
