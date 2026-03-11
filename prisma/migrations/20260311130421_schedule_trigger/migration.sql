-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'WEBHOOK_TRIGGER';
ALTER TYPE "NodeType" ADD VALUE 'SCHEDULE_TRIGGER';

-- CreateTable
CREATE TABLE "WebhookTrigger" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "secretToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "httpMethod" "HttpMethod" NOT NULL DEFAULT 'POST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTrigger" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inngestFunctionId" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookTrigger_workflowId_key" ON "WebhookTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookTrigger_webhookId_key" ON "WebhookTrigger"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookTrigger_webhookId_idx" ON "WebhookTrigger"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookTrigger_workflowId_idx" ON "WebhookTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTrigger_workflowId_key" ON "ScheduleTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTrigger_inngestFunctionId_key" ON "ScheduleTrigger"("inngestFunctionId");

-- CreateIndex
CREATE INDEX "ScheduleTrigger_workflowId_idx" ON "ScheduleTrigger"("workflowId");

-- AddForeignKey
ALTER TABLE "WebhookTrigger" ADD CONSTRAINT "WebhookTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTrigger" ADD CONSTRAINT "ScheduleTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
