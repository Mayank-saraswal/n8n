import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import {
  getGoogleGmailClientId,
  getGoogleGmailClientSecret,
  getNextAuthUrl,
} from "@/lib/env"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const stateParam = req.nextUrl.searchParams.get("state")
  const storedCsrf = req.cookies.get("gmail_oauth_state")?.value

  if (!code || !stateParam || !storedCsrf) {
    return NextResponse.json(
      { error: "Missing code, state, or CSRF cookie" },
      { status: 400 }
    )
  }

  // Validate CSRF
  let state: { userId: string; csrfToken: string; redirectTo: string }
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf-8"))
  } catch {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 })
  }

  if (state.csrfToken !== storedCsrf) {
    return NextResponse.json({ error: "CSRF mismatch" }, { status: 403 })
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: getGoogleGmailClientId(),
      client_secret: getGoogleGmailClientSecret(),
      redirect_uri: `${getNextAuthUrl()}/api/auth/gmail/callback`,
      grant_type: "authorization_code",
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    return NextResponse.json(
      { error: "Token exchange failed", details: err },
      { status: 502 }
    )
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string
    refresh_token?: string
    scope?: string
  }

  if (!tokenData.refresh_token) {
    return NextResponse.json(
      {
        error:
          "No refresh token returned. Make sure prompt=consent and access_type=offline.",
      },
      { status: 400 }
    )
  }

  // Fetch user email
  const userInfoRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  )

  let email = ""
  if (userInfoRes.ok) {
    const userInfo = (await userInfoRes.json()) as { email?: string }
    email = userInfo.email ?? ""
  }

  // Store credential
  await prisma.credential.create({
    data: {
      userId: state.userId,
      type: "GMAIL_OAUTH",
      name: `Gmail — ${email || "unknown"}`,
      value: encrypt(
        JSON.stringify({
          refreshToken: tokenData.refresh_token,
          email,
          clientId: getGoogleGmailClientId(),
          scope: tokenData.scope ?? "",
        })
      ),
    },
  })

  // Clear state cookie and redirect
  const redirectUrl = new URL(state.redirectTo || "/credentials", getNextAuthUrl())
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.delete("gmail_oauth_state")
  return response
}
