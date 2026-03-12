-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'GOOGLE_SHEETS';

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'GOOGLE_SHEETS';

-- CreateEnum
CREATE TYPE "GoogleSheetsOp" AS ENUM ('APPEND_ROW', 'READ_ROWS');

-- CreateTable
CREATE TABLE "GoogleSheetsNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "operation" "GoogleSheetsOp" NOT NULL DEFAULT 'APPEND_ROW',
    "spreadsheetId" TEXT NOT NULL DEFAULT '',
    "sheetName" TEXT NOT NULL DEFAULT 'Sheet1',
    "range" TEXT NOT NULL DEFAULT 'A:Z',
    "rowData" JSONB NOT NULL DEFAULT '[]',
    "credentialId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetsNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleSheetsNode_nodeId_key" ON "GoogleSheetsNode"("nodeId");

-- CreateIndex
CREATE INDEX "GoogleSheetsNode_workflowId_idx" ON "GoogleSheetsNode"("workflowId");

-- CreateIndex
CREATE INDEX "GoogleSheetsNode_nodeId_idx" ON "GoogleSheetsNode"("nodeId");

-- AddForeignKey
ALTER TABLE "GoogleSheetsNode" ADD CONSTRAINT "GoogleSheetsNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
