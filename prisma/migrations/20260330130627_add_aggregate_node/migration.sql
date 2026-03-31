-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'AGGREGATE';

-- AddRelation (workflow model updated via Prisma generate)

-- CreateTable
CREATE TABLE IF NOT EXISTS "AggregateNode" (
  "id"              TEXT             NOT NULL,
  "nodeId"          TEXT             NOT NULL,
  "workflowId"      TEXT             NOT NULL,
  "operation"       TEXT             NOT NULL DEFAULT 'COUNT',
  "inputPath"       TEXT             NOT NULL DEFAULT '',
  "field"           TEXT             NOT NULL DEFAULT '',
  "groupByField"    TEXT             NOT NULL DEFAULT '',
  "pivotRowField"   TEXT             NOT NULL DEFAULT '',
  "pivotColField"   TEXT             NOT NULL DEFAULT '',
  "pivotValueField" TEXT             NOT NULL DEFAULT '',
  "pivotValueOp"    TEXT             NOT NULL DEFAULT 'SUM',
  "separator"       TEXT             NOT NULL DEFAULT ', ',
  "percentile"      DOUBLE PRECISION NOT NULL DEFAULT 90,
  "countFilter"     TEXT             NOT NULL DEFAULT '',
  "multiOps"        TEXT             NOT NULL DEFAULT '[]',
  "groupAggOps"     TEXT             NOT NULL DEFAULT '[]',
  "variableName"    TEXT             NOT NULL DEFAULT 'aggregate',
  "includeInput"    BOOLEAN          NOT NULL DEFAULT false,
  "sortOutput"      BOOLEAN          NOT NULL DEFAULT true,
  "topN"            INTEGER          NOT NULL DEFAULT 0,
  "nullHandling"    TEXT             NOT NULL DEFAULT 'exclude',
  "roundDecimals"   INTEGER          NOT NULL DEFAULT 2,
  "continueOnFail"  BOOLEAN          NOT NULL DEFAULT false,
  "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "AggregateNode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AggregateNode_nodeId_key" ON "AggregateNode"("nodeId");
CREATE INDEX IF NOT EXISTS "AggregateNode_workflowId_idx" ON "AggregateNode"("workflowId");

ALTER TABLE "AggregateNode"
  ADD CONSTRAINT "AggregateNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
