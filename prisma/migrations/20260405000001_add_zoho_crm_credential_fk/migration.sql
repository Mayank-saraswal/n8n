-- AddForeignKey
ALTER TABLE "ZohoCrmNode"
  ADD CONSTRAINT "ZohoCrmNode_credentialId_fkey"
  FOREIGN KEY ("credentialId")
  REFERENCES "Credenial"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
