-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'WHATSAPP_TRIGGER';

-- CreateTable
CREATE TABLE IF NOT EXISTS "WhatsAppTrigger" (
    "id"                TEXT         NOT NULL,
    "nodeId"            TEXT         NOT NULL,
    "workflowId"        TEXT         NOT NULL,
    "webhookId"         TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "verifyToken"       TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "phoneNumberId"     TEXT         NOT NULL DEFAULT '',
    "activeEvents"      TEXT         NOT NULL DEFAULT '[]',
    "messageTypes"      TEXT         NOT NULL DEFAULT '[]',
    "ignoreOwnMessages" BOOLEAN      NOT NULL DEFAULT true,
    "variableName"      TEXT         NOT NULL DEFAULT 'whatsappTrigger',
    "isActive"          BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppTrigger_nodeId_key" ON "WhatsAppTrigger"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppTrigger_webhookId_key" ON "WhatsAppTrigger"("webhookId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WhatsAppTrigger_workflowId_idx" ON "WhatsAppTrigger"("workflowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WhatsAppTrigger_webhookId_idx" ON "WhatsAppTrigger"("webhookId");

-- AddForeignKey
ALTER TABLE "WhatsAppTrigger"
    ADD CONSTRAINT "WhatsAppTrigger_workflowId_fkey"
    FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
