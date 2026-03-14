ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'SWITCH';

CREATE TABLE IF NOT EXISTS "SwitchNode" (
  "id"           TEXT         NOT NULL,
  "nodeId"       TEXT         NOT NULL,
  "workflowId"   TEXT         NOT NULL,
  "variableName" TEXT         NOT NULL DEFAULT 'switch',
  "casesJson"    TEXT         NOT NULL DEFAULT '[]',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SwitchNode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SwitchNode_nodeId_key" ON "SwitchNode"("nodeId");
CREATE INDEX IF NOT EXISTS "SwitchNode_nodeId_idx" ON "SwitchNode"("nodeId");
ALTER TABLE "SwitchNode"
  ADD CONSTRAINT "SwitchNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
