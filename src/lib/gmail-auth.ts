import { decrypt } from "@/lib/encryption"
import { NonRetriableError, RetryAfterError } from "inngest"
import { getGoogleGmailClientId, getGoogleGmailClientSecret } from "@/lib/env"

export async function refreshGmailAccessToken(
  credentialValue: string
): Promise<{ token: string; email: string }> {
  const raw = decrypt(credentialValue)
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { refreshToken: raw }
  }

  // Detect deprecated App Password format
  if (
    parsed.appPassword ||
    (!parsed.refreshToken && typeof parsed.email === "string")
  ) {
    throw new NonRetriableError(
      "This Gmail credential uses the deprecated App Password format. " +
        "Go to Settings → Credentials and click Reconnect with OAuth2."
    )
  }

  const refreshToken = parsed.refreshToken as string | undefined
  if (!refreshToken) {
    throw new NonRetriableError(
      "Credential missing refreshToken. Delete and reconnect your Gmail account."
    )
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: getGoogleGmailClientId(),
      client_secret: getGoogleGmailClientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as Record<
      string,
      string
    >

    if (
      (response.status === 400 || response.status === 401) &&
      err.error === "invalid_grant"
    ) {
      throw new NonRetriableError(
        "Gmail authorization revoked. Reconnect your account."
      )
    }

    if (response.status === 429 || response.status >= 500) {
      throw new RetryAfterError("Gmail token refresh failed", "30s")
    }

    throw new NonRetriableError(
      `Gmail: Failed to refresh access token. ` +
        `Error: ${err.error_description ?? response.status}`
    )
  }

  const data = (await response.json()) as { access_token: string }
  if (!data.access_token) {
    throw new NonRetriableError(
      "Gmail: Token refresh succeeded but no access_token returned. " +
        "Re-authenticate your Gmail credential."
    )
  }

  return { token: data.access_token, email: (parsed.email as string) ?? "" }
}
