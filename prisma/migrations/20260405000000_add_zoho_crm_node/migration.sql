-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'ZOHO_CRM';
ALTER TYPE "CredentialType" ADD VALUE 'ZOHO_CRM';

-- CreateEnum
CREATE TYPE "ZohoCrmOperation" AS ENUM (
  'CREATE_LEAD',
  'GET_LEAD',
  'UPDATE_LEAD',
  'DELETE_LEAD',
  'SEARCH_LEADS',
  'CONVERT_LEAD',
  'CREATE_CONTACT',
  'GET_CONTACT',
  'UPDATE_CONTACT',
  'DELETE_CONTACT',
  'SEARCH_CONTACTS',
  'GET_CONTACT_DEALS',
  'CREATE_DEAL',
  'GET_DEAL',
  'UPDATE_DEAL',
  'DELETE_DEAL',
  'SEARCH_DEALS',
  'UPDATE_DEAL_STAGE',
  'CREATE_ACCOUNT',
  'GET_ACCOUNT',
  'UPDATE_ACCOUNT',
  'DELETE_ACCOUNT',
  'SEARCH_ACCOUNTS',
  'CREATE_TASK',
  'CREATE_CALL_LOG',
  'CREATE_MEETING',
  'GET_ACTIVITIES',
  'ADD_NOTE',
  'GET_NOTES',
  'UPSERT_RECORD',
  'SEARCH_RECORDS',
  'GET_FIELDS'
);

-- CreateTable
CREATE TABLE "ZohoCrmNode" (
  "id" TEXT NOT NULL,
  "nodeId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "credentialId" TEXT,
  "operation" "ZohoCrmOperation" NOT NULL DEFAULT 'CREATE_LEAD',
  "variableName" TEXT NOT NULL DEFAULT 'zoho',
  "module" TEXT NOT NULL DEFAULT 'Leads',
  "recordId" TEXT NOT NULL DEFAULT '',
  "firstName" TEXT NOT NULL DEFAULT '',
  "lastName" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "mobile" TEXT NOT NULL DEFAULT '',
  "company" TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL DEFAULT '',
  "website" TEXT NOT NULL DEFAULT '',
  "leadSource" TEXT NOT NULL DEFAULT '',
  "leadStatus" TEXT NOT NULL DEFAULT '',
  "industry" TEXT NOT NULL DEFAULT '',
  "annualRevenue" TEXT NOT NULL DEFAULT '',
  "noOfEmployees" TEXT NOT NULL DEFAULT '',
  "rating" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "street" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "state" TEXT NOT NULL DEFAULT '',
  "country" TEXT NOT NULL DEFAULT 'India',
  "zipCode" TEXT NOT NULL DEFAULT '',
  "dealName" TEXT NOT NULL DEFAULT '',
  "dealStage" TEXT NOT NULL DEFAULT '',
  "dealAmount" TEXT NOT NULL DEFAULT '',
  "closingDate" TEXT NOT NULL DEFAULT '',
  "accountName" TEXT NOT NULL DEFAULT '',
  "contactName" TEXT NOT NULL DEFAULT '',
  "probability" TEXT NOT NULL DEFAULT '',
  "dealType" TEXT NOT NULL DEFAULT '',
  "accountOwner" TEXT NOT NULL DEFAULT '',
  "billingCity" TEXT NOT NULL DEFAULT '',
  "billingState" TEXT NOT NULL DEFAULT '',
  "subject" TEXT NOT NULL DEFAULT '',
  "dueDate" TEXT NOT NULL DEFAULT '',
  "priority" TEXT NOT NULL DEFAULT 'High',
  "status" TEXT NOT NULL DEFAULT 'Not Started',
  "whoId" TEXT NOT NULL DEFAULT '',
  "whatId" TEXT NOT NULL DEFAULT '',
  "whoModule" TEXT NOT NULL DEFAULT 'Contacts',
  "whatModule" TEXT NOT NULL DEFAULT 'Deals',
  "callDuration" TEXT NOT NULL DEFAULT '',
  "callDirection" TEXT NOT NULL DEFAULT 'Outbound',
  "callResult" TEXT NOT NULL DEFAULT '',
  "callStartTime" TEXT NOT NULL DEFAULT '',
  "callDescription" TEXT NOT NULL DEFAULT '',
  "meetingStart" TEXT NOT NULL DEFAULT '',
  "meetingEnd" TEXT NOT NULL DEFAULT '',
  "meetingAgenda" TEXT NOT NULL DEFAULT '',
  "participants" TEXT NOT NULL DEFAULT '[]',
  "noteTitle" TEXT NOT NULL DEFAULT '',
  "noteContent" TEXT NOT NULL DEFAULT '',
  "parentModule" TEXT NOT NULL DEFAULT 'Leads',
  "searchTerm" TEXT NOT NULL DEFAULT '',
  "searchField" TEXT NOT NULL DEFAULT 'Email',
  "criteria" TEXT NOT NULL DEFAULT '',
  "page" INTEGER NOT NULL DEFAULT 1,
  "perPage" INTEGER NOT NULL DEFAULT 10,
  "createDeal" BOOLEAN NOT NULL DEFAULT false,
  "overwrite" BOOLEAN NOT NULL DEFAULT false,
  "customFields" TEXT NOT NULL DEFAULT '{}',
  "duplicateCheckField" TEXT NOT NULL DEFAULT 'Email',
  "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZohoCrmNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZohoCrmNode_nodeId_key" ON "ZohoCrmNode"("nodeId");

-- CreateIndex
CREATE INDEX "ZohoCrmNode_workflowId_idx" ON "ZohoCrmNode"("workflowId");

-- CreateIndex
CREATE INDEX "ZohoCrmNode_nodeId_idx" ON "ZohoCrmNode"("nodeId");

-- AddForeignKey
ALTER TABLE "ZohoCrmNode" ADD CONSTRAINT "ZohoCrmNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
