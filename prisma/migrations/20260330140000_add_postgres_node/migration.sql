-- AlterEnum: CredentialType
ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'POSTGRES';

-- AlterEnum: NodeType
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'POSTGRES';

-- CreateTable
CREATE TABLE IF NOT EXISTS "PostgresNode" (
  "id"                    TEXT         NOT NULL,
  "nodeId"                TEXT         NOT NULL,
  "workflowId"            TEXT         NOT NULL,
  "operation"             TEXT         NOT NULL DEFAULT 'EXECUTE_QUERY',
  "credentialId"          TEXT,
  "tableName"             TEXT         NOT NULL DEFAULT '',
  "schemaName"            TEXT         NOT NULL DEFAULT 'public',
  "selectColumns"         TEXT         NOT NULL DEFAULT '[]',
  "whereConditions"       TEXT         NOT NULL DEFAULT '[]',
  "orderBy"               TEXT         NOT NULL DEFAULT '[]',
  "limitRows"             INTEGER      NOT NULL DEFAULT 0,
  "offsetRows"            INTEGER      NOT NULL DEFAULT 0,
  "joins"                 TEXT         NOT NULL DEFAULT '[]',
  "insertData"            TEXT         NOT NULL DEFAULT '',
  "conflictColumns"       TEXT         NOT NULL DEFAULT '[]',
  "updateOnConflict"      TEXT         NOT NULL DEFAULT '[]',
  "updateData"            TEXT         NOT NULL DEFAULT '',
  "insertManyPath"        TEXT         NOT NULL DEFAULT '',
  "insertManyColumns"     TEXT         NOT NULL DEFAULT '[]',
  "query"                 TEXT         NOT NULL DEFAULT '',
  "queryParams"           TEXT         NOT NULL DEFAULT '[]',
  "transactionStatements" TEXT         NOT NULL DEFAULT '[]',
  "functionName"          TEXT         NOT NULL DEFAULT '',
  "functionArgs"          TEXT         NOT NULL DEFAULT '[]',
  "searchColumn"          TEXT         NOT NULL DEFAULT '',
  "searchQuery"           TEXT         NOT NULL DEFAULT '',
  "searchLanguage"        TEXT         NOT NULL DEFAULT 'english',
  "searchLimit"           INTEGER      NOT NULL DEFAULT 10,
  "jsonColumn"            TEXT         NOT NULL DEFAULT '',
  "jsonPath"              TEXT         NOT NULL DEFAULT '',
  "jsonSetColumn"         TEXT         NOT NULL DEFAULT '',
  "jsonSetPath"           TEXT         NOT NULL DEFAULT '',
  "jsonSetValue"          TEXT         NOT NULL DEFAULT '',
  "columnDefinitions"     TEXT         NOT NULL DEFAULT '[]',
  "createTableIfNotExists" BOOLEAN     NOT NULL DEFAULT true,
  "variableName"          TEXT         NOT NULL DEFAULT 'postgres',
  "returnData"            BOOLEAN      NOT NULL DEFAULT true,
  "continueOnFail"        BOOLEAN      NOT NULL DEFAULT false,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PostgresNode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PostgresNode_nodeId_key"
  ON "PostgresNode"("nodeId");
CREATE INDEX IF NOT EXISTS "PostgresNode_workflowId_idx"
  ON "PostgresNode"("workflowId");
CREATE INDEX IF NOT EXISTS "PostgresNode_credentialId_idx"
  ON "PostgresNode"("credentialId");

ALTER TABLE "PostgresNode"
  ADD CONSTRAINT "PostgresNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PostgresNode"
  ADD CONSTRAINT "PostgresNode_credentialId_fkey"
  FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
