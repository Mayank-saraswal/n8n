import { encrypt, decrypt } from "@/lib/encryption"

// ─── TODO (future cleanup) ────────────────────────────────────────────────────
// Once all WhatsAppTrigger rows have been migrated (verifyToken IS NULL for
// every row), do the following in a new PR:
//   1. Create a migration: ALTER COLUMN "verifyTokenEncrypted" SET NOT NULL;
//                          DROP COLUMN "verifyToken";
//   2. Remove the `verifyTokenLegacy` parameter and branch below.
//   3. Remove the console.warn call.
//   4. Delete scripts/migrate-whatsapp-tokens.ts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encrypt a WhatsApp verify token for storage in `verifyTokenEncrypted`.
 * Always call this before persisting a new or updated token.
 */
export function encryptVerifyToken(plaintext: string): string {
  return encrypt(plaintext)
}

/**
 * Decrypt a WhatsApp verify token for webhook hub.verify_token comparison.
 *
 * Supports two formats:
 *   1. New format  — AES-256 ciphertext stored in `verifyTokenEncrypted`
 *   2. Legacy format — plaintext stored in `verifyToken` (pre-migration rows)
 *
 * Returns the plaintext token to compare against `hub.verify_token`.
 */
export function decryptVerifyToken(
  verifyTokenEncrypted: string | null | undefined,
  verifyTokenLegacy: string | null | undefined
): string {
  // Prefer the new encrypted field
  if (verifyTokenEncrypted) {
    return decrypt(verifyTokenEncrypted)
  }

  // Fall back to legacy plaintext (present on rows not yet migrated)
  if (verifyTokenLegacy) {
    console.warn(
      "[WhatsAppTrigger] Using legacy plaintext verifyToken — " +
        "run `npm run migrate:whatsapp-tokens` to encrypt it."
    )
    return verifyTokenLegacy
  }

  throw new Error(
    "WhatsAppTrigger: No verify token found. " +
      "This trigger record may be corrupt. Please delete and recreate the node."
  )
}
