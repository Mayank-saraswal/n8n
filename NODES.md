# Nodebase — Complete Node Reference

This document covers every node available in **Nodebase** — its capabilities, all supported operations, known limitations, and guidance on the types of real-world workflows it can handle.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [How Nodes & Workflows Work](#how-nodes--workflows-work)
3. [Trigger Nodes](#trigger-nodes)
   - [Manual Trigger](#manual-trigger)
   - [Schedule Trigger](#schedule-trigger)
   - [Webhook Trigger](#webhook-trigger)
   - [Razorpay Trigger](#razorpay-trigger)
   - [WhatsApp Trigger](#whatsapp-trigger)
   - [Error Trigger](#error-trigger)
   - [Google Form Trigger](#google-form-trigger)
   - [Stripe Trigger](#stripe-trigger)
4. [Execution Nodes — Logic & Control Flow](#execution-nodes--logic--control-flow)
   - [If / Else](#if--else)
   - [Switch](#switch)
   - [Loop](#loop)
   - [Merge](#merge)
   - [Wait](#wait)
   - [Set Variable](#set-variable)
   - [Code](#code)
5. [Execution Nodes — Communication](#execution-nodes--communication)
   - [Gmail](#gmail)
   - [WhatsApp](#whatsapp)
   - [Slack](#slack)
   - [Telegram](#telegram)
   - [Discord](#discord)
   - [MSG91](#msg91)
6. [Execution Nodes — Google Workspace](#execution-nodes--google-workspace)
   - [Google Sheets](#google-sheets)
   - [Google Drive](#google-drive)
7. [Execution Nodes — Productivity & CRM](#execution-nodes--productivity--crm)
   - [Notion](#notion)
   - [Workday](#workday)
8. [Execution Nodes — Payments & Commerce](#execution-nodes--payments--commerce)
   - [Razorpay](#razorpay)
   - [Shiprocket](#shiprocket)
9. [Execution Nodes — AI / LLM](#execution-nodes--ai--llm)
   - [Anthropic (Claude)](#anthropic-claude)
   - [OpenAI (GPT)](#openai-gpt)
   - [Gemini](#gemini-google)
   - [Groq](#groq)
   - [DeepSeek](#deepseek)
   - [Perplexity](#perplexity)
   - [xAI (Grok)](#xai-grok)
10. [Execution Nodes — HTTP & Social](#execution-nodes--http--social)
    - [HTTP Request](#http-request)
    - [X (Twitter)](#x-twitter)
11. [Workflow Capability Summary](#workflow-capability-summary)
12. [Platform Limitations](#platform-limitations)
13. [Real-World Workflow Examples](#real-world-workflow-examples)

---

## Platform Overview

**Nodebase** is a visual, code-optional workflow automation platform built on:

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, React Flow |
| Styling | Tailwind CSS, shadcn/ui |
| Workflow Engine | [Inngest](https://www.inngest.com/) (durable, retryable step functions) |
| Real-time UI | `@inngest/realtime` pub/sub channels |
| Database | PostgreSQL via Prisma ORM |
| Auth | Better Auth |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/*`) |

Workflows are built visually on a canvas. Each node is a configured step. The engine executes steps durably — if a step fails, Inngest retries it without re-running completed steps.

---

## How Nodes & Workflows Work

1. **Trigger** — Every workflow starts with exactly one trigger node. It defines what event kicks things off (manual click, schedule, webhook, payment event, etc.).
2. **Execution nodes** — The body of the workflow. Each node reads from the shared **context** object, does its work, and writes its output back into context under a `variableName` key.
3. **Context propagation** — Outputs from any node are available to all downstream nodes via `{{variableName.field}}` template syntax.
4. **Branching** — If/Else, Switch, and Loop nodes can route data to different downstream paths.
5. **Parallel execution** — Branches from a Switch or If/Else can run in parallel; a Merge node re-combines results.
6. **Error handling** — The Error Trigger catches failures in any other node of the same workflow and fires a separate error-handling sub-workflow.

---

## Trigger Nodes

### Manual Trigger

| Property | Detail |
|---|---|
| **Purpose** | Start a workflow on demand from the Nodebase UI |
| **Authentication** | None |
| **Operations** | 1 — fire workflow |
| **Payload** | Passes the existing context (empty `{}` on first run) |

**Capabilities:**
- Instant, one-click workflow execution from the canvas
- Useful for testing workflows during development
- Supports passing no initial data (context starts empty)

**Limitations:**
- No input payload — cannot pass custom data at trigger time via the UI
- Not suitable for production event-driven automation on its own

---

### Schedule Trigger

| Property | Detail |
|---|---|
| **Purpose** | Run a workflow on a time-based schedule (cron) |
| **Authentication** | None |
| **Operations** | 1 — fire on schedule |

**Capabilities:**
- Supports cron expressions for fine-grained scheduling (every minute, hourly, daily, weekly, etc.)
- Powered by Inngest's cron scheduling — highly reliable

**Limitations:**
- Cannot pass dynamic data at trigger time
- Minimum granularity depends on the Inngest plan
- Not event-driven — cannot react to external changes between intervals

---

### Webhook Trigger

| Property | Detail |
|---|---|
| **Purpose** | Receive arbitrary HTTP POST requests from any external system |
| **Authentication** | Optional secret token validation |
| **Operations** | 1 — receive HTTP request |
| **Webhook URL** | `/api/webhooks/[webhookId]` |

**Capabilities:**
- Accepts any JSON payload from any HTTP client
- Unique webhook URL per node instance
- Can be used to integrate with any third-party service that supports webhooks

**Limitations:**
- Only POST requests are supported for triggering
- No built-in request signature verification (unlike Razorpay Trigger)
- Webhook URL changes if the node is deleted and recreated

---

### Razorpay Trigger

| Property | Detail |
|---|---|
| **Purpose** | Receive Razorpay payment webhook events |
| **Authentication** | HMAC-SHA256 signature verification using Razorpay webhook secret |
| **Operations** | 1 — receive verified Razorpay event |
| **Webhook URL** | `/api/webhooks/razorpay/[webhookId]` |

**Supported Events (configurable):**
- `payment.authorized`, `payment.captured`, `payment.failed`
- `order.paid`
- `refund.created`, `refund.processed`
- `subscription.activated`, `subscription.charged`, `subscription.halted`, `subscription.cancelled`
- `invoice.paid`, `invoice.expired`

**Capabilities:**
- Cryptographic verification of every incoming request
- Stores `webhookSecret`, `activeEvents`, `variableName` configuration per node
- Exposes full Razorpay event payload to downstream nodes

**Limitations:**
- Only supports Razorpay webhooks (not generic payment webhooks)
- Webhook secret must be configured manually in Razorpay dashboard
- One trigger = one webhook URL (cannot fan-out to multiple workflows from one URL without duplicating nodes)

---

### WhatsApp Trigger

| Property | Detail |
|---|---|
| **Purpose** | Receive incoming WhatsApp messages via Meta Business API |
| **Authentication** | Meta webhook verification token + app secret |
| **Operations** | 1 — receive verified WhatsApp message/event |
| **Webhook URL** | `/api/webhooks/whatsapp/[webhookId]` |

**Capabilities:**
- GET endpoint handles Meta's webhook verification challenge
- POST endpoint processes incoming message events
- Configurable `activeEvents` (e.g., messages, message status updates)
- Configurable `messageTypes` filter and `ignoreOwnMessages` flag
- Exposes full message payload to downstream nodes

**Limitations:**
- Requires a verified Meta Business account and approved WhatsApp Business API access
- Phone number ID must be configured per trigger node
- Only listens — cannot send replies from the trigger node itself (use WhatsApp execution node for replies)

---

### Error Trigger

| Property | Detail |
|---|---|
| **Purpose** | Catch errors from any other node in the same workflow and run an error-handling sub-graph |
| **Authentication** | None |
| **Operations** | 1 — fires on workflow node failure |

**Capabilities:**
- Automatically fires when any node in the same workflow throws an error
- Receives error context: `errorMessage`, `errorNodeId`, `originalContext`
- Enables alerting (send a Slack/Gmail message on failure)
- Executes downstream nodes independently from the main execution path

**Limitations:**
- Can only be used once per workflow
- Does not catch errors in other Error Trigger sub-graphs (no recursive error catching)
- The error-handling path runs as a separate Inngest function invocation

---

### Google Form Trigger

| Property | Detail |
|---|---|
| **Purpose** | Trigger a workflow when a Google Form response is submitted |
| **Authentication** | Google OAuth credentials |
| **Operations** | 1 — receive form submission |

**Capabilities:**
- Passes the form response data to downstream nodes

**Limitations:**
- Requires Google Form to be connected via Apps Script or Pub/Sub (not direct polling)
- Integration setup requires manual configuration outside of Nodebase

---

### Stripe Trigger

| Property | Detail |
|---|---|
| **Purpose** | Receive Stripe payment webhook events |
| **Authentication** | Stripe webhook signature |
| **Operations** | 1 — receive verified Stripe event |

**Capabilities:**
- Passes full Stripe event payload downstream

**Limitations:**
- Event filtering and signature verification setup must be done in the Stripe dashboard
- Full Stripe event type coverage depends on configuration

---

## Execution Nodes — Logic & Control Flow

### If / Else

| Property | Detail |
|---|---|
| **Purpose** | Conditional branching — route execution based on conditions |
| **Operations** | 1 — evaluate conditions and route |

**Capabilities:**
- Supports compound conditions with AND / OR logic
- Condition operators: `equals`, `not equals`, `contains`, `not contains`, `greater than`, `less than`, `is empty`, `is not empty`, `starts with`, `ends with`
- Supports dot-notation paths to access nested context values (e.g., `payment.status`)
- True branch and False branch execute independently in parallel

**Limitations:**
- Maximum condition complexity is bounded by UI (no arbitrary expression language)
- Cannot compare two dynamic context values against each other in a single condition (only value vs. literal)
- No else-if chain — use Switch node for multi-branch logic

---

### Switch

| Property | Detail |
|---|---|
| **Purpose** | Multi-branch routing — evaluate multiple named cases and route to the first match |
| **Operations** | 1 — evaluate cases and route to first match or fallback |

**Capabilities:**
- Up to **20 cases** per Switch node
- Each case has its own full compound conditions (same operators as If/Else)
- First-match wins semantics
- Built-in **Fallback** branch when no case matches
- Each branch name is stored and passed downstream as `switch.matchedCase`

**Limitations:**
- Maximum of 20 cases per node
- Cannot have two Switch nodes in a row without a Merge in between (or separate connections)
- Condition evaluation is sequential — no parallelism within case evaluation

---

### Loop

| Property | Detail |
|---|---|
| **Purpose** | Iterate over an array from context and execute downstream nodes for each item |
| **Operations** | 1 — iterate and execute |

**Capabilities:**
- Resolves input array via dot-notation path (e.g., `googleSheets.rows`)
- Executes the downstream sub-graph once per array item
- Each iteration item is accessible via the configured variable name
- Supports nested context values
- Uses lazy executor registry import to avoid circular dependencies

**Limitations:**
- The input must be an array — scalar values throw a `NonRetriableError`
- Very large arrays (thousands of items) may hit Inngest step limits or timeouts
- Cannot loop over object keys directly (must convert to array first using Code node)
- No built-in `break` or `continue` logic — use If/Else inside the loop for conditional skipping

---

### Merge

| Property | Detail |
|---|---|
| **Purpose** | Combine outputs from multiple parallel branches into a single context object |
| **Operations** | 1 — merge branches using a chosen strategy |

**Merge Strategies (5):**

| Strategy | Description |
|---|---|
| `combine` | Spread all branch outputs into one flat object (default) |
| `position` | Zip arrays by index (array[0] merged with array[0], etc.) |
| `crossJoin` | Cartesian product of two arrays |
| `keyMatch` | Inner join two arrays by a shared key field |
| `keyDiff` | Outer difference — items from array A not present in array B |

**Capabilities:**
- Configurable `inputCount` — waits for N branches before executing
- Configurable `branchKeys` — selects which context variables to merge
- Publishes `waiting` status with progress to real-time UI
- Works with the parallel execution path in Inngest workflows

**Limitations:**
- `keyMatch` and `keyDiff` require both branches to produce arrays
- `crossJoin` on large arrays can produce very large result sets
- Cannot merge more than the configured `inputCount` — extra branches are ignored
- Branch keys must be known at design time

---

### Wait

| Property | Detail |
|---|---|
| **Purpose** | Pause workflow execution for a duration or until an external resume signal |
| **Operations** | 1 — sleep or wait for event |

**Wait Modes:**

| Mode | Description |
|---|---|
| `duration` | Sleep for a fixed time (seconds, minutes, hours, days, weeks) |
| `event` | Pause and wait for an external HTTP call to `/api/wait/resume/[waitId]` |

**Capabilities:**
- Duration mode uses Inngest `step.sleep` — durable, survives server restarts
- Event mode generates a unique `resumeUrl` and waits for an HTTP POST to it
- Resume URL is published to the real-time UI for display to the user
- Configurable `timeoutDuration` for event mode (auto-resume on timeout)
- Outputs include `startTime`, `endTime`, `elapsed`, and resume `payload` (event mode)

**Limitations:**
- Maximum wait duration is bounded by the Inngest plan (default up to 7 days on free tier)
- Resume URL is single-use — workflow cannot be resumed twice
- In event mode, the timeout auto-resumes with `{ timedOut: true }` — downstream nodes must handle this

---

### Set Variable

| Property | Detail |
|---|---|
| **Purpose** | Set or transform key-value pairs in the workflow context |
| **Operations** | 1 — set key/value pairs |

**Capabilities:**
- Configure multiple key-value pairs in a single node
- Values support `{{template}}` syntax to reference upstream context values
- Blank keys are automatically skipped
- Output is merged into context under the node's `variableName`

**Limitations:**
- No arithmetic or string transformation beyond template interpolation
- Cannot delete or unset existing context keys (use Code node for that)
- Template expressions do not support conditionals or filters

---

### Code

| Property | Detail |
|---|---|
| **Purpose** | Run arbitrary JavaScript/TypeScript in a sandboxed environment |
| **Operations** | 1 — execute code |

**Capabilities:**
- Full Node.js sandbox execution
- Access to the entire workflow `context` object as input
- Configurable execution timeout (default 5000ms)
- Output is anything the code returns — merged into context under `variableName`
- Three-step idempotent pattern: load config → validate → execute (retries only re-run the execute step)

**Limitations:**
- Sandboxed — no network access, no filesystem access by default
- No npm package imports (only built-in Node.js APIs)
- Execution timeout max is configurable but bounded
- Code errors are not retried by default (`NonRetriableError` for invalid code)
- Cannot import other workflow outputs directly — only what's in `context`

---

## Execution Nodes — Communication

### Gmail

| Property | Detail |
|---|---|
| **Purpose** | Full Gmail inbox and email management |
| **Authentication** | Google OAuth (Gmail scopes) |
| **Total Operations** | 18 |

**Operations by Category:**

| Category | Operations |
|---|---|
| **Send** | `SEND`, `REPLY`, `FORWARD`, `CREATE_DRAFT`, `SEND_DRAFT` |
| **Read** | `GET_MESSAGE`, `LIST_MESSAGES`, `SEARCH_MESSAGES`, `GET_THREAD`, `GET_ATTACHMENT` |
| **Organize** | `ADD_LABEL`, `REMOVE_LABEL`, `MARK_READ`, `MARK_UNREAD`, `MOVE_TO_TRASH` |
| **Labels** | `LIST_LABELS`, `CREATE_LABEL` |
| **Drafts** | `LIST_DRAFTS` |

**Capabilities:**
- Send rich emails with subject, body, and recipients
- Full label management
- Search emails with Gmail query syntax
- Read attachments, threads, and full message details
- Create and send drafts programmatically

**Limitations:**
- Cannot delete messages permanently (only move to trash)
- Attachment upload in outgoing emails is not supported (text/HTML only)
- Rate limits apply per Google OAuth quota
- Requires OAuth consent with the sending Gmail account

---

### WhatsApp

| Property | Detail |
|---|---|
| **Purpose** | Send WhatsApp messages via Meta Business Cloud API |
| **Authentication** | Meta access token + Phone Number ID |
| **Total Operations** | 5 |

**Operations:**

| Operation | Description |
|---|---|
| `SEND_TEXT` | Send a plain text message |
| `SEND_TEMPLATE` | Send a pre-approved WhatsApp template message |
| `SEND_IMAGE` | Send an image with optional caption |
| `SEND_DOCUMENT` | Send a document file |
| `SEND_REACTION` | Send an emoji reaction to a message |

**Capabilities:**
- Send to any WhatsApp number (24-hour window for text; templates can be used outside 24h)
- Template messages support variable parameter injection from context

**Limitations:**
- Cannot initiate a conversation outside the 24-hour messaging window without a template
- Templates must be pre-approved by Meta
- No support for receiving replies (use WhatsApp Trigger for that)
- No group messaging support
- Media files must be accessible via public URL

---

### Slack

| Property | Detail |
|---|---|
| **Purpose** | Full Slack workspace management |
| **Authentication** | Slack Bot Token (OAuth) |
| **Total Operations** | 25 |

**Operations by Category:**

| Category | Operations |
|---|---|
| **Messages** | `MESSAGE_SEND`, `MESSAGE_SEND_WEBHOOK`, `MESSAGE_UPDATE`, `MESSAGE_DELETE`, `MESSAGE_GET_PERMALINK`, `MESSAGE_SCHEDULE` |
| **Channels** | `CHANNEL_GET`, `CHANNEL_LIST`, `CHANNEL_CREATE`, `CHANNEL_ARCHIVE`, `CHANNEL_UNARCHIVE`, `CHANNEL_INVITE`, `CHANNEL_KICK`, `CHANNEL_SET_TOPIC`, `CHANNEL_SET_PURPOSE` |
| **Users** | `USER_GET`, `USER_GET_BY_EMAIL`, `USER_LIST`, `USER_SET_STATUS` |
| **Reactions** | `REACTION_ADD`, `REACTION_REMOVE`, `REACTION_GET` |
| **Files** | `FILE_UPLOAD`, `FILE_GET`, `FILE_DELETE` |

**Capabilities:**
- Send messages to channels or DMs with full Block Kit support (via webhook or API)
- Schedule messages for future delivery
- Full channel lifecycle management
- User lookup and status updates
- File upload and management

**Limitations:**
- Bot must be invited to a channel before sending to it
- File upload size limits apply per Slack plan
- `MESSAGE_SEND_WEBHOOK` requires a Slack Incoming Webhook URL (separate from bot token)
- Slack API rate limits apply (Tier 3/4 = ~50 RPM)

---

### Telegram

| Property | Detail |
|---|---|
| **Purpose** | Send messages to Telegram chats via Bot API |
| **Authentication** | Telegram Bot Token (direct credential, no OAuth) |
| **Operations** | 1 — send message |

**Capabilities:**
- Send text messages to any chat ID (user, group, or channel)
- Supports template syntax for dynamic message content
- HTML entity decoding for formatted messages

**Limitations:**
- One operation only — no reading messages, no media sending, no inline keyboards
- Bot must be a member of the target chat/channel
- Cannot initiate a conversation without the user first messaging the bot (privacy mode)

---

### Discord

| Property | Detail |
|---|---|
| **Purpose** | Send messages to Discord channels via webhook |
| **Authentication** | Discord Webhook URL (no OAuth) |
| **Operations** | 1 — send webhook message |

**Capabilities:**
- Send text messages to a Discord channel via webhook
- Configurable `username` override for the webhook bot name
- Supports template syntax for dynamic content

**Limitations:**
- Webhook only — no reading messages, no bot API features
- Cannot send embeds, files, or rich formatting via this node
- One webhook = one channel; multi-channel requires multiple nodes

---

### MSG91

| Property | Detail |
|---|---|
| **Purpose** | Multi-channel communications via MSG91 (SMS, OTP, WhatsApp, Voice, Email) |
| **Authentication** | MSG91 Auth Key |
| **Total Operations** | 14 |

**Operations by Category:**

| Category | Operations |
|---|---|
| **SMS** | `SEND_SMS`, `SEND_BULK_SMS`, `SEND_TRANSACTIONAL`, `SCHEDULE_SMS` |
| **OTP** | `SEND_OTP`, `VERIFY_OTP`, `RESEND_OTP`, `INVALIDATE_OTP` |
| **WhatsApp** | `SEND_WHATSAPP`, `SEND_WHATSAPP_MEDIA` |
| **Voice** | `SEND_VOICE_OTP` |
| **Email** | `SEND_EMAIL` |
| **Analytics** | `GET_BALANCE`, `GET_REPORT` |

**Capabilities:**
- Full OTP lifecycle (send → verify → resend → invalidate)
- Bulk SMS for mass notifications
- Schedule SMS for future delivery
- Account balance and delivery report retrieval
- WhatsApp Business API through MSG91 infrastructure

**Limitations:**
- Auth key is stored per credential (not per-workflow)
- OTP verification requires storing the OTP session ID in context between nodes
- Voice OTP is India-centric
- MSG91 account limits apply (DLT registration required for Indian SMS)

---

## Execution Nodes — Google Workspace

### Google Sheets

| Property | Detail |
|---|---|
| **Purpose** | Read and write Google Sheets spreadsheets |
| **Authentication** | Google OAuth (Sheets scope) |
| **Total Operations** | 10 |

**Operations:**

| Operation | Description |
|---|---|
| `READ_ROWS` | Read rows from a range |
| `APPEND_ROW` | Append a new row to a sheet |
| `UPDATE_ROW` | Update a specific row by row number |
| `UPDATE_ROWS_BY_QUERY` | Update rows matching a filter condition |
| `DELETE_ROW` | Delete a specific row |
| `GET_ROW_BY_NUMBER` | Fetch a single row by its number |
| `SEARCH_ROWS` | Search for rows matching a value in a column |
| `CLEAR_RANGE` | Clear all values in a range |
| `CREATE_SHEET` | Create a new sheet tab in a spreadsheet |
| `GET_SHEET_INFO` | Get sheet metadata (title, row count, etc.) |

**Capabilities:**
- Works with any Google Sheet the authenticated account has access to
- Supports configurable ranges (A1 notation)
- Column-based search and bulk updates

**Limitations:**
- No formula support — reads/writes values only (not formulas)
- No chart, conditional formatting, or formatting operations
- Large spreadsheets may hit Google API quota limits
- `UPDATE_ROWS_BY_QUERY` updates all matching rows (not just the first)

---

### Google Drive

| Property | Detail |
|---|---|
| **Purpose** | File and folder management in Google Drive |
| **Authentication** | Google OAuth (Drive scope) |
| **Total Operations** | 4 |

**Operations:**

| Operation | Description |
|---|---|
| `UPLOAD_FILE` | Upload a file to Google Drive |
| `DOWNLOAD_FILE` | Download a file by ID |
| `LIST_FILES` | List files in a folder or matching a query |
| `CREATE_FOLDER` | Create a new folder |

**Capabilities:**
- Upload arbitrary files (passed as base64 or URL)
- Download file content to pass to subsequent nodes
- List and search Drive files with query filters

**Limitations:**
- No file sharing/permissions management
- No Google Docs/Sheets/Slides native editing
- Uploading large files may time out in the execution sandbox
- No move, rename, or copy operations

---

## Execution Nodes — Productivity & CRM

### Notion

| Property | Detail |
|---|---|
| **Purpose** | Read and write Notion databases, pages, and blocks |
| **Authentication** | Notion Integration Token |
| **Total Operations** | 11 |

**Operations:**

| Operation | Description |
|---|---|
| `QUERY_DATABASE` | Query a Notion database with filters |
| `CREATE_DATABASE_PAGE` | Create a new page/row in a database |
| `UPDATE_DATABASE_PAGE` | Update properties of a database page |
| `GET_PAGE` | Retrieve a page's properties |
| `ARCHIVE_PAGE` | Archive (soft-delete) a page |
| `APPEND_BLOCK` | Append block content to a page |
| `GET_BLOCK_CHILDREN` | Get all child blocks of a page/block |
| `SEARCH` | Search Notion workspace |
| `GET_DATABASE` | Get database metadata |
| `GET_USER` | Get a workspace user by ID |
| `GET_USERS` | List all workspace users |

**Capabilities:**
- Full CRUD on Notion databases
- Block-level content operations
- Workspace search
- User management queries

**Limitations:**
- Cannot create new top-level databases (only pages within existing databases)
- Notion API rate limits: 3 requests/second
- Rich text formatting via block append only (not via database property update)
- Files and media cannot be uploaded — only linked via external URL

---

### Workday

| Property | Detail |
|---|---|
| **Purpose** | HR and workforce management via Workday REST API |
| **Authentication** | Workday tenant URL + OAuth/API credentials |
| **Total Operations** | 6 |

**Operations:**

| Operation | Description |
|---|---|
| `getWorker` | Get a specific worker by Worker ID |
| `getAllWorkers` | List all workers |
| `getTimeOff` | Get time-off requests |
| `getInvoices` | Get invoices |
| `submitExpense` | Submit an expense report |
| `updateContact` | Update a worker's contact information |

**Capabilities:**
- Direct REST calls to Workday tenant
- Configurable `limit` for list operations
- JSON body support for POST/PUT operations
- Worker ID-based lookups

**Limitations:**
- Requires valid Workday tenant URL and credentials
- Limited to 6 operations — does not cover Workday's full SOAP/REST API surface
- No Workday Studio or EIB integration
- Real-time sync not supported — pull-based only

---

## Execution Nodes — Payments & Commerce

### Razorpay

| Property | Detail |
|---|---|
| **Purpose** | Full payment lifecycle management via Razorpay API |
| **Authentication** | Razorpay Key ID + Key Secret |
| **Total Operations** | 28 |

**Operations by Category:**

| Category | Operations |
|---|---|
| **Orders** | `ORDER_CREATE`, `ORDER_FETCH`, `ORDER_FETCH_PAYMENTS`, `ORDER_LIST` |
| **Payments** | `PAYMENT_FETCH`, `PAYMENT_CAPTURE`, `PAYMENT_LIST`, `PAYMENT_UPDATE` |
| **Refunds** | `REFUND_CREATE`, `REFUND_FETCH`, `REFUND_LIST` |
| **Customers** | `CUSTOMER_CREATE`, `CUSTOMER_FETCH`, `CUSTOMER_UPDATE` |
| **Subscriptions** | `SUBSCRIPTION_CREATE`, `SUBSCRIPTION_FETCH`, `SUBSCRIPTION_CANCEL` |
| **Invoices** | `INVOICE_CREATE`, `INVOICE_FETCH`, `INVOICE_SEND`, `INVOICE_CANCEL` |
| **Payment Links** | `PAYMENT_LINK_CREATE`, `PAYMENT_LINK_FETCH`, `PAYMENT_LINK_UPDATE`, `PAYMENT_LINK_CANCEL` |
| **Payouts** | `PAYOUT_CREATE`, `PAYOUT_FETCH` |
| **Verification** | `VERIFY_PAYMENT_SIGNATURE` |

**Capabilities:**
- Complete payment lifecycle from order creation to payout
- HMAC payment signature verification for webhook events
- Subscription and recurring billing management
- Customer and invoice management
- Payment link generation and management

**Limitations:**
- Razorpay is India-focused — not all features available globally
- Payout operations require a linked bank account in Razorpay
- Webhook signature verification requires both `razorpayOrderId` and `razorpayPaymentId`
- Test mode and live mode credentials are separate

---

### Shiprocket

| Property | Detail |
|---|---|
| **Purpose** | Shipping and logistics management for Indian e-commerce |
| **Authentication** | Shiprocket email + password (JWT auto-refresh) |
| **Total Operations** | 23 |

**Operations by Category:**

| Category | Operations |
|---|---|
| **Orders** | `CREATE_ORDER`, `GET_ORDER`, `CANCEL_ORDER`, `UPDATE_ORDER`, `GET_ORDER_TRACKING`, `CLONE_ORDER`, `GENERATE_AWB`, `GET_ORDERS_LIST` |
| **Shipments** | `TRACK_SHIPMENT`, `ASSIGN_COURIER`, `GENERATE_LABEL`, `GENERATE_MANIFEST`, `REQUEST_PICKUP` |
| **Couriers** | `GET_COURIER_LIST`, `GET_RATE`, `CHECK_SERVICEABILITY` |
| **Returns** | `CREATE_RETURN`, `GET_RETURN_REASONS`, `TRACK_RETURN` |
| **Products** | `ADD_PRODUCT`, `GET_PRODUCTS` |
| **Warehouse** | `ADD_WAREHOUSE`, `GET_WAREHOUSES` |

**Capabilities:**
- End-to-end shipment lifecycle for Indian e-commerce
- AWB generation and courier assignment
- Rate calculation and serviceability checks before booking
- Full returns management with reason tracking
- Multi-warehouse support
- Product catalog integration

**Limitations:**
- India-only logistics network — international shipping not supported
- JWT authentication uses email/password (not API key) and must be refreshed per session
- `GENERATE_LABEL` and `GENERATE_MANIFEST` return PDFs — further processing requires the Code node
- Shiprocket account must have sufficient balance/plan for API access

---

## Execution Nodes — AI / LLM

All AI nodes follow the same pattern:
- Accept `userPrompt` and optionally `systemPrompt` (with template syntax support)
- Store API credential in the encrypted credential store
- Return generated text under the configured `variableName`

### Anthropic (Claude)

| Property | Detail |
|---|---|
| **Authentication** | Anthropic API Key |
| **Models** | Claude family (configured per credential) |
| **Operations** | 1 — generate text |

**Capabilities:** System prompt, user prompt, template interpolation, credential encryption

**Limitations:** No streaming, no function calling, no vision (image input) in current implementation

---

### OpenAI (GPT)

| Property | Detail |
|---|---|
| **Authentication** | OpenAI API Key |
| **Models** | GPT family |
| **Operations** | 1 — generate text |

**Limitations:** Same as Anthropic node — text generation only

---

### Gemini (Google)

| Property | Detail |
|---|---|
| **Authentication** | Google AI API Key |
| **Models** | Gemini family |
| **Operations** | 1 — generate text |

---

### Groq

| Property | Detail |
|---|---|
| **Authentication** | Groq API Key |
| **Models** | Llama, Mixtral via Groq infrastructure |
| **Operations** | 1 — generate text |

---

### DeepSeek

| Property | Detail |
|---|---|
| **Authentication** | DeepSeek API Key |
| **Operations** | 1 — generate text |

---

### Perplexity

| Property | Detail |
|---|---|
| **Authentication** | Perplexity API Key |
| **Operations** | 1 — generate text |

---

### xAI (Grok)

| Property | Detail |
|---|---|
| **Authentication** | xAI API Key |
| **Operations** | 1 — generate text |

---

**AI Node Shared Limitations (all 7 nodes):**
- Text generation only — no image generation, embeddings, function calling, or streaming
- No conversation history / multi-turn chat (each execution is a fresh call)
- Response length is not configurable in the UI (uses model defaults)
- Errors from the AI provider cause the node to fail with `NonRetriableError`

---

## Execution Nodes — HTTP & Social

### HTTP Request

| Property | Detail |
|---|---|
| **Purpose** | Make arbitrary HTTP requests to any external API |
| **Authentication** | None (credentials can be embedded in headers) |
| **Operations** | 1 — HTTP request |

**Supported Methods:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

**Capabilities:**
- Configurable URL, method, headers, and body
- Response is stored in context under `variableName`
- Supports any REST API that accepts JSON

**Limitations:**
- No OAuth flow built-in — tokens must be manually passed as headers
- No multipart/form-data support
- Request body only supports JSON (not form-encoded or binary)
- No retry logic beyond Inngest's default retry (3 attempts)
- SSL certificate validation is default Node.js behavior

---

### X (Twitter)

| Property | Detail |
|---|---|
| **Purpose** | Post tweets to X (formerly Twitter) |
| **Authentication** | X API v2 credentials (App Key, App Secret, Access Token, Access Token Secret) |
| **Operations** | 1 — post tweet |

**Capabilities:**
- Post text tweets via X API v2
- Template syntax for dynamic tweet content
- Auto-truncation to 280 characters

**Limitations:**
- Only posting — no reading timeline, no DMs, no likes/retweets, no media upload
- X API v2 Basic tier required (free tier has severe rate limits)
- Credentials must be manually obtained from X Developer Portal
- Rate limit: ~17 posts/24h on Basic tier

---

## Workflow Capability Summary

| Capability | Supported? | Notes |
|---|---|---|
| Visual drag-and-drop builder | ✅ | React Flow canvas |
| Sequential execution | ✅ | Default path |
| Parallel branches | ✅ | If/Else, Switch create parallel paths |
| Loop over arrays | ✅ | Loop node |
| Merge parallel results | ✅ | Merge node (5 strategies) |
| Conditional logic | ✅ | If/Else, Switch |
| Time delays / scheduled waits | ✅ | Wait node (duration + event modes) |
| Human-in-the-loop pauses | ✅ | Wait node (event mode with resume URL) |
| Error handling / recovery | ✅ | Error Trigger node |
| Custom code execution | ✅ | Code node (sandboxed JS) |
| Real-time execution status | ✅ | @inngest/realtime pub/sub per node |
| Webhook ingestion | ✅ | Webhook Trigger, Razorpay Trigger, WhatsApp Trigger |
| Cron scheduling | ✅ | Schedule Trigger |
| Payment automation | ✅ | Razorpay (28 ops) + Razorpay Trigger |
| Logistics automation | ✅ | Shiprocket (23 ops, India) |
| AI text generation | ✅ | 7 LLM providers |
| Multi-channel messaging | ✅ | Email, WhatsApp, SMS, Slack, Telegram, Discord |
| Spreadsheet operations | ✅ | Google Sheets (10 ops) |
| File storage | ✅ | Google Drive (4 ops) |
| Database / notes | ✅ | Notion (11 ops) |
| HR / workforce | ✅ | Workday (6 ops) |
| Social posting | ✅ | X/Twitter (post only) |
| Encrypted credentials | ✅ | All API keys stored encrypted |
| Multi-step retries | ✅ | Inngest durable step execution |
| Sub-workflows | ❌ | No nested workflow calling |
| Versioning / rollback | ❌ | No workflow version history |
| A/B testing | ❌ | No built-in split testing |
| Data transformation (visual) | ❌ | Use Code node or Set Variable |
| Custom nodes / plugins | ❌ | No plugin system yet |
| Multi-tenant workspaces | ❌ | Single user per account |
| Workflow sharing/templates | ❌ | No template marketplace |

---

## Platform Limitations

1. **No sub-workflow calling** — Workflows cannot invoke other workflows directly. Error Trigger is the only cross-workflow mechanism.
2. **No version history** — Once a workflow is modified and saved, previous versions cannot be restored.
3. **Single user per account** — No team/org multi-tenancy or role-based access control.
4. **Sandbox restrictions on Code node** — Custom code cannot make HTTP calls or import npm packages.
5. **AI nodes are text-only** — None of the 7 AI nodes support vision, embeddings, function/tool calling, or streaming.
6. **India-centric commerce** — Razorpay and Shiprocket are optimized for Indian markets. International equivalents (Stripe, etc.) have limited support (Stripe Trigger exists but Stripe execution node does not).
7. **No data persistence between workflows** — Shared state must go through an external database (e.g., Notion, Google Sheets) via execution nodes.
8. **Execution context is ephemeral** — Each workflow run starts fresh; no persistent workflow-level storage.
9. **No built-in pagination handling** — Nodes that return paginated results (e.g., Gmail list, Google Sheets read) return the first page; multi-page iteration requires a Loop node.
10. **No visual debugging / step-through** — The UI shows real-time status (loading/success/error) per node but does not support breakpoints or step-through debugging.
11. **Rate limits are not managed** — The platform does not implement automatic rate-limit backoff; API rate limit errors will fail the step and rely on Inngest's retry mechanism.
12. **No conditional error recovery** — The Error Trigger fires for any error; there is no way to catch and recover from specific error types inline.

---

## Real-World Workflow Examples

### E-Commerce Order Fulfillment (India)
```
Razorpay Trigger (payment.captured)
  → Set Variable (extract order details)
  → Shiprocket: CREATE_ORDER
  → Shiprocket: CHECK_SERVICEABILITY
  → If/Else (serviceable?)
    → [Yes] Shiprocket: ASSIGN_COURIER → GENERATE_AWB → REQUEST_PICKUP
            → WhatsApp: SEND_TEMPLATE (order shipped notification)
    → [No]  Razorpay: REFUND_CREATE
            → Gmail: SEND (refund notification)
  → Error Trigger → Slack: MESSAGE_SEND (alert ops team)
```

### Lead Qualification Pipeline
```
Webhook Trigger (CRM lead event)
  → HTTP Request (fetch lead details from CRM API)
  → Anthropic: Generate lead score and summary
  → Switch (lead score)
    → [High] Notion: CREATE_DATABASE_PAGE (hot leads DB) → Slack: MESSAGE_SEND (sales alert)
    → [Medium] Google Sheets: APPEND_ROW (nurture list) → Gmail: SEND (welcome email)
    → [Low] Set Variable (archive reason) → Notion: CREATE_DATABASE_PAGE (cold leads)
  → Merge
```

### Daily Report Generation
```
Schedule Trigger (every day at 9am)
  → Google Sheets: READ_ROWS (yesterday's data)
  → Loop (over rows)
    → Set Variable (format row data)
  → Merge
  → OpenAI: Generate daily summary
  → Gmail: SEND (to stakeholders)
  → Slack: MESSAGE_SEND (summary in #reports)
```

### OTP Verification Flow
```
Webhook Trigger (user registration)
  → MSG91: SEND_OTP
  → Wait (event mode, 10 min timeout)
  → [User calls resume URL with entered OTP]
  → MSG91: VERIFY_OTP
  → If/Else (verified?)
    → [Yes] HTTP Request (activate account in your API)
    → [No]  MSG91: RESEND_OTP → Wait (another 10 min)
```

### Multi-Channel Customer Support Alert
```
Error Trigger (any node fails in main workflow)
  → Set Variable (format error details)
  → Slack: MESSAGE_SEND (#ops-alerts channel)
  → Gmail: SEND (on-call engineer email)
  → Telegram: Send message (mobile push via Telegram bot)
```

### AI-Powered Content Pipeline
```
Schedule Trigger (weekly)
  → HTTP Request (fetch trending topics from API)
  → Loop (over 5 topics)
    → Anthropic: Generate article draft
    → Notion: CREATE_DATABASE_PAGE (content calendar)
    → X (Twitter): Post summary tweet
  → Gmail: SEND (weekly content digest)
```

---

*This document reflects the current state of Nodebase as implemented. Capabilities and limitations may change as the platform evolves.*
