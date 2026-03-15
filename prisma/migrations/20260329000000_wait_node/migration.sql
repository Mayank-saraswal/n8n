-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'WAIT';

-- CreateTable
CREATE TABLE IF NOT EXISTS "WaitNode" (
    "id"                TEXT         NOT NULL,
    "nodeId"            TEXT         NOT NULL,
    "workflowId"        TEXT         NOT NULL,
    "waitMode"          TEXT         NOT NULL DEFAULT 'duration',
    "duration"          INTEGER      NOT NULL DEFAULT 30,
    "durationUnit"      TEXT         NOT NULL DEFAULT 'minutes',
    "untilDatetime"     TEXT         NOT NULL DEFAULT '',
    "timezone"          TEXT         NOT NULL DEFAULT 'UTC',
    "timeoutDuration"   INTEGER      NOT NULL DEFAULT 24,
    "timeoutUnit"       TEXT         NOT NULL DEFAULT 'hours',
    "continueOnTimeout" BOOLEAN      NOT NULL DEFAULT true,
    "variableName"      TEXT         NOT NULL DEFAULT 'wait',
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WaitNode_nodeId_key" ON "WaitNode"("nodeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WaitNode_workflowId_idx" ON "WaitNode"("workflowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WaitNode_nodeId_idx" ON "WaitNode"("nodeId");

-- AddForeignKey
ALTER TABLE "WaitNode"
    ADD CONSTRAINT "WaitNode_workflowId_fkey"
    FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
