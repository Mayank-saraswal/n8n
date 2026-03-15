-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'SHIPROCKET';
ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'SHIPROCKET';

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ShiprocketOperation" AS ENUM (
  'CREATE_ORDER','GET_ORDER','CANCEL_ORDER','UPDATE_ORDER',
  'GET_ORDER_TRACKING','CLONE_ORDER','GENERATE_AWB','GET_ORDERS_LIST',
  'TRACK_SHIPMENT','ASSIGN_COURIER','GENERATE_LABEL','GENERATE_MANIFEST',
  'REQUEST_PICKUP','GET_COURIER_LIST','GET_RATE','CHECK_SERVICEABILITY',
  'CREATE_RETURN','GET_RETURN_REASONS','TRACK_RETURN',
  'CREATE_PRODUCT','GET_PRODUCTS',
  'GET_PICKUP_LOCATIONS','CREATE_PICKUP_LOCATION'
);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ShiprocketNode" (
  "id"                   TEXT         NOT NULL,
  "nodeId"               TEXT         NOT NULL,
  "workflowId"           TEXT         NOT NULL,
  "credentialId"         TEXT,
  "operation"            "ShiprocketOperation" NOT NULL DEFAULT 'CREATE_ORDER',
  "variableName"         TEXT         NOT NULL DEFAULT 'shiprocket',
  "orderId"              TEXT         NOT NULL DEFAULT '',
  "orderDate"            TEXT         NOT NULL DEFAULT '',
  "channelId"            TEXT         NOT NULL DEFAULT '',
  "billingName"          TEXT         NOT NULL DEFAULT '',
  "billingAddress"       TEXT         NOT NULL DEFAULT '',
  "billingAddress2"      TEXT         NOT NULL DEFAULT '',
  "billingCity"          TEXT         NOT NULL DEFAULT '',
  "billingState"         TEXT         NOT NULL DEFAULT '',
  "billingCountry"       TEXT         NOT NULL DEFAULT 'India',
  "billingPincode"       TEXT         NOT NULL DEFAULT '',
  "billingEmail"         TEXT         NOT NULL DEFAULT '',
  "billingPhone"         TEXT         NOT NULL DEFAULT '',
  "billingAlternatePhone" TEXT        NOT NULL DEFAULT '',
  "shippingIsBilling"    BOOLEAN      NOT NULL DEFAULT true,
  "shippingName"         TEXT         NOT NULL DEFAULT '',
  "shippingAddress"      TEXT         NOT NULL DEFAULT '',
  "shippingAddress2"     TEXT         NOT NULL DEFAULT '',
  "shippingCity"         TEXT         NOT NULL DEFAULT '',
  "shippingState"        TEXT         NOT NULL DEFAULT '',
  "shippingCountry"      TEXT         NOT NULL DEFAULT 'India',
  "shippingPincode"      TEXT         NOT NULL DEFAULT '',
  "shippingEmail"        TEXT         NOT NULL DEFAULT '',
  "shippingPhone"        TEXT         NOT NULL DEFAULT '',
  "orderItems"           TEXT         NOT NULL DEFAULT '[]',
  "paymentMethod"        TEXT         NOT NULL DEFAULT 'prepaid',
  "subTotal"             TEXT         NOT NULL DEFAULT '',
  "codAmount"            TEXT         NOT NULL DEFAULT '0',
  "length"               TEXT         NOT NULL DEFAULT '',
  "breadth"              TEXT         NOT NULL DEFAULT '',
  "height"               TEXT         NOT NULL DEFAULT '',
  "weight"               TEXT         NOT NULL DEFAULT '',
  "shiprocketOrderId"    TEXT         NOT NULL DEFAULT '',
  "shipmentId"           TEXT         NOT NULL DEFAULT '',
  "awbCode"              TEXT         NOT NULL DEFAULT '',
  "courierId"            TEXT         NOT NULL DEFAULT '',
  "courierName"          TEXT         NOT NULL DEFAULT '',
  "pickupLocation"       TEXT         NOT NULL DEFAULT '',
  "pickupPostcode"       TEXT         NOT NULL DEFAULT '',
  "deliveryPostcode"     TEXT         NOT NULL DEFAULT '',
  "cod"                  TEXT         NOT NULL DEFAULT '0',
  "returnOrderId"        TEXT         NOT NULL DEFAULT '',
  "returnReason"         TEXT         NOT NULL DEFAULT '',
  "returnPickupLocation" TEXT         NOT NULL DEFAULT '',
  "productName"          TEXT         NOT NULL DEFAULT '',
  "productSku"           TEXT         NOT NULL DEFAULT '',
  "productMrp"           TEXT         NOT NULL DEFAULT '',
  "productSellingPrice"  TEXT         NOT NULL DEFAULT '',
  "productWeight"        TEXT         NOT NULL DEFAULT '',
  "productCategory"      TEXT         NOT NULL DEFAULT '',
  "productHsn"           TEXT         NOT NULL DEFAULT '',
  "filterStatus"         TEXT         NOT NULL DEFAULT '',
  "pageNo"               INTEGER      NOT NULL DEFAULT 1,
  "perPage"              INTEGER      NOT NULL DEFAULT 10,
  "warehouseName"        TEXT         NOT NULL DEFAULT '',
  "warehouseEmail"       TEXT         NOT NULL DEFAULT '',
  "warehousePhone"       TEXT         NOT NULL DEFAULT '',
  "warehouseAddress"     TEXT         NOT NULL DEFAULT '',
  "warehouseCity"        TEXT         NOT NULL DEFAULT '',
  "warehouseState"       TEXT         NOT NULL DEFAULT '',
  "warehousePincode"     TEXT         NOT NULL DEFAULT '',
  "warehouseCountry"     TEXT         NOT NULL DEFAULT 'India',
  "cancelReason"         TEXT         NOT NULL DEFAULT '',
  "continueOnFail"       BOOLEAN      NOT NULL DEFAULT false,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShiprocketNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ShiprocketNode_nodeId_key"
  ON "ShiprocketNode"("nodeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ShiprocketNode_workflowId_idx"
  ON "ShiprocketNode"("workflowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ShiprocketNode_nodeId_idx"
  ON "ShiprocketNode"("nodeId");

-- AddForeignKey
ALTER TABLE "ShiprocketNode"
  ADD CONSTRAINT "ShiprocketNode_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "workflow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiprocketNode"
  ADD CONSTRAINT "ShiprocketNode_credentialId_fkey"
  FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
