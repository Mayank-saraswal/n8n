-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'SORT';

-- AlterTable
ALTER TABLE "RazorpayTrigger" ALTER COLUMN "webhookSecret" DROP NOT NULL,
ALTER COLUMN "webhookSecret" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WhatsAppTrigger" ALTER COLUMN "verifyToken" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SortNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "operation" TEXT NOT NULL DEFAULT 'SORT_ARRAY',
    "sortKeys" TEXT NOT NULL DEFAULT '[]',
    "inputPath" TEXT NOT NULL DEFAULT '',
    "variableName" TEXT NOT NULL DEFAULT 'sort',
    "inPlace" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SortNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SortNode_nodeId_key" ON "SortNode"("nodeId");

-- AddForeignKey
ALTER TABLE "SortNode" ADD CONSTRAINT "SortNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
