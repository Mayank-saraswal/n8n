-- Encrypt webhook secrets migration
-- Adds new encrypted columns alongside the legacy plaintext columns.
-- DO NOT drop the legacy columns yet — the Node.js data-migration scripts
-- (npm run migrate:razorpay-secrets / migrate:whatsapp-tokens) fill them in.
-- After all rows are migrated and verified, do a follow-up migration to:
--   ALTER TABLE "RazorpayTrigger" ALTER COLUMN "webhookSecretEncrypted" SET NOT NULL;
--   ALTER TABLE "RazorpayTrigger" DROP COLUMN "webhookSecret";
--   ALTER TABLE "WhatsAppTrigger" ALTER COLUMN "verifyTokenEncrypted" SET NOT NULL;
--   ALTER TABLE "WhatsAppTrigger" DROP COLUMN "verifyToken";

-- Step 1: RazorpayTrigger — add encrypted column (nullable during migration)
ALTER TABLE "RazorpayTrigger" ADD COLUMN "webhookSecretEncrypted" TEXT;

-- Step 2: WhatsAppTrigger — add encrypted column (nullable during migration)
ALTER TABLE "WhatsAppTrigger" ADD COLUMN "verifyTokenEncrypted" TEXT;
