-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'LOOP';

-- CreateTable
CREATE TABLE "LoopNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "inputPath" TEXT NOT NULL DEFAULT 'googleSheets.rows',
    "itemVariable" TEXT NOT NULL DEFAULT 'item',
    "maxIterations" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoopNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoopNode_nodeId_key" ON "LoopNode"("nodeId");

-- CreateIndex
CREATE INDEX "LoopNode_workflowId_idx" ON "LoopNode"("workflowId");

-- CreateIndex
CREATE INDEX "LoopNode_nodeId_idx" ON "LoopNode"("nodeId");

-- AddForeignKey
ALTER TABLE "LoopNode" ADD CONSTRAINT "LoopNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
