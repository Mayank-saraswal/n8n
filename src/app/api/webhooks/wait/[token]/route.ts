import { NextRequest, NextResponse } from "next/server"
import { inngest } from "@/inngest/client"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const eventName = decodeURIComponent(token)

  if (!eventName.startsWith("wait/resume-") || eventName.length < 20) {
    return NextResponse.json(
      { error: "Invalid resume token" },
      { status: 400 }
    )
  }

  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    // No body is fine — webhook resume doesn't require one
  }

  await inngest.send({
    name: eventName,
    data: body,
  })

  return NextResponse.json({
    message: "Workflow resumed successfully.",
    event: eventName,
  })
}
