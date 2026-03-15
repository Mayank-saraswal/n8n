import { NextRequest, NextResponse } from "next/server"
import { inngest } from "@/inngest/client"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 5) {
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

  const eventName = decodeURIComponent(token)

  await inngest.send({
    name: eventName,
    data: body,
  })

  return NextResponse.json({
    message: "Workflow resumed successfully.",
    event: eventName,
  })
}
