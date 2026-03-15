-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'MERGE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "MergeNode" (
  "id"           TEXT         NOT NULL,
  "nodeId"       TEXT         NOT NULL,
  "workflowId"   TEXT         NOT NULL,
  "inputCount"   INTEGER      NOT NULL DEFAULT 2,
  "mergeMode"    TEXT         NOT NULL DEFAULT 'combine',
  "matchKey1"    TEXT         NOT NULL DEFAULT '',
  "matchKey2"    TEXT         NOT NULL DEFAULT '',
  "positionFill" TEXT         NOT NULL DEFAULT 'shortest',
  "waitForAll"   BOOLEAN      NOT NULL DEFAULT true,
  "variableName" TEXT         NOT NULL DEFAULT 'merge',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MergeNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MergeNode_nodeId_key" ON "MergeNode"("nodeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MergeNode_workflowId_idx" ON "MergeNode"("workflowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MergeNode_nodeId_idx" ON "MergeNode"("nodeId");

-- AddForeignKey
ALTER TABLE "MergeNode"
  ADD CONSTRAINT "MergeNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MergeNode" ADD COLUMN IF NOT EXISTS "branchKey1" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MergeNode" ADD COLUMN IF NOT EXISTS "branchKey2" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MergeNode" ADD COLUMN IF NOT EXISTS "branchKeys" TEXT NOT NULL DEFAULT '';
