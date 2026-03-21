import { encrypt, decrypt } from "@/lib/encryption"

// ─── TODO (future cleanup) ────────────────────────────────────────────────────
// Once all RazorpayTrigger rows have been migrated (webhookSecret IS NULL for
// every row), do the following in a new PR:
//   1. Create a migration: ALTER COLUMN "webhookSecretEncrypted" SET NOT NULL;
//                          DROP COLUMN "webhookSecret";
//   2. Remove the `webhookSecretLegacy` parameter and branch below.
//   3. Remove the console.warn call.
//   4. Delete scripts/migrate-razorpay-secrets.ts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encrypt a webhook secret for storage in `webhookSecretEncrypted`.
 * Always call this before persisting a new or updated secret.
 */
export function encryptWebhookSecret(plaintext: string): string {
  return encrypt(plaintext)
}

/**
 * Decrypt a Razorpay webhook secret for HMAC-SHA256 verification.
 *
 * Supports two formats:
 *   1. New format  — AES-256 ciphertext stored in `webhookSecretEncrypted`
 *   2. Legacy format — plaintext stored in `webhookSecret` (pre-migration rows)
 *
 * Returns the plaintext secret ready for `crypto.createHmac("sha256", secret)`.
 */
export function decryptWebhookSecret(
  webhookSecretEncrypted: string | null | undefined,
  webhookSecretLegacy: string | null | undefined
): string {
  // Prefer the new encrypted field
  if (webhookSecretEncrypted) {
    return decrypt(webhookSecretEncrypted)
  }

  // Fall back to legacy plaintext (present on rows not yet migrated)
  if (webhookSecretLegacy) {
    console.warn(
      "[RazorpayTrigger] Using legacy plaintext webhookSecret — " +
        "run `npm run migrate:razorpay-secrets` to encrypt it."
    )
    return webhookSecretLegacy
  }

  throw new Error(
    "RazorpayTrigger: No webhook secret configured. " +
      "Open trigger settings and enter your Razorpay webhook secret."
  )
}
