import { sendWorkflowExecution } from "@/inngest/utils"
import prisma from "@/lib/db"
import { decryptWebhookSecret } from "@/lib/razorpay-secret"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { claimIdempotencyKey, releaseIdempotencyKey } from "@/lib/redis"

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

    // Verify Razorpay HMAC-SHA256 signature if a secret is configured
    const hasSecret = !!(trigger.webhookSecretEncrypted || trigger.webhookSecret)
    if (hasSecret) {
      const secret = decryptWebhookSecret(trigger.webhookSecretEncrypted, trigger.webhookSecret)

      const expectedSignature = crypto
        .createHmac("sha256", secret)
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

    // Extract event fingerprint for deduplication
    const razorpayEventId = request.headers.get("x-razorpay-event-id")
    const eventFingerprint = razorpayEventId ?? 
      crypto.createHash("sha256").update(rawBody).digest("hex").slice(0, 32)
      
    // Claim idempotency key BEFORE proceeding to potentially heavy operations
    const idempotencyKey = `razorpay:${webhookId}:${eventFingerprint}`
    const isFirstDelivery = await claimIdempotencyKey(idempotencyKey, 86400) // 24h TTL
    
    if (!isFirstDelivery) {
      console.log(`[Razorpay] Duplicate event discarded: ${eventFingerprint} for webhook ${webhookId}`)
      return NextResponse.json({ 
        received: true, 
        status: "duplicate_discarded",
        eventId: eventFingerprint
      })
    }



    // Check event filtering — if activeEvents is set, only allow matching events
    const eventType = (body.event as string) ?? ""
    const activeEvents: string[] = JSON.parse(trigger.activeEvents || "[]")

    if (activeEvents.length > 0 && !activeEvents.includes(eventType)) {
      // Event not in the active list — acknowledge but don't execute
      await releaseIdempotencyKey(idempotencyKey)
      return NextResponse.json({ status: "filtered", event: eventType })
    }

    // Extract useful fields from Razorpay payload
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const receivedAt = new Date().toISOString()
    const variableName = trigger.variableName || "razorpayTrigger"

    try {
      await sendWorkflowExecution({
        workflowId: trigger.workflow.id,
        inngestId: idempotencyKey, // Second-layer deduplication in Inngest
        initialData: {
          [variableName]: {
            event: eventType,
            eventId: eventFingerprint,
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
    } catch (err) {
      // Release key if Inngest send fails so we can retry
      await releaseIdempotencyKey(idempotencyKey)
      throw err
    }

    return NextResponse.json({ status: "accepted", receivedAt, eventId: eventFingerprint })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}
