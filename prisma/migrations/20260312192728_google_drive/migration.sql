-- DropForeignKey
ALTER TABLE "public"."GoogleDriveNode" DROP CONSTRAINT "GoogleDriveNode_workflowId_fkey";

-- DropIndex
DROP INDEX "public"."GoogleDriveNode_nodeId_idx";

-- DropIndex
DROP INDEX "public"."GoogleDriveNode_workflowId_idx";

-- AddForeignKey
ALTER TABLE "GoogleDriveNode" ADD CONSTRAINT "GoogleDriveNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
