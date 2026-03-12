-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'SET_VARIABLE';

-- CreateTable
CREATE TABLE "SetVariableNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "pairs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetVariableNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SetVariableNode_nodeId_key" ON "SetVariableNode"("nodeId");

-- CreateIndex
CREATE INDEX "SetVariableNode_workflowId_idx" ON "SetVariableNode"("workflowId");

-- CreateIndex
CREATE INDEX "SetVariableNode_nodeId_idx" ON "SetVariableNode"("nodeId");

-- AddForeignKey
ALTER TABLE "SetVariableNode" ADD CONSTRAINT "SetVariableNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
