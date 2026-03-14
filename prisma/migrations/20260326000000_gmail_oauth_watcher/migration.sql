-- New credential type
ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'GMAIL_OAUTH';

-- New operation enum values
ALTER TYPE "GmailOperation" ADD VALUE IF NOT EXISTS 'GET_ATTACHMENT';
ALTER TYPE "GmailOperation" ADD VALUE IF NOT EXISTS 'GET_THREAD';
ALTER TYPE "GmailOperation" ADD VALUE IF NOT EXISTS 'LIST_LABELS';
ALTER TYPE "GmailOperation" ADD VALUE IF NOT EXISTS 'CREATE_LABEL';
ALTER TYPE "GmailOperation" ADD VALUE IF NOT EXISTS 'LIST_DRAFTS';
ALTER TYPE "GmailOperation" ADD VALUE IF NOT EXISTS 'SEND_DRAFT';

-- New GmailNode columns
ALTER TABLE "GmailNode" ADD COLUMN IF NOT EXISTS "attachmentId"           TEXT NOT NULL DEFAULT '';
ALTER TABLE "GmailNode" ADD COLUMN IF NOT EXISTS "attachmentOutputFormat" TEXT NOT NULL DEFAULT 'base64';
ALTER TABLE "GmailNode" ADD COLUMN IF NOT EXISTS "removeLabelIds"         TEXT NOT NULL DEFAULT '';
ALTER TABLE "GmailNode" ADD COLUMN IF NOT EXISTS "labelName"              TEXT NOT NULL DEFAULT '';
ALTER TABLE "GmailNode" ADD COLUMN IF NOT EXISTS "draftId"                TEXT NOT NULL DEFAULT '';
ALTER TABLE "GmailNode" ADD COLUMN IF NOT EXISTS "messageIds"             TEXT NOT NULL DEFAULT '';

-- GmailWatcher table
CREATE TABLE IF NOT EXISTS "GmailWatcher" (
  "id"            TEXT NOT NULL,
  "workflowId"    TEXT NOT NULL,
  "nodeId"        TEXT NOT NULL,
  "credentialId"  TEXT NOT NULL,
  "email"         TEXT NOT NULL,
  "active"        BOOLEAN NOT NULL DEFAULT true,
  "lastHistoryId" TEXT NOT NULL DEFAULT '',
  "expiration"    TEXT NOT NULL DEFAULT '',
  "filterQuery"   TEXT NOT NULL DEFAULT '',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GmailWatcher_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GmailWatcher_nodeId_key" ON "GmailWatcher"("nodeId");
CREATE INDEX IF NOT EXISTS "GmailWatcher_email_active_idx" ON "GmailWatcher"("email","active");
ALTER TABLE "GmailWatcher"
  ADD CONSTRAINT "GmailWatcher_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
