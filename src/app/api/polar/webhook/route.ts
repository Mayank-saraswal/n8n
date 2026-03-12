import { NextRequest, NextResponse } from "next/server"
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks"
import prisma from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const webhookHeaders: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    webhookHeaders[key] = value
  })
  const secret = process.env.POLAR_WEBHOOK_SECRET ?? ""

  let event: ReturnType<typeof validateEvent>
  try {
    event = validateEvent(body, webhookHeaders, secret)
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }

  switch (event.type) {
    case "subscription.created":
    case "subscription.updated": {
      const sub = event.data
      const userId = sub.customer?.externalId
      if (!userId) break
      await prisma.user.update({
        where: { id: userId },
        data: { executionCount: 0, executionResetAt: new Date() },
      })
      break
    }
    case "subscription.canceled":
    case "subscription.revoked": {
      // Subscription ended — user goes back to free tier
      // No action needed, the execution gate handles it
      break
    }
  }

  return NextResponse.json({ received: true })
}
