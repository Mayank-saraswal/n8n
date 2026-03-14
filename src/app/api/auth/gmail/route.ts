import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import crypto from "crypto"
import {
  getGoogleGmailClientId,
  getNextAuthUrl,
} from "@/lib/env"

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ")

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const redirectTo =
    req.nextUrl.searchParams.get("redirectTo") || "/credentials"

  const csrfToken = crypto.randomBytes(32).toString("hex")

  const state = Buffer.from(
    JSON.stringify({ userId, csrfToken, redirectTo })
  )
    .toString("base64url")

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: getGoogleGmailClientId(),
        redirect_uri: `${getNextAuthUrl()}/api/auth/gmail/callback`,
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
        state,
      }).toString()
  )

  response.cookies.set("gmail_oauth_state", csrfToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
