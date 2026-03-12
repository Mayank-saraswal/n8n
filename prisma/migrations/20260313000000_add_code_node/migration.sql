-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'CODE';

-- CreateTable
CREATE TABLE "CodeNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeNode_nodeId_key" ON "CodeNode"("nodeId");

-- CreateIndex
CREATE INDEX "CodeNode_workflowId_idx" ON "CodeNode"("workflowId");

-- CreateIndex
CREATE INDEX "CodeNode_nodeId_idx" ON "CodeNode"("nodeId");

-- AddForeignKey
ALTER TABLE "CodeNode" ADD CONSTRAINT "CodeNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
