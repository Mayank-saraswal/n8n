import { sendWorkflowExecution } from "@/inngest/utils"
import prisma from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const { webhookId } = await params

    if (!webhookId) {
      return NextResponse.json(
        { error: "Missing webhookId" },
        { status: 400 }
      )
    }

    // Read raw body BEFORE parsing — needed for HMAC signature verification
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature") ?? ""

    // Find the trigger config
    const trigger = await prisma.razorpayTrigger.findUnique({
      where: { webhookId },
      include: {
        workflow: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    })

    if (!trigger) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      )
    }

    if (!trigger.isActive) {
      return NextResponse.json({ status: "inactive" }, { status: 200 })
    }

    // Verify Razorpay HMAC-SHA256 signature if secret is configured
    if (trigger.webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", trigger.webhookSecret)
        .update(rawBody)
        .digest("hex")

      // Use timing-safe comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature)
      const expectedBuffer = Buffer.from(expectedSignature)

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    }

    // Parse the Razorpay event payload
    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    // Check event filtering — if activeEvents is set, only allow matching events
    const eventType = (body.event as string) ?? ""
    const activeEvents: string[] = JSON.parse(trigger.activeEvents || "[]")

    if (activeEvents.length > 0 && !activeEvents.includes(eventType)) {
      // Event not in the active list — acknowledge but don't execute
      return NextResponse.json({ status: "filtered", event: eventType })
    }

    // Extract useful fields from Razorpay payload
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const receivedAt = new Date().toISOString()
    const variableName = trigger.variableName || "razorpayTrigger"

    await sendWorkflowExecution({
      workflowId: trigger.workflow.id,
      initialData: {
        [variableName]: {
          event: eventType,
          payload: body.payload ?? {},
          accountId: body.account_id ?? null,
          contains: body.contains ?? [],
          createdAt: body.created_at ?? null,
          rawBody: body,
          headers,
          receivedAt,
        },
      },
    })

    return NextResponse.json({ status: "ok", receivedAt })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}
