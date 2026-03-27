-- CreateEnum
CREATE TYPE "CashfreeOperation" AS ENUM ('CREATE_ORDER', 'GET_ORDER', 'TERMINATE_ORDER', 'PAY_ORDER', 'GET_PAYMENTS_FOR_ORDER', 'GET_PAYMENT_BY_ID', 'CREATE_REFUND', 'GET_REFUND', 'GET_ALL_REFUNDS_FOR_ORDER', 'GET_SETTLEMENTS_FOR_ORDER', 'GET_ALL_SETTLEMENTS', 'GET_SETTLEMENT_RECON', 'CREATE_PAYMENT_LINK', 'GET_PAYMENT_LINK', 'CANCEL_PAYMENT_LINK', 'GET_ORDERS_FOR_LINK', 'CREATE_SUBSCRIPTION_PLAN', 'GET_SUBSCRIPTION_PLAN', 'CREATE_SUBSCRIPTION', 'GET_SUBSCRIPTION', 'MANAGE_SUBSCRIPTION', 'GET_SUBSCRIPTION_PAYMENTS', 'GET_PAYOUT_BALANCE', 'ADD_BENEFICIARY', 'GET_BENEFICIARY', 'REMOVE_BENEFICIARY', 'TRANSFER_TO_BENEFICIARY', 'GET_TRANSFER_STATUS', 'BULK_TRANSFER', 'GET_BATCH_TRANSFER_STATUS', 'VALIDATE_UPI_ID', 'CREATE_UPI_PAYMENT_LINK', 'CREATE_OFFER', 'GET_OFFER', 'VERIFY_WEBHOOK_SIGNATURE');

-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'CASHFREE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'CASHFREE';
ALTER TYPE "NodeType" ADD VALUE 'CASHFREE_TRIGGER';

-- DropEnum
DROP TYPE "FilterOperation";

