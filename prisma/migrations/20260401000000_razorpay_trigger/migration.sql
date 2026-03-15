-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'RAZORPAY_TRIGGER';

-- CreateTable
CREATE TABLE IF NOT EXISTS "RazorpayTrigger" (
    "id"            TEXT         NOT NULL,
    "nodeId"        TEXT         NOT NULL,
    "workflowId"    TEXT         NOT NULL,
    "webhookId"     TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "webhookSecret" TEXT         NOT NULL DEFAULT '',
    "activeEvents"  TEXT         NOT NULL DEFAULT '[]',
    "variableName"  TEXT         NOT NULL DEFAULT 'razorpayTrigger',
    "isActive"      BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazorpayTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RazorpayTrigger_nodeId_key" ON "RazorpayTrigger"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RazorpayTrigger_webhookId_key" ON "RazorpayTrigger"("webhookId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RazorpayTrigger_nodeId_idx" ON "RazorpayTrigger"("nodeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RazorpayTrigger_workflowId_idx" ON "RazorpayTrigger"("workflowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RazorpayTrigger_webhookId_idx" ON "RazorpayTrigger"("webhookId");

-- AddForeignKey
ALTER TABLE "RazorpayTrigger"
    ADD CONSTRAINT "RazorpayTrigger_workflowId_fkey"
    FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
