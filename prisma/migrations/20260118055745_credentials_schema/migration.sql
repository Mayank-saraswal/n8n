-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('OPENAI', 'ANTHROPIC', 'GEMINI');

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "credentialId" TEXT;

-- CreateTable
CREATE TABLE "Credenial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credenial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Credenial" ADD CONSTRAINT "Credenial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
