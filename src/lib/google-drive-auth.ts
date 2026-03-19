import { refreshGoogleAccessToken, extractRefreshToken } from "@/lib/google-auth"
import { decrypt } from "@/lib/encryption"
import prisma from "@/lib/db"

/**
 * Get a fresh access token for Google Drive given a credential ID.
 * Supports both new OAuth2 format { refreshToken } and old raw JSON format.
 */
export async function refreshGoogleDriveAccessToken(
  credentialId: string,
  userId: string
): Promise<string> {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new Error(
      "Google Drive credential not found. Please reconnect in Settings → Credentials."
    )
  }

  if (credential.userId !== userId) {
    throw new Error("Unauthorized: credential does not belong to this user")
  }

  const decrypted = decrypt(credential.value)

  // extractRefreshToken handles both { refreshToken: "..." } and { refresh_token: "..." }
  // and gives a clear error for old formats
  const refreshToken = extractRefreshToken(decrypted)
  return refreshGoogleAccessToken(refreshToken)
}
