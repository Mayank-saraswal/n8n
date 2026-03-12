-- AlterEnum: Add GOOGLE_DRIVE to NodeType
ALTER TYPE "NodeType" ADD VALUE 'GOOGLE_DRIVE';

-- AlterEnum: Add GOOGLE_DRIVE to CredentialType
ALTER TYPE "CredentialType" ADD VALUE 'GOOGLE_DRIVE';

-- CreateEnum: GoogleDriveOperation
CREATE TYPE "GoogleDriveOperation" AS ENUM ('UPLOAD_FILE', 'DOWNLOAD_FILE', 'LIST_FILES', 'CREATE_FOLDER');

-- CreateTable: GoogleDriveNode
CREATE TABLE "GoogleDriveNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "GoogleDriveOperation" NOT NULL DEFAULT 'UPLOAD_FILE',
    "folderId" TEXT,
    "fileId" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "query" TEXT,
    "maxResults" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleDriveNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveNode_nodeId_key" ON "GoogleDriveNode"("nodeId");

-- CreateIndex
CREATE INDEX "GoogleDriveNode_workflowId_idx" ON "GoogleDriveNode"("workflowId");

-- CreateIndex
CREATE INDEX "GoogleDriveNode_nodeId_idx" ON "GoogleDriveNode"("nodeId");

-- AddForeignKey
ALTER TABLE "GoogleDriveNode" ADD CONSTRAINT "GoogleDriveNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
