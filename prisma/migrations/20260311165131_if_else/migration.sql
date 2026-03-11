-- CreateEnum
CREATE TYPE "IfElseOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_TRUE', 'IS_FALSE', 'REGEX_MATCH');

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'IF_ELSE';

-- CreateTable
CREATE TABLE "IfElseNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT '',
    "operator" "IfElseOperator" NOT NULL DEFAULT 'EQUALS',
    "value" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IfElseNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IfElseNode_nodeId_key" ON "IfElseNode"("nodeId");

-- CreateIndex
CREATE INDEX "IfElseNode_workflowId_idx" ON "IfElseNode"("workflowId");

-- CreateIndex
CREATE INDEX "IfElseNode_nodeId_idx" ON "IfElseNode"("nodeId");

-- AddForeignKey
ALTER TABLE "IfElseNode" ADD CONSTRAINT "IfElseNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
