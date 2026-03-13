-- AlterEnum: Add WHATSAPP to NodeType
ALTER TYPE "NodeType" ADD VALUE 'WHATSAPP';

-- AlterEnum: Add WHATSAPP to CredentialType
ALTER TYPE "CredentialType" ADD VALUE 'WHATSAPP';

-- CreateEnum: WhatsAppOperation
CREATE TYPE "WhatsAppOperation" AS ENUM ('SEND_TEXT', 'SEND_TEMPLATE', 'SEND_IMAGE', 'SEND_DOCUMENT', 'SEND_REACTION');

-- CreateTable: WhatsAppNode
CREATE TABLE "WhatsAppNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "WhatsAppOperation" NOT NULL DEFAULT 'SEND_TEXT',
    "to" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "templateName" TEXT NOT NULL DEFAULT '',
    "templateLang" TEXT NOT NULL DEFAULT 'en_US',
    "templateParams" TEXT NOT NULL DEFAULT '[]',
    "mediaUrl" TEXT NOT NULL DEFAULT '',
    "mediaCaption" TEXT NOT NULL DEFAULT '',
    "reactionEmoji" TEXT NOT NULL DEFAULT '',
    "reactionMsgId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppNode_nodeId_key" ON "WhatsAppNode"("nodeId");

-- CreateIndex
CREATE INDEX "WhatsAppNode_workflowId_idx" ON "WhatsAppNode"("workflowId");

-- CreateIndex
CREATE INDEX "WhatsAppNode_nodeId_idx" ON "WhatsAppNode"("nodeId");

-- AddForeignKey
ALTER TABLE "WhatsAppNode" ADD CONSTRAINT "WhatsAppNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
