import { decrypt } from "@/lib/encryption"
import { NonRetriableError, RetryAfterError } from "inngest"
import { refreshGoogleAccessToken } from "@/lib/google-auth"

/**
 * Refresh a Gmail access token from a raw credential value string.
 * Keeps the same call signature used in gmail/executor.ts.
 *
 * Supported formats in the decrypted value:
 *   - New OAuth2: { refreshToken: "1//...", email: "..." }
 *   - Old OAuth2 Playground: { refresh_token: "1//..." }
 *   - Deprecated App Password: { appPassword: "...", email: "..." }
 */
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
    (!parsed.refreshToken && !parsed.refresh_token && typeof parsed.email === "string")
  ) {
    throw new NonRetriableError(
      "This Gmail credential uses the deprecated App Password format. " +
        "Go to Settings → Credentials, delete it, and click 'Connect with Google'."
    )
  }

  const refreshToken = (parsed.refreshToken ?? parsed.refresh_token) as string | undefined
  if (!refreshToken) {
    throw new NonRetriableError(
      "Credential missing refreshToken. Delete and reconnect your Gmail account."
    )
  }

  let accessToken: string
  try {
    accessToken = await refreshGoogleAccessToken(refreshToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("invalid") || msg.includes("revoked")) {
      throw new NonRetriableError("Gmail authorization revoked. Reconnect your account.")
    }
    if (msg.includes("rate") || msg.includes("quota")) {
      throw new RetryAfterError("Gmail token refresh rate limited", "30s")
    }
    throw new NonRetriableError(`Gmail: Failed to refresh access token. ${msg}`)
  }

  return { token: accessToken, email: (parsed.email as string) ?? "" }
}
