-- CreateEnum
CREATE TYPE "Msg91Operation" AS ENUM ('SEND_SMS', 'SEND_BULK_SMS', 'SEND_TRANSACTIONAL', 'SCHEDULE_SMS', 'SEND_OTP', 'VERIFY_OTP', 'RESEND_OTP', 'INVALIDATE_OTP', 'SEND_WHATSAPP', 'SEND_WHATSAPP_MEDIA', 'SEND_VOICE_OTP', 'SEND_EMAIL', 'GET_BALANCE', 'GET_REPORT');

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'MSG91';
ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'MSG91';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Msg91Node" (
    "id"               TEXT         NOT NULL,
    "nodeId"           TEXT         NOT NULL,
    "workflowId"       TEXT         NOT NULL,
    "credentialId"     TEXT,
    "operation"        "Msg91Operation" NOT NULL DEFAULT 'SEND_OTP',
    "variableName"     TEXT         NOT NULL DEFAULT 'msg91',
    "mobile"           TEXT         NOT NULL DEFAULT '',
    "senderId"         TEXT         NOT NULL DEFAULT '',
    "flowId"           TEXT         NOT NULL DEFAULT '',
    "smsVariables"     TEXT         NOT NULL DEFAULT '{}',
    "message"          TEXT         NOT NULL DEFAULT '',
    "route"            TEXT         NOT NULL DEFAULT '4',
    "bulkData"         TEXT         NOT NULL DEFAULT '[]',
    "scheduleTime"     TEXT         NOT NULL DEFAULT '',
    "otpTemplateId"    TEXT         NOT NULL DEFAULT '',
    "otpExpiry"        INTEGER      NOT NULL DEFAULT 10,
    "otpLength"        INTEGER      NOT NULL DEFAULT 6,
    "otpValue"         TEXT         NOT NULL DEFAULT '',
    "retryType"        TEXT         NOT NULL DEFAULT 'text',
    "whatsappTemplate" TEXT         NOT NULL DEFAULT '',
    "whatsappLang"     TEXT         NOT NULL DEFAULT 'en',
    "whatsappParams"   TEXT         NOT NULL DEFAULT '[]',
    "integratedNumber" TEXT         NOT NULL DEFAULT '',
    "mediaType"        TEXT         NOT NULL DEFAULT 'image',
    "mediaUrl"         TEXT         NOT NULL DEFAULT '',
    "mediaCaption"     TEXT         NOT NULL DEFAULT '',
    "voiceMessage"     TEXT         NOT NULL DEFAULT '',
    "toEmail"          TEXT         NOT NULL DEFAULT '',
    "subject"          TEXT         NOT NULL DEFAULT '',
    "emailBody"        TEXT         NOT NULL DEFAULT '',
    "fromEmail"        TEXT         NOT NULL DEFAULT '',
    "fromName"         TEXT         NOT NULL DEFAULT '',
    "requestId"        TEXT         NOT NULL DEFAULT '',
    "continueOnFail"   BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Msg91Node_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Msg91Node_nodeId_key" ON "Msg91Node"("nodeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Msg91Node_workflowId_idx" ON "Msg91Node"("workflowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Msg91Node_nodeId_idx" ON "Msg91Node"("nodeId");

-- AddForeignKey
ALTER TABLE "Msg91Node"
    ADD CONSTRAINT "Msg91Node_workflowId_fkey"
    FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
