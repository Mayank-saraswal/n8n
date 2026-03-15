import { sendWorkflowExecution } from "@/inngest/utils"
import prisma from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * GET handler — Meta webhook verification.
 * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge
 * to verify the webhook URL. We must return the challenge as plain text.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  const { webhookId } = await params
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const trigger = await prisma.whatsAppTrigger.findUnique({
    where: { webhookId },
  })

  if (!trigger) {
    return new Response("Not found", { status: 404 })
  }

  if (mode === "subscribe" && token === trigger.verifyToken) {
    // Return ONLY the challenge — not JSON, plain text
    return new Response(challenge, { status: 200 })
  }

  return new Response("Forbidden", { status: 403 })
}

/**
 * POST handler — receive all WhatsApp events from Meta.
 * Always returns 200 to prevent Meta from retrying.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const { webhookId } = await params

    const rawBody = await request.text()

    const trigger = await prisma.whatsAppTrigger.findUnique({
      where: { webhookId },
      include: { workflow: { select: { id: true, userId: true } } },
    })

    if (!trigger || !trigger.isActive) {
      // Always return 200 to WhatsApp — never return error
      // WhatsApp will retry on non-200 responses causing duplicate triggers
      return NextResponse.json({ received: true })
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ received: true })
    }

    // WhatsApp Cloud API sends events wrapped in:
    // { object: "whatsapp_business_account", entry: [...] }
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ received: true })
    }

    const entries = (body.entry as Array<Record<string, unknown>>) ?? []
    const activeEvents: string[] = JSON.parse(trigger.activeEvents || "[]")
    const messageTypes: string[] = JSON.parse(trigger.messageTypes || "[]")

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const receivedAt = new Date().toISOString()
    const variableName = trigger.variableName || "whatsappTrigger"

    for (const entry of entries) {
      const changes =
        (entry.changes as Array<Record<string, unknown>>) ?? []

      for (const change of changes) {
        const field = change.field as string
        const value = change.value as Record<string, unknown> | undefined

        if (!value) continue

        // Filter by activeEvents if configured
        if (activeEvents.length > 0 && !activeEvents.includes(field)) {
          continue
        }

        // Handle "messages" field — incoming messages
        if (field === "messages") {
          const messages =
            (value.messages as Array<Record<string, unknown>>) ?? []
          const contacts =
            (value.contacts as Array<Record<string, unknown>>) ?? []
          const metadata = value.metadata as Record<string, unknown> | undefined

          // Filter by phoneNumberId if configured
          if (
            trigger.phoneNumberId &&
            metadata?.phone_number_id !== trigger.phoneNumberId
          ) {
            continue
          }

          for (const message of messages) {
            const messageType = message.type as string

            // Filter by messageTypes if configured
            if (
              messageTypes.length > 0 &&
              !messageTypes.includes(messageType)
            ) {
              continue
            }

            // Ignore own messages (status messages from bot)
            if (
              trigger.ignoreOwnMessages &&
              (message as Record<string, unknown>).from ===
                metadata?.phone_number_id
            ) {
              continue
            }

            const contact = contacts[0] ?? {}

            await sendWorkflowExecution({
              workflowId: trigger.workflow.id,
              initialData: {
                [variableName]: {
                  eventType: "message",
                  messageType,
                  message,
                  contact,
                  metadata: metadata ?? {},
                  rawEntry: entry,
                  headers,
                  receivedAt,
                },
              },
            })
          }
        }

        // Handle "statuses" within messages field — message status updates
        if (field === "messages") {
          const statuses =
            (value.statuses as Array<Record<string, unknown>>) ?? []
          const metadata = value.metadata as Record<string, unknown> | undefined

          // Filter by phoneNumberId if configured
          if (
            trigger.phoneNumberId &&
            metadata?.phone_number_id !== trigger.phoneNumberId
          ) {
            continue
          }

          if (
            activeEvents.length === 0 ||
            activeEvents.includes("message_status")
          ) {
            for (const status of statuses) {
              await sendWorkflowExecution({
                workflowId: trigger.workflow.id,
                initialData: {
                  [variableName]: {
                    eventType: "message_status",
                    status: status.status,
                    statusDetail: status,
                    metadata: metadata ?? {},
                    rawEntry: entry,
                    headers,
                    receivedAt,
                  },
                },
              })
            }
          }
        }

        // Handle other fields (errors, etc.)
        if (field !== "messages") {
          await sendWorkflowExecution({
            workflowId: trigger.workflow.id,
            initialData: {
              [variableName]: {
                eventType: field,
                value,
                rawEntry: entry,
                headers,
                receivedAt,
              },
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    // Always return 200 to prevent Meta from retrying
    return NextResponse.json({ received: true })
  }
}
