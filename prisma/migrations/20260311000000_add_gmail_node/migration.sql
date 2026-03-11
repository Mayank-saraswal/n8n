-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'GMAIL';

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'GMAIL';

-- CreateTable
CREATE TABLE "GmailNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "to" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "isHtml" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GmailNode_nodeId_key" ON "GmailNode"("nodeId");

-- CreateIndex
CREATE INDEX "GmailNode_workflowId_idx" ON "GmailNode"("workflowId");

-- CreateIndex
CREATE INDEX "GmailNode_nodeId_idx" ON "GmailNode"("nodeId");

-- AddForeignKey
ALTER TABLE "GmailNode" ADD CONSTRAINT "GmailNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
