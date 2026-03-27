-- AlterEnum: NodeType
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'FILTER';

-- CreateEnum: FilterOperation
DO $$ BEGIN
  CREATE TYPE "FilterOperation" AS ENUM ('FILTER_ARRAY', 'FILTER_OBJECT_KEYS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "FilterNode" (
  "id"              TEXT         NOT NULL,
  "nodeId"          TEXT         NOT NULL,
  "workflowId"      TEXT         NOT NULL,
  "operation"       TEXT         NOT NULL DEFAULT 'FILTER_ARRAY',
  "inputArray"      TEXT         NOT NULL DEFAULT '',
  "inputObject"     TEXT         NOT NULL DEFAULT '',
  "conditionGroups" TEXT         NOT NULL DEFAULT '[]',
  "rootLogic"       TEXT         NOT NULL DEFAULT 'AND',
  "outputMode"      TEXT         NOT NULL DEFAULT 'filtered',
  "variableName"    TEXT         NOT NULL DEFAULT 'filter',
  "stopOnEmpty"     BOOLEAN      NOT NULL DEFAULT false,
  "includeMetadata" BOOLEAN      NOT NULL DEFAULT false,
  "continueOnFail"  BOOLEAN      NOT NULL DEFAULT false,
  "keyFilterMode"   TEXT         NOT NULL DEFAULT 'key_name',
  "keepMatching"    BOOLEAN      NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FilterNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FilterNode_nodeId_key" ON "FilterNode"("nodeId");
CREATE INDEX IF NOT EXISTS "FilterNode_workflowId_idx" ON "FilterNode"("workflowId");
CREATE INDEX IF NOT EXISTS "FilterNode_nodeId_idx" ON "FilterNode"("nodeId");

-- AddForeignKey
ALTER TABLE "FilterNode"
  ADD CONSTRAINT "FilterNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
