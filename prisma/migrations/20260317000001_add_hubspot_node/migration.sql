-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'HUBSPOT';
ALTER TYPE "CredentialType" ADD VALUE 'HUBSPOT';

-- CreateEnum
CREATE TYPE "HubspotOperation" AS ENUM (
  'CREATE_CONTACT',
  'GET_CONTACT',
  'UPDATE_CONTACT',
  'DELETE_CONTACT',
  'SEARCH_CONTACTS',
  'GET_CONTACT_PROPERTIES',
  'UPSERT_CONTACT',
  'GET_CONTACT_ASSOCIATIONS',
  'CREATE_COMPANY',
  'GET_COMPANY',
  'UPDATE_COMPANY',
  'DELETE_COMPANY',
  'SEARCH_COMPANIES',
  'CREATE_DEAL',
  'GET_DEAL',
  'UPDATE_DEAL',
  'DELETE_DEAL',
  'SEARCH_DEALS',
  'UPDATE_DEAL_STAGE',
  'CREATE_TICKET',
  'GET_TICKET',
  'UPDATE_TICKET',
  'DELETE_TICKET',
  'SEARCH_TICKETS',
  'CREATE_NOTE',
  'CREATE_TASK',
  'CREATE_CALL',
  'CREATE_EMAIL_LOG',
  'CREATE_ASSOCIATION',
  'DELETE_ASSOCIATION',
  'ADD_CONTACT_TO_LIST',
  'REMOVE_CONTACT_FROM_LIST',
  'GET_LIST_CONTACTS',
  'SEARCH_OBJECTS',
  'GET_PROPERTIES'
);

-- CreateTable
CREATE TABLE "HubspotNode" (
  "id" TEXT NOT NULL,
  "nodeId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "credentialId" TEXT,
  "operation" "HubspotOperation" NOT NULL DEFAULT 'CREATE_CONTACT',
  "variableName" TEXT NOT NULL DEFAULT 'hubspot',
  "objectType" TEXT NOT NULL DEFAULT 'contacts',
  "recordId" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "firstName" TEXT NOT NULL DEFAULT '',
  "lastName" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "website" TEXT NOT NULL DEFAULT '',
  "company" TEXT NOT NULL DEFAULT '',
  "jobTitle" TEXT NOT NULL DEFAULT '',
  "lifecycleStage" TEXT NOT NULL DEFAULT '',
  "leadStatus" TEXT NOT NULL DEFAULT '',
  "companyName" TEXT NOT NULL DEFAULT '',
  "domain" TEXT NOT NULL DEFAULT '',
  "industry" TEXT NOT NULL DEFAULT '',
  "annualRevenue" TEXT NOT NULL DEFAULT '',
  "numberOfEmployees" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "state" TEXT NOT NULL DEFAULT '',
  "country" TEXT NOT NULL DEFAULT 'India',
  "dealName" TEXT NOT NULL DEFAULT '',
  "dealStage" TEXT NOT NULL DEFAULT '',
  "pipeline" TEXT NOT NULL DEFAULT 'default',
  "amount" TEXT NOT NULL DEFAULT '',
  "closeDate" TEXT NOT NULL DEFAULT '',
  "dealType" TEXT NOT NULL DEFAULT '',
  "priority" TEXT NOT NULL DEFAULT '',
  "ticketName" TEXT NOT NULL DEFAULT '',
  "ticketPipeline" TEXT NOT NULL DEFAULT '0',
  "ticketStatus" TEXT NOT NULL DEFAULT '',
  "ticketPriority" TEXT NOT NULL DEFAULT '',
  "ticketDescription" TEXT NOT NULL DEFAULT '',
  "ticketSource" TEXT NOT NULL DEFAULT '',
  "noteBody" TEXT NOT NULL DEFAULT '',
  "taskSubject" TEXT NOT NULL DEFAULT '',
  "taskBody" TEXT NOT NULL DEFAULT '',
  "taskStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "taskPriority" TEXT NOT NULL DEFAULT 'NONE',
  "taskDueDate" TEXT NOT NULL DEFAULT '',
  "callBody" TEXT NOT NULL DEFAULT '',
  "callDuration" TEXT NOT NULL DEFAULT '',
  "callDirection" TEXT NOT NULL DEFAULT 'OUTBOUND',
  "callDisposition" TEXT NOT NULL DEFAULT '',
  "emailSubject" TEXT NOT NULL DEFAULT '',
  "emailBody" TEXT NOT NULL DEFAULT '',
  "emailFrom" TEXT NOT NULL DEFAULT '',
  "emailTo" TEXT NOT NULL DEFAULT '',
  "fromObjectType" TEXT NOT NULL DEFAULT 'contacts',
  "fromObjectId" TEXT NOT NULL DEFAULT '',
  "toObjectType" TEXT NOT NULL DEFAULT 'deals',
  "toObjectId" TEXT NOT NULL DEFAULT '',
  "associationType" TEXT NOT NULL DEFAULT '',
  "listId" TEXT NOT NULL DEFAULT '',
  "searchQuery" TEXT NOT NULL DEFAULT '',
  "filterProperty" TEXT NOT NULL DEFAULT '',
  "filterOperator" TEXT NOT NULL DEFAULT 'EQ',
  "filterValue" TEXT NOT NULL DEFAULT '',
  "sortProperty" TEXT NOT NULL DEFAULT 'createdate',
  "sortDirection" TEXT NOT NULL DEFAULT 'DESCENDING',
  "limit" INTEGER NOT NULL DEFAULT 10,
  "after" TEXT NOT NULL DEFAULT '',
  "customProperties" TEXT NOT NULL DEFAULT '{}',
  "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HubspotNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HubspotNode_nodeId_key" ON "HubspotNode"("nodeId");

-- CreateIndex
CREATE INDEX "HubspotNode_workflowId_idx" ON "HubspotNode"("workflowId");

-- CreateIndex
CREATE INDEX "HubspotNode_nodeId_idx" ON "HubspotNode"("nodeId");

-- AddForeignKey
ALTER TABLE "HubspotNode"
  ADD CONSTRAINT "HubspotNode_credentialId_fkey"
  FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubspotNode"
  ADD CONSTRAINT "HubspotNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
