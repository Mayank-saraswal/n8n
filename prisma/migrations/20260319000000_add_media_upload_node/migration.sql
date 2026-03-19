-- Add MEDIA_UPLOAD to NodeType enum (idempotent on Postgres 14+)
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'MEDIA_UPLOAD';

-- CreateEnum: MediaUploadSource
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaUploadSource') THEN
    CREATE TYPE "MediaUploadSource" AS ENUM ('URL', 'BASE64', 'GOOGLE_DRIVE');
  END IF;
END
$$;

-- CreateTable: MediaUploadNode
CREATE TABLE IF NOT EXISTS "MediaUploadNode" (
    "id"             TEXT NOT NULL,
    "nodeId"         TEXT NOT NULL,
    "workflowId"     TEXT NOT NULL,
    "source"         "MediaUploadSource" NOT NULL DEFAULT 'URL',
    "inputField"     TEXT NOT NULL DEFAULT '',
    "mimeTypeHint"   TEXT NOT NULL DEFAULT 'image/png',
    "filename"       TEXT NOT NULL DEFAULT '',
    "credentialId"   TEXT,
    "variableName"   TEXT NOT NULL DEFAULT 'media',
    "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaUploadNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MediaUploadNode_nodeId_key" ON "MediaUploadNode"("nodeId");
CREATE INDEX IF NOT EXISTS "MediaUploadNode_workflowId_idx" ON "MediaUploadNode"("workflowId");
CREATE INDEX IF NOT EXISTS "MediaUploadNode_nodeId_idx" ON "MediaUploadNode"("nodeId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MediaUploadNode_workflowId_fkey'
  ) THEN
    ALTER TABLE "MediaUploadNode"
        ADD CONSTRAINT "MediaUploadNode_workflowId_fkey"
        FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
