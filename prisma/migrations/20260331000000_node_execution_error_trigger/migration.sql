-- NodeExecution table
CREATE TABLE IF NOT EXISTS "NodeExecution" (
  "id"             TEXT         NOT NULL,
  "executionId"    TEXT         NOT NULL,
  "nodeId"         TEXT         NOT NULL,
  "nodeName"       TEXT         NOT NULL DEFAULT '',
  "nodeType"       TEXT         NOT NULL DEFAULT '',
  "status"         TEXT         NOT NULL DEFAULT 'success',
  "inputJson"      TEXT         NOT NULL DEFAULT '',
  "outputJson"     TEXT         NOT NULL DEFAULT '',
  "errorMessage"   TEXT         NOT NULL DEFAULT '',
  "durationMs"     INTEGER      NOT NULL DEFAULT 0,
  "executionOrder" INTEGER      NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NodeExecution_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "NodeExecution_executionId_idx"
  ON "NodeExecution"("executionId");
CREATE INDEX IF NOT EXISTS "NodeExecution_nodeId_idx"
  ON "NodeExecution"("nodeId");
CREATE INDEX IF NOT EXISTS "NodeExecution_executionId_order_idx"
  ON "NodeExecution"("executionId", "executionOrder");
ALTER TABLE "NodeExecution"
  ADD CONSTRAINT "NodeExecution_executionId_fkey"
  FOREIGN KEY ("executionId") REFERENCES "Execution"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ERROR_TRIGGER enum value
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'ERROR_TRIGGER';

-- ErrorTriggerNode table
CREATE TABLE IF NOT EXISTS "ErrorTriggerNode" (
  "id"           TEXT         NOT NULL,
  "nodeId"       TEXT         NOT NULL,
  "workflowId"   TEXT         NOT NULL,
  "variableName" TEXT         NOT NULL DEFAULT 'errorTrigger',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ErrorTriggerNode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ErrorTriggerNode_nodeId_key"
  ON "ErrorTriggerNode"("nodeId");
CREATE INDEX IF NOT EXISTS "ErrorTriggerNode_workflowId_idx"
  ON "ErrorTriggerNode"("workflowId");
ALTER TABLE "ErrorTriggerNode"
  ADD CONSTRAINT "ErrorTriggerNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
