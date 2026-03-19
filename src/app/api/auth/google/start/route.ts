import { NextRequest, NextResponse } from "next/server"
import { buildGoogleAuthUrl } from "@/lib/google-auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const credentialName = searchParams.get("name") || "My Google Account"
  const credentialType = searchParams.get("type") || "GMAIL"
  const returnUrl = searchParams.get("returnUrl") || "/credentials"

  // Encode state as base64url JSON: { userId, credentialName, credentialType, returnUrl }
  const stateData = {
    userId: session.user.id,
    credentialName,
    credentialType,
    returnUrl,
  }
  const state = Buffer.from(JSON.stringify(stateData)).toString("base64url")

  const authUrl = buildGoogleAuthUrl(state)
  return NextResponse.redirect(authUrl)
}
