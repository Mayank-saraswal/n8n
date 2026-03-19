import { encrypt, decrypt } from "@/lib/encryption"
import prisma from "@/lib/db"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

// ── Config resolution (new unified var, falls back to service-specific) ──

export function getGoogleClientId(): string {
  const id =
    process.env.GOOGLE_CLIENT_ID ??
    process.env.GOOGLE_GMAIL_CLIENT_ID ??
    process.env.GOOGLE_SHEETS_CLIENT_ID ??
    process.env.GOOGLE_DRIVE_CLIENT_ID ??
    ""
  if (!id) throw new Error("Google OAuth: GOOGLE_CLIENT_ID env var is not set")
  return id
}

export function getGoogleClientSecret(): string {
  const secret =
    process.env.GOOGLE_CLIENT_SECRET ??
    process.env.GOOGLE_GMAIL_CLIENT_SECRET ??
    process.env.GOOGLE_SHEETS_CLIENT_SECRET ??
    process.env.GOOGLE_DRIVE_CLIENT_SECRET ??
    ""
  if (!secret) throw new Error("Google OAuth: GOOGLE_CLIENT_SECRET env var is not set")
  return secret
}

export function getGoogleRedirectUri(): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.NEXTAUTH_URL ?? "https://nodebase.tech"}/api/auth/google/callback`
  )
}

// ── Scopes — combined for all Google services ────────────────────────────

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ")

// ── Generate OAuth2 authorization URL ────────────────────────────────────

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent", // Always show consent to ensure refresh_token is returned
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// ── Exchange authorization code for tokens ────────────────────────────────

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  id_token?: string
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google token exchange failed: ${err}`)
  }

  const tokens = (await response.json()) as GoogleTokenResponse

  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh_token. " +
        "Make sure 'access_type=offline' and 'prompt=consent' are set. " +
        "If you previously authorized this app, revoke access at " +
        "https://myaccount.google.com/permissions and try again."
    )
  }

  return tokens
}

// ── Refresh access token using stored refresh_token ──────────────────────

export async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  // Try available clients in order: Unified -> Gmail -> Sheets -> Drive
  const clients = [
    { id: process.env.GOOGLE_CLIENT_ID, secret: process.env.GOOGLE_CLIENT_SECRET },
    { id: process.env.GOOGLE_GMAIL_CLIENT_ID, secret: process.env.GOOGLE_GMAIL_CLIENT_SECRET },
    { id: process.env.GOOGLE_SHEETS_CLIENT_ID, secret: process.env.GOOGLE_SHEETS_CLIENT_SECRET },
    { id: process.env.GOOGLE_DRIVE_CLIENT_ID, secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET },
  ].filter((c) => c.id && c.secret)

  // Remove exact duplicates
  const uniqueClients = clients.filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  )

  if (uniqueClients.length === 0) {
    throw new Error("Google OAuth: No client ID / secret configured in environment.")
  }

  let lastError = ""
  let lastStatus = 0

  for (const client of uniqueClients) {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: client.id!,
        client_secret: client.secret!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (response.ok) {
      const data = (await response.json()) as { access_token: string; expires_in: number }
      return data.access_token
    }

    lastStatus = response.status
    lastError = await response.text()

    // If it's a 400/401, it might be the wrong client ID for this specific refresh token.
    // Continue loop to try the next legacy client ID.
  }

  // If all failed, throw error for the last attempt
  if (lastStatus === 400 || lastStatus === 401) {
    throw new Error(
      "Google refresh token is invalid or revoked. " +
        "Please reconnect your Google account in Settings → Credentials."
    )
  }
  throw new Error(`Failed to refresh Google access token: ${lastError}`)
}

// ── Get user info (email, name, picture) ─────────────────────────────────

export async function getGoogleUserInfo(accessToken: string): Promise<{
  email: string
  name: string
  picture: string
  id: string
}> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info")
  }

  return response.json() as Promise<{ email: string; name: string; picture: string; id: string }>
}

// ── Extract refresh token from any credential format ─────────────────────
// Supports new OAuth2 format { refreshToken } and gives clear error for old formats

export function extractRefreshToken(decryptedValue: string): string {
  try {
    const parsed = JSON.parse(decryptedValue) as {
      refreshToken?: string
      refresh_token?: string
      appPassword?: string
    }

    if (parsed.appPassword) {
      throw new Error(
        "This credential uses the old App Password format. " +
          "Please delete it and reconnect your Google account using 'Connect with Google'."
      )
    }

    const rt = parsed.refreshToken ?? parsed.refresh_token
    if (rt) return rt
    throw new Error("No refresh token found in credential")
  } catch (e) {
    if (e instanceof Error && e.message.includes("App Password")) throw e
    if (e instanceof Error && e.message.includes("No refresh token")) throw e
    // Plain string — legacy format
    throw new Error(
      "Invalid credential format. " +
        "Please delete it and reconnect using 'Connect with Google' in Settings → Credentials."
    )
  }
}

// ── Get access token from a Credential record (used in executors) ────────

export async function getAccessTokenFromCredential(
  credentialId: string,
  userId: string
): Promise<string> {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new Error("Google credential not found. Please reconnect in Settings → Credentials.")
  }

  if (credential.userId !== userId) {
    throw new Error("Unauthorized: credential does not belong to this user")
  }

  const decrypted = decrypt(credential.value)
  const refreshToken = extractRefreshToken(decrypted)
  return refreshGoogleAccessToken(refreshToken)
}

// Suppress unused import warning — encrypt is re-exported for convenience
export { encrypt }
