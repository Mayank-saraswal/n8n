-- AI Node Upgrade Migration
-- Additive only: no existing tables are modified

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('OPENAI','ANTHROPIC','GEMINI','GROQ','XAI','DEEPSEEK','PERPLEXITY');

CREATE TYPE "AIOperation" AS ENUM ('CHAT','CHAT_WITH_HISTORY','STRUCTURED_OUTPUT','TOOL_USE','VISION','EMBED','TRANSCRIBE','GENERATE_IMAGE','CLASSIFY');

-- CreateTable
CREATE TABLE "AINode" (
  "id"                  TEXT NOT NULL,
  "nodeId"              TEXT NOT NULL,
  "workflowId"          TEXT NOT NULL,
  "credentialId"        TEXT,
  "provider"            "AIProvider" NOT NULL,
  "operation"           "AIOperation" NOT NULL DEFAULT 'CHAT',
  "variableName"        TEXT NOT NULL DEFAULT 'ai',
  "model"               TEXT NOT NULL DEFAULT '',
  "systemPrompt"        TEXT NOT NULL DEFAULT '',
  "userPrompt"          TEXT NOT NULL DEFAULT '',
  "temperature"         DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  "maxTokens"           INTEGER NOT NULL DEFAULT 1000,
  "topP"                DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "frequencyPenalty"    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "presencePenalty"     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "responseFormat"      TEXT NOT NULL DEFAULT 'text',
  "jsonSchema"          TEXT NOT NULL DEFAULT '',
  "toolsJson"           TEXT NOT NULL DEFAULT '[]',
  "toolChoice"          TEXT NOT NULL DEFAULT 'auto',
  "imageUrl"            TEXT NOT NULL DEFAULT '',
  "imageUrls"           TEXT NOT NULL DEFAULT '[]',
  "imageDetail"         TEXT NOT NULL DEFAULT 'auto',
  "historyKey"          TEXT NOT NULL DEFAULT '',
  "maxHistory"          INTEGER NOT NULL DEFAULT 10,
  "embeddingInput"      TEXT NOT NULL DEFAULT '',
  "audioUrl"            TEXT NOT NULL DEFAULT '',
  "audioLanguage"       TEXT NOT NULL DEFAULT '',
  "transcriptionFormat" TEXT NOT NULL DEFAULT 'text',
  "imagePrompt"         TEXT NOT NULL DEFAULT '',
  "imageSize"           TEXT NOT NULL DEFAULT '1024x1024',
  "imageQuality"        TEXT NOT NULL DEFAULT 'standard',
  "imageStyle"          TEXT NOT NULL DEFAULT 'vivid',
  "imageCount"          INTEGER NOT NULL DEFAULT 1,
  "classifyLabels"      TEXT NOT NULL DEFAULT '',
  "classifyExamples"    TEXT NOT NULL DEFAULT '[]',
  "continueOnFail"      BOOLEAN NOT NULL DEFAULT false,
  "timeout"             INTEGER NOT NULL DEFAULT 60000,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AINode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AINode_nodeId_key" ON "AINode"("nodeId");
CREATE INDEX "AINode_workflowId_idx" ON "AINode"("workflowId");
CREATE INDEX "AINode_nodeId_idx" ON "AINode"("nodeId");

ALTER TABLE "AINode" ADD CONSTRAINT "AINode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
