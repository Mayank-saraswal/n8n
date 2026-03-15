-- AlterTable
ALTER TABLE "CodeNode" ADD COLUMN IF NOT EXISTS "variableName" TEXT NOT NULL DEFAULT 'codeOutput';
