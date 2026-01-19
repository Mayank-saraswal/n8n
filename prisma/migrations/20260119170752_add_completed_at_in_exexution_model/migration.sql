/*
  Warnings:

  - You are about to drop the column `endedAt` on the `Execution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Execution" DROP COLUMN "endedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3);
