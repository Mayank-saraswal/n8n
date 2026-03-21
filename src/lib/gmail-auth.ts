import { decrypt } from "@/lib/encryption"
import { NonRetriableError, RetryAfterError } from "inngest"
import { refreshGoogleAccessToken } from "@/lib/google-auth"
import prisma from "@/lib/db"

/**
 * Refresh a Gmail access token given a credential ID and user ID.
 *
 * Supported formats in the decrypted value:
 *   - New OAuth2: { refreshToken: "1//...", email: "...", clientId: "..." }
 *   - Old OAuth2 Playground: { refresh_token: "1//..." }
 *   - Deprecated App Password: { appPassword: "...", email: "..." }
 */
export async function refreshGmailAccessToken(
  credentialId: string,
  userId: string
): Promise<{ token: string; email: string }> {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new NonRetriableError(
      "Gmail credential not found. Please reconnect in Settings → Credentials."
    )
  }

  if (credential.userId !== userId) {
    throw new NonRetriableError("Unauthorized: credential does not belong to this user")
  }

  const raw = decrypt(credential.value)
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

  const clientId = parsed.clientId as string | undefined

  let accessToken: string
  try {
    accessToken = await refreshGoogleAccessToken(refreshToken, clientId)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("invalid") || msg.includes("revoked")) {
      throw new NonRetriableError(`Gmail authorization revoked. Reconnect your account. Details: ${msg}`)
    }
    if (msg.includes("rate") || msg.includes("quota")) {
      throw new RetryAfterError("Gmail token refresh rate limited", "30s")
    }
    throw new NonRetriableError(`Gmail: Failed to refresh access token. ${msg}`)
  }

  return { token: accessToken, email: (parsed.email as string) ?? "" }
}
