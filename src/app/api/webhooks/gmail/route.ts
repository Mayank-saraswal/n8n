import { NextRequest } from "next/server"
import { timingSafeEqual } from "crypto"
import prisma from "@/lib/db"
import { inngest } from "@/inngest/client"
import { getGmailPubsubToken } from "@/lib/env"

export const runtime = "nodejs"

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request: NextRequest) {
  // 1. Verify Pub/Sub verification token
  const token = request.nextUrl.searchParams.get("token") ?? ""
  const expectedToken = getGmailPubsubToken()
  if (!expectedToken || !safeCompare(token, expectedToken)) {
    return new Response("Unauthorized", { status: 401 })
  }

  // 2. Parse body — Google Pub/Sub push format: { message: { data: base64string } }
  let email = ""
  let historyId = ""
  try {
    const body = (await request.json()) as {
      message?: { data?: string }
    }
    const dataStr = body.message?.data
    if (!dataStr) {
      return new Response("Missing message data", { status: 400 })
    }
    const decoded = JSON.parse(
      Buffer.from(dataStr, "base64").toString("utf-8")
    ) as { emailAddress?: string; historyId?: string }
    email = decoded.emailAddress ?? ""
    historyId = decoded.historyId ?? ""
  } catch {
    return new Response("Invalid payload", { status: 400 })
  }

  if (!email) {
    return new Response("Missing emailAddress", { status: 400 })
  }

  // 3. Find active watchers for this email
  const watchers = await prisma.gmailWatcher.findMany({
    where: { email, active: true },
    include: { workflow: { select: { id: true, userId: true } } },
  })

  // 4. Fire Inngest events and update lastHistoryId
  for (const watcher of watchers) {
    await inngest.send({
      name: "gmail/new-email",
      data: {
        workflowId: watcher.workflowId,
        nodeId: watcher.nodeId,
        email,
        historyId,
        lastHistoryId: watcher.lastHistoryId,
      },
    })
    await prisma.gmailWatcher.update({
      where: { id: watcher.id },
      data: { lastHistoryId: historyId },
    })
  }

  return new Response("OK", { status: 200 })
}