-- CreateTable
CREATE TABLE "CashfreeNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "CashfreeOperation" NOT NULL DEFAULT 'CREATE_ORDER',
    "variableName" TEXT NOT NULL DEFAULT 'cashfree',
    "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL DEFAULT '',
    "orderAmount" TEXT NOT NULL DEFAULT '',
    "orderCurrency" TEXT NOT NULL DEFAULT 'INR',
    "orderNote" TEXT NOT NULL DEFAULT '',
    "orderMeta" TEXT NOT NULL DEFAULT '{}',
    "customerId" TEXT NOT NULL DEFAULT '',
    "customerEmail" TEXT NOT NULL DEFAULT '',
    "customerPhone" TEXT NOT NULL DEFAULT '',
    "customerName" TEXT NOT NULL DEFAULT '',
    "customerBankAccountNumber" TEXT NOT NULL DEFAULT '',
    "customerBankIfsc" TEXT NOT NULL DEFAULT '',
    "customerBankCode" TEXT NOT NULL DEFAULT '',
    "cfPaymentId" TEXT NOT NULL DEFAULT '',
    "cfOrderId" TEXT NOT NULL DEFAULT '',
    "paymentMethod" TEXT NOT NULL DEFAULT '',
    "refundId" TEXT NOT NULL DEFAULT '',
    "refundAmount" TEXT NOT NULL DEFAULT '',
    "refundNote" TEXT NOT NULL DEFAULT '',
    "refundSpeed" TEXT NOT NULL DEFAULT 'STANDARD',
    "refundSplits" TEXT NOT NULL DEFAULT '[]',
    "settlementId" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "cursor" TEXT NOT NULL DEFAULT '',
    "limit" INTEGER NOT NULL DEFAULT 10,
    "linkId" TEXT NOT NULL DEFAULT '',
    "linkAmount" TEXT NOT NULL DEFAULT '',
    "linkCurrency" TEXT NOT NULL DEFAULT 'INR',
    "linkPurpose" TEXT NOT NULL DEFAULT '',
    "linkDescription" TEXT NOT NULL DEFAULT '',
    "linkExpiryTime" TEXT NOT NULL DEFAULT '',
    "linkNotifyPhone" BOOLEAN NOT NULL DEFAULT true,
    "linkNotifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "linkAutoReminders" BOOLEAN NOT NULL DEFAULT true,
    "linkMinPartialAmount" TEXT NOT NULL DEFAULT '',
    "linkMeta" TEXT NOT NULL DEFAULT '{}',
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "planId" TEXT NOT NULL DEFAULT '',
    "planName" TEXT NOT NULL DEFAULT '',
    "planType" TEXT NOT NULL DEFAULT 'PERIODIC',
    "planIntervalType" TEXT NOT NULL DEFAULT 'MONTH',
    "planIntervals" INTEGER NOT NULL DEFAULT 1,
    "planMaxCycles" INTEGER NOT NULL DEFAULT 0,
    "planMaxAmount" TEXT NOT NULL DEFAULT '',
    "subscriptionFirstChargeTime" TEXT NOT NULL DEFAULT '',
    "subscriptionExpiryTime" TEXT NOT NULL DEFAULT '',
    "subscriptionReturnUrl" TEXT NOT NULL DEFAULT '',
    "subscriptionNotifyUrl" TEXT NOT NULL DEFAULT '',
    "subscriptionAction" TEXT NOT NULL DEFAULT 'PAUSE',
    "beneId" TEXT NOT NULL DEFAULT '',
    "beneName" TEXT NOT NULL DEFAULT '',
    "beneEmail" TEXT NOT NULL DEFAULT '',
    "benePhone" TEXT NOT NULL DEFAULT '',
    "beneBankAccount" TEXT NOT NULL DEFAULT '',
    "beneBankIfsc" TEXT NOT NULL DEFAULT '',
    "beneVpa" TEXT NOT NULL DEFAULT '',
    "beneAddress" TEXT NOT NULL DEFAULT '',
    "beneCity" TEXT NOT NULL DEFAULT '',
    "beneState" TEXT NOT NULL DEFAULT 'India',
    "benePincode" TEXT NOT NULL DEFAULT '',
    "transferId" TEXT NOT NULL DEFAULT '',
    "transferAmount" TEXT NOT NULL DEFAULT '',
    "transferRemarks" TEXT NOT NULL DEFAULT '',
    "transferMode" TEXT NOT NULL DEFAULT 'banktransfer',
    "batchTransferId" TEXT NOT NULL DEFAULT '',
    "batchEntries" TEXT NOT NULL DEFAULT '[]',
    "upiVpa" TEXT NOT NULL DEFAULT '',
    "upiAmount" TEXT NOT NULL DEFAULT '',
    "upiDescription" TEXT NOT NULL DEFAULT '',
    "offerId" TEXT NOT NULL DEFAULT '',
    "offerMeta" TEXT NOT NULL DEFAULT '{}',
    "offerValidations" TEXT NOT NULL DEFAULT '{}',
    "offerDetails" TEXT NOT NULL DEFAULT '{}',
    "webhookSignature" TEXT NOT NULL DEFAULT '',
    "webhookTimestamp" TEXT NOT NULL DEFAULT '',
    "webhookRawBody" TEXT NOT NULL DEFAULT '',
    "webhookThrowOnFail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashfreeNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashfreeNode_nodeId_key" ON "CashfreeNode"("nodeId");

-- CreateIndex
CREATE INDEX "CashfreeNode_workflowId_idx" ON "CashfreeNode"("workflowId");

-- CreateIndex
CREATE INDEX "CashfreeNode_nodeId_idx" ON "CashfreeNode"("nodeId");

-- AddForeignKey
ALTER TABLE "CashfreeNode" ADD CONSTRAINT "CashfreeNode_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashfreeNode" ADD CONSTRAINT "CashfreeNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
