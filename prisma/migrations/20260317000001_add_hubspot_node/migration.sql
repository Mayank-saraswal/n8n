-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('INITIAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST', 'GOOGLE_FORM_TRIGGER', 'STRIPE_TRIGGER', 'WEBHOOK_TRIGGER', 'SCHEDULE_TRIGGER', 'ANTHROPIC', 'GEMINI', 'OPENAI', 'GROQ', 'XAI', 'DISCORD', 'SLACK', 'DEEPSEEK', 'PERPLEXITY', 'TELEGRAM', 'X', 'WORKDAY', 'IF_ELSE', 'GMAIL', 'SET_VARIABLE', 'GOOGLE_SHEETS', 'GOOGLE_DRIVE', 'CODE', 'WHATSAPP', 'LOOP', 'NOTION', 'RAZORPAY', 'SWITCH', 'WAIT', 'MERGE', 'ERROR_TRIGGER', 'RAZORPAY_TRIGGER', 'WHATSAPP_TRIGGER', 'MSG91', 'SHIPROCKET', 'ZOHO_CRM', 'HUBSPOT');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('OPENAI', 'ANTHROPIC', 'GEMINI', 'DEEPSEEK', 'PERPLEXITY', 'XAI', 'GROQ', 'GMAIL', 'GMAIL_OAUTH', 'GOOGLE_SHEETS', 'GOOGLE_DRIVE', 'WHATSAPP', 'NOTION', 'RAZORPAY', 'SLACK', 'MSG91', 'SHIPROCKET', 'ZOHO_CRM', 'HUBSPOT');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "IfElseOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_TRUE', 'IS_FALSE', 'REGEX_MATCH');

-- CreateEnum
CREATE TYPE "GmailOperation" AS ENUM ('SEND', 'REPLY', 'FORWARD', 'GET_MESSAGE', 'LIST_MESSAGES', 'SEARCH_MESSAGES', 'ADD_LABEL', 'REMOVE_LABEL', 'MARK_READ', 'MARK_UNREAD', 'MOVE_TO_TRASH', 'CREATE_DRAFT', 'GET_ATTACHMENT', 'GET_THREAD', 'LIST_LABELS', 'CREATE_LABEL', 'LIST_DRAFTS', 'SEND_DRAFT');

-- CreateEnum
CREATE TYPE "GoogleSheetsOp" AS ENUM ('APPEND_ROW', 'READ_ROWS', 'UPDATE_ROW', 'UPDATE_ROWS_BY_QUERY', 'DELETE_ROW', 'GET_ROW_BY_NUMBER', 'SEARCH_ROWS', 'CLEAR_RANGE', 'CREATE_SHEET', 'GET_SHEET_INFO');

-- CreateEnum
CREATE TYPE "GoogleDriveOperation" AS ENUM ('UPLOAD_FILE', 'DOWNLOAD_FILE', 'LIST_FILES', 'CREATE_FOLDER');

-- CreateEnum
CREATE TYPE "WhatsAppOperation" AS ENUM ('SEND_TEXT', 'SEND_TEMPLATE', 'SEND_IMAGE', 'SEND_DOCUMENT', 'SEND_REACTION');

-- CreateEnum
CREATE TYPE "NotionOperation" AS ENUM ('QUERY_DATABASE', 'CREATE_DATABASE_PAGE', 'UPDATE_DATABASE_PAGE', 'GET_PAGE', 'ARCHIVE_PAGE', 'APPEND_BLOCK', 'GET_BLOCK_CHILDREN', 'SEARCH', 'GET_DATABASE', 'GET_USER', 'GET_USERS');

-- CreateEnum
CREATE TYPE "RazorpayOperation" AS ENUM ('ORDER_CREATE', 'ORDER_FETCH', 'ORDER_FETCH_PAYMENTS', 'ORDER_LIST', 'PAYMENT_FETCH', 'PAYMENT_CAPTURE', 'PAYMENT_LIST', 'PAYMENT_UPDATE', 'REFUND_CREATE', 'REFUND_FETCH', 'REFUND_LIST', 'CUSTOMER_CREATE', 'CUSTOMER_FETCH', 'CUSTOMER_UPDATE', 'SUBSCRIPTION_CREATE', 'SUBSCRIPTION_FETCH', 'SUBSCRIPTION_CANCEL', 'INVOICE_CREATE', 'INVOICE_FETCH', 'INVOICE_SEND', 'INVOICE_CANCEL', 'PAYMENT_LINK_CREATE', 'PAYMENT_LINK_FETCH', 'PAYMENT_LINK_UPDATE', 'PAYMENT_LINK_CANCEL', 'PAYOUT_CREATE', 'PAYOUT_FETCH', 'VERIFY_PAYMENT_SIGNATURE');

-- CreateEnum
CREATE TYPE "SlackOperation" AS ENUM ('MESSAGE_SEND_WEBHOOK', 'MESSAGE_SEND', 'MESSAGE_UPDATE', 'MESSAGE_DELETE', 'MESSAGE_GET_PERMALINK', 'MESSAGE_SCHEDULE', 'MESSAGE_SEARCH', 'CHANNEL_GET', 'CHANNEL_LIST', 'CHANNEL_CREATE', 'CHANNEL_ARCHIVE', 'CHANNEL_UNARCHIVE', 'CHANNEL_INVITE', 'CHANNEL_KICK', 'CHANNEL_SET_TOPIC', 'CHANNEL_SET_PURPOSE', 'CHANNEL_HISTORY', 'CHANNEL_INFO', 'CHANNEL_RENAME', 'USER_GET', 'USER_GET_BY_EMAIL', 'USER_LIST', 'USER_SET_STATUS', 'USER_INFO', 'USER_GET_PRESENCE', 'REACTION_ADD', 'REACTION_REMOVE', 'REACTION_GET', 'FILE_UPLOAD', 'FILE_GET', 'FILE_DELETE', 'FILE_LIST', 'FILE_INFO', 'CONVERSATION_OPEN');

-- CreateEnum
CREATE TYPE "Msg91Operation" AS ENUM ('SEND_SMS', 'SEND_BULK_SMS', 'SEND_TRANSACTIONAL', 'SCHEDULE_SMS', 'SEND_OTP', 'VERIFY_OTP', 'RESEND_OTP', 'INVALIDATE_OTP', 'SEND_WHATSAPP', 'SEND_WHATSAPP_MEDIA', 'SEND_VOICE_OTP', 'SEND_EMAIL', 'GET_BALANCE', 'GET_REPORT');

-- CreateEnum
CREATE TYPE "HubspotOperation" AS ENUM ('CREATE_CONTACT', 'GET_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT', 'SEARCH_CONTACTS', 'GET_CONTACT_PROPERTIES', 'UPSERT_CONTACT', 'GET_CONTACT_ASSOCIATIONS', 'CREATE_COMPANY', 'GET_COMPANY', 'UPDATE_COMPANY', 'DELETE_COMPANY', 'SEARCH_COMPANIES', 'CREATE_DEAL', 'GET_DEAL', 'UPDATE_DEAL', 'DELETE_DEAL', 'SEARCH_DEALS', 'UPDATE_DEAL_STAGE', 'CREATE_TICKET', 'GET_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET', 'SEARCH_TICKETS', 'CREATE_NOTE', 'CREATE_TASK', 'CREATE_CALL', 'CREATE_EMAIL_LOG', 'CREATE_ASSOCIATION', 'DELETE_ASSOCIATION', 'ADD_CONTACT_TO_LIST', 'REMOVE_CONTACT_FROM_LIST', 'GET_LIST_CONTACTS', 'SEARCH_OBJECTS', 'GET_PROPERTIES');

-- CreateEnum
CREATE TYPE "ShiprocketOperation" AS ENUM ('CREATE_ORDER', 'GET_ORDER', 'CANCEL_ORDER', 'UPDATE_ORDER', 'GET_ORDER_TRACKING', 'CLONE_ORDER', 'GENERATE_AWB', 'GET_ORDERS_LIST', 'TRACK_SHIPMENT', 'ASSIGN_COURIER', 'GENERATE_LABEL', 'GENERATE_MANIFEST', 'REQUEST_PICKUP', 'GET_COURIER_LIST', 'GET_RATE', 'CHECK_SERVICEABILITY', 'CREATE_RETURN', 'GET_RETURN_REASONS', 'TRACK_RETURN', 'CREATE_PRODUCT', 'GET_PRODUCTS', 'GET_PICKUP_LOCATIONS', 'CREATE_PICKUP_LOCATION');

-- CreateEnum
CREATE TYPE "ZohoCrmOperation" AS ENUM ('CREATE_LEAD', 'GET_LEAD', 'UPDATE_LEAD', 'DELETE_LEAD', 'SEARCH_LEADS', 'CONVERT_LEAD', 'CREATE_CONTACT', 'GET_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT', 'SEARCH_CONTACTS', 'GET_CONTACT_DEALS', 'CREATE_DEAL', 'GET_DEAL', 'UPDATE_DEAL', 'DELETE_DEAL', 'SEARCH_DEALS', 'UPDATE_DEAL_STAGE', 'CREATE_ACCOUNT', 'GET_ACCOUNT', 'UPDATE_ACCOUNT', 'DELETE_ACCOUNT', 'SEARCH_ACCOUNTS', 'CREATE_TASK', 'CREATE_CALL_LOG', 'CREATE_MEETING', 'GET_ACTIVITIES', 'ADD_NOTE', 'GET_NOTES', 'UPSERT_RECORD', 'SEARCH_RECORDS', 'GET_FIELDS');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "executionResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookTrigger" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "secretToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "httpMethod" "HttpMethod" NOT NULL DEFAULT 'POST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTrigger" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inngestFunctionId" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTrigger_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "workflowId" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "credentialId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "fromOutput" TEXT NOT NULL DEFAULT 'main',
    "toInput" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "inngestEventId" TEXT NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "errorStack" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeExecution" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL DEFAULT '',
    "nodeType" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'success',
    "inputJson" TEXT NOT NULL DEFAULT '',
    "outputJson" TEXT NOT NULL DEFAULT '',
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "executionOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NodeExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IfElseNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT '',
    "operator" "IfElseOperator" NOT NULL DEFAULT 'EQUALS',
    "value" TEXT NOT NULL DEFAULT '',
    "conditionsJson" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IfElseNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwitchNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "variableName" TEXT NOT NULL DEFAULT 'switch',
    "casesJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwitchNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "operation" "GmailOperation" NOT NULL DEFAULT 'SEND',
    "variableName" TEXT NOT NULL DEFAULT 'gmail',
    "to" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "isHtml" BOOLEAN NOT NULL DEFAULT false,
    "cc" TEXT NOT NULL DEFAULT '',
    "bcc" TEXT NOT NULL DEFAULT '',
    "replyTo" TEXT NOT NULL DEFAULT '',
    "messageId" TEXT NOT NULL DEFAULT '',
    "threadId" TEXT NOT NULL DEFAULT '',
    "searchQuery" TEXT NOT NULL DEFAULT '',
    "maxResults" INTEGER NOT NULL DEFAULT 10,
    "labelIds" TEXT NOT NULL DEFAULT '',
    "includeBody" BOOLEAN NOT NULL DEFAULT true,
    "includeHeaders" BOOLEAN NOT NULL DEFAULT false,
    "pageToken" TEXT NOT NULL DEFAULT '',
    "attachmentData" TEXT NOT NULL DEFAULT '',
    "attachmentName" TEXT NOT NULL DEFAULT '',
    "attachmentMime" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "attachmentId" TEXT NOT NULL DEFAULT '',
    "attachmentOutputFormat" TEXT NOT NULL DEFAULT 'base64',
    "removeLabelIds" TEXT NOT NULL DEFAULT '',
    "labelName" TEXT NOT NULL DEFAULT '',
    "draftId" TEXT NOT NULL DEFAULT '',
    "messageIds" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailWatcher" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastHistoryId" TEXT NOT NULL DEFAULT '',
    "expiration" TEXT NOT NULL DEFAULT '',
    "filterQuery" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailWatcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetVariableNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "pairs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetVariableNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleSheetsNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "operation" "GoogleSheetsOp" NOT NULL DEFAULT 'APPEND_ROW',
    "spreadsheetId" TEXT NOT NULL DEFAULT '',
    "sheetName" TEXT NOT NULL DEFAULT 'Sheet1',
    "range" TEXT NOT NULL DEFAULT 'A:Z',
    "rowData" JSONB NOT NULL DEFAULT '[]',
    "credentialId" TEXT NOT NULL DEFAULT '',
    "variableName" TEXT NOT NULL DEFAULT 'googleSheets',
    "headerRow" BOOLEAN NOT NULL DEFAULT true,
    "rowNumber" TEXT NOT NULL DEFAULT '',
    "rowValues" TEXT NOT NULL DEFAULT '',
    "searchColumn" TEXT NOT NULL DEFAULT '',
    "searchValue" TEXT NOT NULL DEFAULT '',
    "clearRange" TEXT NOT NULL DEFAULT '',
    "newSheetName" TEXT NOT NULL DEFAULT '',
    "valueInputOption" TEXT NOT NULL DEFAULT 'USER_ENTERED',
    "matchColumn" TEXT NOT NULL DEFAULT '',
    "matchValue" TEXT NOT NULL DEFAULT '',
    "updateValues" TEXT NOT NULL DEFAULT '',
    "maxResults" INTEGER NOT NULL DEFAULT 100,
    "includeEmptyRows" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetsNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleDriveNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "GoogleDriveOperation" NOT NULL DEFAULT 'UPLOAD_FILE',
    "folderId" TEXT,
    "fileId" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "query" TEXT,
    "maxResults" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleDriveNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "outputMode" TEXT NOT NULL DEFAULT 'append',
    "timeout" INTEGER NOT NULL DEFAULT 5000,
    "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
    "allowedDomains" TEXT NOT NULL DEFAULT '',
    "variableName" TEXT NOT NULL DEFAULT 'codeOutput',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "WhatsAppOperation" NOT NULL DEFAULT 'SEND_TEXT',
    "to" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "templateName" TEXT NOT NULL DEFAULT '',
    "templateLang" TEXT NOT NULL DEFAULT 'en_US',
    "templateParams" TEXT NOT NULL DEFAULT '[]',
    "mediaUrl" TEXT NOT NULL DEFAULT '',
    "mediaCaption" TEXT NOT NULL DEFAULT '',
    "reactionEmoji" TEXT NOT NULL DEFAULT '',
    "reactionMsgId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoopNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "inputPath" TEXT NOT NULL DEFAULT 'googleSheets.rows',
    "itemVariable" TEXT NOT NULL DEFAULT 'item',
    "maxIterations" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoopNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotionNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "NotionOperation" NOT NULL DEFAULT 'QUERY_DATABASE',
    "databaseId" TEXT NOT NULL DEFAULT '',
    "pageId" TEXT NOT NULL DEFAULT '',
    "blockContent" TEXT NOT NULL DEFAULT '',
    "searchQuery" TEXT NOT NULL DEFAULT '',
    "filterJson" TEXT NOT NULL DEFAULT '{}',
    "sortsJson" TEXT NOT NULL DEFAULT '[]',
    "propertiesJson" TEXT NOT NULL DEFAULT '{}',
    "notionUserId" TEXT NOT NULL DEFAULT '',
    "pageSize" INTEGER NOT NULL DEFAULT 100,
    "startCursor" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotionNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RazorpayNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "RazorpayOperation" NOT NULL DEFAULT 'ORDER_CREATE',
    "variableName" TEXT NOT NULL DEFAULT 'razorpay',
    "amount" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "description" TEXT NOT NULL DEFAULT '',
    "receipt" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "partialPayment" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL DEFAULT '',
    "paymentId" TEXT NOT NULL DEFAULT '',
    "captureAmount" TEXT NOT NULL DEFAULT '',
    "refundAmount" TEXT NOT NULL DEFAULT '',
    "refundSpeed" TEXT NOT NULL DEFAULT 'normal',
    "refundId" TEXT NOT NULL DEFAULT '',
    "customerId" TEXT NOT NULL DEFAULT '',
    "customerName" TEXT NOT NULL DEFAULT '',
    "customerEmail" TEXT NOT NULL DEFAULT '',
    "customerContact" TEXT NOT NULL DEFAULT '',
    "failExisting" BOOLEAN NOT NULL DEFAULT false,
    "planId" TEXT NOT NULL DEFAULT '',
    "totalCount" TEXT NOT NULL DEFAULT '',
    "quantity" TEXT NOT NULL DEFAULT '1',
    "startAt" TEXT NOT NULL DEFAULT '',
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "cancelAtCycleEnd" BOOLEAN NOT NULL DEFAULT false,
    "invoiceType" TEXT NOT NULL DEFAULT 'invoice',
    "lineItems" TEXT NOT NULL DEFAULT '',
    "expireBy" TEXT NOT NULL DEFAULT '',
    "smsNotify" BOOLEAN NOT NULL DEFAULT true,
    "emailNotify" BOOLEAN NOT NULL DEFAULT true,
    "invoiceId" TEXT NOT NULL DEFAULT '',
    "paymentLinkId" TEXT NOT NULL DEFAULT '',
    "referenceId" TEXT NOT NULL DEFAULT '',
    "reminderEnable" BOOLEAN NOT NULL DEFAULT true,
    "callbackUrl" TEXT NOT NULL DEFAULT '',
    "callbackMethod" TEXT NOT NULL DEFAULT '',
    "accountNumber" TEXT NOT NULL DEFAULT '',
    "fundAccountId" TEXT NOT NULL DEFAULT '',
    "payoutMode" TEXT NOT NULL DEFAULT '',
    "payoutPurpose" TEXT NOT NULL DEFAULT 'payout',
    "narration" TEXT NOT NULL DEFAULT '',
    "queueIfLowBalance" BOOLEAN NOT NULL DEFAULT false,
    "payoutId" TEXT NOT NULL DEFAULT '',
    "signature" TEXT NOT NULL DEFAULT '',
    "throwOnInvalid" BOOLEAN NOT NULL DEFAULT true,
    "count" TEXT NOT NULL DEFAULT '',
    "skip" TEXT NOT NULL DEFAULT '',
    "fromDate" TEXT NOT NULL DEFAULT '',
    "toDate" TEXT NOT NULL DEFAULT '',
    "authorized" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazorpayNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "SlackOperation" NOT NULL DEFAULT 'MESSAGE_SEND_WEBHOOK',
    "variableName" TEXT NOT NULL DEFAULT 'slack',
    "channel" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "threadTs" TEXT NOT NULL DEFAULT '',
    "messageTs" TEXT NOT NULL DEFAULT '',
    "searchQuery" TEXT NOT NULL DEFAULT '',
    "channelName" TEXT NOT NULL DEFAULT '',
    "channelTopic" TEXT NOT NULL DEFAULT '',
    "channelPurpose" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL DEFAULT '',
    "emoji" TEXT NOT NULL DEFAULT '',
    "fileComment" TEXT NOT NULL DEFAULT '',
    "webhookUrl" TEXT NOT NULL DEFAULT '',
    "blockKit" TEXT NOT NULL DEFAULT '',
    "botName" TEXT NOT NULL DEFAULT '',
    "iconEmoji" TEXT NOT NULL DEFAULT '',
    "unfurlLinks" BOOLEAN NOT NULL DEFAULT true,
    "channelTypes" TEXT NOT NULL DEFAULT 'public_channel,private_channel',
    "limit" INTEGER NOT NULL DEFAULT 100,
    "excludeArchived" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "filename" TEXT NOT NULL DEFAULT '',
    "fileType" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "initialComment" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "statusText" TEXT NOT NULL DEFAULT '',
    "statusEmoji" TEXT NOT NULL DEFAULT '',
    "statusExpiration" TEXT NOT NULL DEFAULT '',
    "sendAt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "fileId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "waitMode" TEXT NOT NULL DEFAULT 'duration',
    "duration" INTEGER NOT NULL DEFAULT 30,
    "durationUnit" TEXT NOT NULL DEFAULT 'minutes',
    "untilDatetime" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "timeoutDuration" INTEGER NOT NULL DEFAULT 24,
    "timeoutUnit" TEXT NOT NULL DEFAULT 'hours',
    "continueOnTimeout" BOOLEAN NOT NULL DEFAULT true,
    "variableName" TEXT NOT NULL DEFAULT 'wait',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MergeNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "inputCount" INTEGER NOT NULL DEFAULT 2,
    "mergeMode" TEXT NOT NULL DEFAULT 'combine',
    "matchKey1" TEXT NOT NULL DEFAULT '',
    "matchKey2" TEXT NOT NULL DEFAULT '',
    "positionFill" TEXT NOT NULL DEFAULT 'shortest',
    "branchKey1" TEXT NOT NULL DEFAULT '',
    "branchKey2" TEXT NOT NULL DEFAULT '',
    "branchKeys" TEXT NOT NULL DEFAULT '',
    "waitForAll" BOOLEAN NOT NULL DEFAULT true,
    "variableName" TEXT NOT NULL DEFAULT 'merge',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MergeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorTriggerNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "variableName" TEXT NOT NULL DEFAULT 'errorTrigger',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorTriggerNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RazorpayTrigger" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL DEFAULT '',
    "activeEvents" TEXT NOT NULL DEFAULT '[]',
    "variableName" TEXT NOT NULL DEFAULT 'razorpayTrigger',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazorpayTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppTrigger" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "verifyToken" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL DEFAULT '',
    "activeEvents" TEXT NOT NULL DEFAULT '[]',
    "messageTypes" TEXT NOT NULL DEFAULT '[]',
    "ignoreOwnMessages" BOOLEAN NOT NULL DEFAULT true,
    "variableName" TEXT NOT NULL DEFAULT 'whatsappTrigger',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Msg91Node" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "Msg91Operation" NOT NULL DEFAULT 'SEND_OTP',
    "variableName" TEXT NOT NULL DEFAULT 'msg91',
    "mobile" TEXT NOT NULL DEFAULT '',
    "senderId" TEXT NOT NULL DEFAULT '',
    "flowId" TEXT NOT NULL DEFAULT '',
    "smsVariables" TEXT NOT NULL DEFAULT '{}',
    "message" TEXT NOT NULL DEFAULT '',
    "route" TEXT NOT NULL DEFAULT '4',
    "bulkData" TEXT NOT NULL DEFAULT '[]',
    "scheduleTime" TEXT NOT NULL DEFAULT '',
    "otpTemplateId" TEXT NOT NULL DEFAULT '',
    "otpExpiry" INTEGER NOT NULL DEFAULT 10,
    "otpLength" INTEGER NOT NULL DEFAULT 6,
    "otpValue" TEXT NOT NULL DEFAULT '',
    "retryType" TEXT NOT NULL DEFAULT 'text',
    "whatsappTemplate" TEXT NOT NULL DEFAULT '',
    "whatsappLang" TEXT NOT NULL DEFAULT 'en',
    "whatsappParams" TEXT NOT NULL DEFAULT '[]',
    "integratedNumber" TEXT NOT NULL DEFAULT '',
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaUrl" TEXT NOT NULL DEFAULT '',
    "mediaCaption" TEXT NOT NULL DEFAULT '',
    "voiceMessage" TEXT NOT NULL DEFAULT '',
    "toEmail" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "emailBody" TEXT NOT NULL DEFAULT '',
    "fromEmail" TEXT NOT NULL DEFAULT '',
    "fromName" TEXT NOT NULL DEFAULT '',
    "requestId" TEXT NOT NULL DEFAULT '',
    "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Msg91Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiprocketNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "credentialId" TEXT,
    "operation" "ShiprocketOperation" NOT NULL DEFAULT 'CREATE_ORDER',
    "variableName" TEXT NOT NULL DEFAULT 'shiprocket',
    "orderId" TEXT NOT NULL DEFAULT '',
    "orderDate" TEXT NOT NULL DEFAULT '',
    "channelId" TEXT NOT NULL DEFAULT '',
    "billingName" TEXT NOT NULL DEFAULT '',
    "billingAddress" TEXT NOT NULL DEFAULT '',
    "billingAddress2" TEXT NOT NULL DEFAULT '',
    "billingCity" TEXT NOT NULL DEFAULT '',
    "billingState" TEXT NOT NULL DEFAULT '',
    "billingCountry" TEXT NOT NULL DEFAULT 'India',
    "billingPincode" TEXT NOT NULL DEFAULT '',
    "billingEmail" TEXT NOT NULL DEFAULT '',
    "billingPhone" TEXT NOT NULL DEFAULT '',
    "billingAlternatePhone" TEXT NOT NULL DEFAULT '',
    "shippingIsBilling" BOOLEAN NOT NULL DEFAULT true,
    "shippingName" TEXT NOT NULL DEFAULT '',
    "shippingAddress" TEXT NOT NULL DEFAULT '',
    "shippingAddress2" TEXT NOT NULL DEFAULT '',
    "shippingCity" TEXT NOT NULL DEFAULT '',
    "shippingState" TEXT NOT NULL DEFAULT '',
    "shippingCountry" TEXT NOT NULL DEFAULT 'India',
    "shippingPincode" TEXT NOT NULL DEFAULT '',
    "shippingEmail" TEXT NOT NULL DEFAULT '',
    "shippingPhone" TEXT NOT NULL DEFAULT '',
    "orderItems" TEXT NOT NULL DEFAULT '[]',
    "paymentMethod" TEXT NOT NULL DEFAULT 'prepaid',
    "subTotal" TEXT NOT NULL DEFAULT '',
    "codAmount" TEXT NOT NULL DEFAULT '0',
    "length" TEXT NOT NULL DEFAULT '',
    "breadth" TEXT NOT NULL DEFAULT '',
    "height" TEXT NOT NULL DEFAULT '',
    "weight" TEXT NOT NULL DEFAULT '',
    "shiprocketOrderId" TEXT NOT NULL DEFAULT '',
    "shipmentId" TEXT NOT NULL DEFAULT '',
    "awbCode" TEXT NOT NULL DEFAULT '',
    "courierId" TEXT NOT NULL DEFAULT '',
    "courierName" TEXT NOT NULL DEFAULT '',
    "pickupLocation" TEXT NOT NULL DEFAULT '',
    "pickupPostcode" TEXT NOT NULL DEFAULT '',
    "deliveryPostcode" TEXT NOT NULL DEFAULT '',
    "cod" TEXT NOT NULL DEFAULT '0',
    "returnOrderId" TEXT NOT NULL DEFAULT '',
    "returnReason" TEXT NOT NULL DEFAULT '',
    "returnPickupLocation" TEXT NOT NULL DEFAULT '',
    "productName" TEXT NOT NULL DEFAULT '',
    "productSku" TEXT NOT NULL DEFAULT '',
    "productMrp" TEXT NOT NULL DEFAULT '',
    "productSellingPrice" TEXT NOT NULL DEFAULT '',
    "productWeight" TEXT NOT NULL DEFAULT '',
    "productCategory" TEXT NOT NULL DEFAULT '',
    "productHsn" TEXT NOT NULL DEFAULT '',
    "filterStatus" TEXT NOT NULL DEFAULT '',
    "pageNo" INTEGER NOT NULL DEFAULT 1,
    "perPage" INTEGER NOT NULL DEFAULT 10,
    "warehouseName" TEXT NOT NULL DEFAULT '',
    "warehouseEmail" TEXT NOT NULL DEFAULT '',
    "warehousePhone" TEXT NOT NULL DEFAULT '',
    "warehouseAddress" TEXT NOT NULL DEFAULT '',
    "warehouseCity" TEXT NOT NULL DEFAULT '',
    "warehouseState" TEXT NOT NULL DEFAULT '',
    "warehousePincode" TEXT NOT NULL DEFAULT '',
    "warehouseCountry" TEXT NOT NULL DEFAULT 'India',
    "cancelReason" TEXT NOT NULL DEFAULT '',
    "continueOnFail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiprocketNode_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookTrigger_workflowId_key" ON "WebhookTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookTrigger_webhookId_key" ON "WebhookTrigger"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookTrigger_webhookId_idx" ON "WebhookTrigger"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookTrigger_workflowId_idx" ON "WebhookTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTrigger_workflowId_key" ON "ScheduleTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTrigger_inngestFunctionId_key" ON "ScheduleTrigger"("inngestFunctionId");

-- CreateIndex
CREATE INDEX "ScheduleTrigger_workflowId_idx" ON "ScheduleTrigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_fromNodeId_toNodeId_fromOutput_toInput_key" ON "Connection"("fromNodeId", "toNodeId", "fromOutput", "toInput");

-- CreateIndex
CREATE UNIQUE INDEX "Execution_inngestEventId_key" ON "Execution"("inngestEventId");

-- CreateIndex
CREATE INDEX "NodeExecution_executionId_idx" ON "NodeExecution"("executionId");

-- CreateIndex
CREATE INDEX "NodeExecution_nodeId_idx" ON "NodeExecution"("nodeId");

-- CreateIndex
CREATE INDEX "NodeExecution_executionId_executionOrder_idx" ON "NodeExecution"("executionId", "executionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "IfElseNode_nodeId_key" ON "IfElseNode"("nodeId");

-- CreateIndex
CREATE INDEX "IfElseNode_workflowId_idx" ON "IfElseNode"("workflowId");

-- CreateIndex
CREATE INDEX "IfElseNode_nodeId_idx" ON "IfElseNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "SwitchNode_nodeId_key" ON "SwitchNode"("nodeId");

-- CreateIndex
CREATE INDEX "SwitchNode_nodeId_idx" ON "SwitchNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "GmailNode_nodeId_key" ON "GmailNode"("nodeId");

-- CreateIndex
CREATE INDEX "GmailNode_workflowId_idx" ON "GmailNode"("workflowId");

-- CreateIndex
CREATE INDEX "GmailNode_nodeId_idx" ON "GmailNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "GmailWatcher_nodeId_key" ON "GmailWatcher"("nodeId");

-- CreateIndex
CREATE INDEX "GmailWatcher_email_active_idx" ON "GmailWatcher"("email", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SetVariableNode_nodeId_key" ON "SetVariableNode"("nodeId");

-- CreateIndex
CREATE INDEX "SetVariableNode_workflowId_idx" ON "SetVariableNode"("workflowId");

-- CreateIndex
CREATE INDEX "SetVariableNode_nodeId_idx" ON "SetVariableNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleSheetsNode_nodeId_key" ON "GoogleSheetsNode"("nodeId");

-- CreateIndex
CREATE INDEX "GoogleSheetsNode_workflowId_idx" ON "GoogleSheetsNode"("workflowId");

-- CreateIndex
CREATE INDEX "GoogleSheetsNode_nodeId_idx" ON "GoogleSheetsNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveNode_nodeId_key" ON "GoogleDriveNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeNode_nodeId_key" ON "CodeNode"("nodeId");

-- CreateIndex
CREATE INDEX "CodeNode_workflowId_idx" ON "CodeNode"("workflowId");

-- CreateIndex
CREATE INDEX "CodeNode_nodeId_idx" ON "CodeNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppNode_nodeId_key" ON "WhatsAppNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "LoopNode_nodeId_key" ON "LoopNode"("nodeId");

-- CreateIndex
CREATE INDEX "LoopNode_workflowId_idx" ON "LoopNode"("workflowId");

-- CreateIndex
CREATE INDEX "LoopNode_nodeId_idx" ON "LoopNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "NotionNode_nodeId_key" ON "NotionNode"("nodeId");

-- CreateIndex
CREATE INDEX "NotionNode_workflowId_idx" ON "NotionNode"("workflowId");

-- CreateIndex
CREATE INDEX "NotionNode_nodeId_idx" ON "NotionNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayNode_nodeId_key" ON "RazorpayNode"("nodeId");

-- CreateIndex
CREATE INDEX "RazorpayNode_workflowId_idx" ON "RazorpayNode"("workflowId");

-- CreateIndex
CREATE INDEX "RazorpayNode_nodeId_idx" ON "RazorpayNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackNode_nodeId_key" ON "SlackNode"("nodeId");

-- CreateIndex
CREATE INDEX "SlackNode_workflowId_idx" ON "SlackNode"("workflowId");

-- CreateIndex
CREATE INDEX "SlackNode_nodeId_idx" ON "SlackNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitNode_nodeId_key" ON "WaitNode"("nodeId");

-- CreateIndex
CREATE INDEX "WaitNode_workflowId_idx" ON "WaitNode"("workflowId");

-- CreateIndex
CREATE INDEX "WaitNode_nodeId_idx" ON "WaitNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "MergeNode_nodeId_key" ON "MergeNode"("nodeId");

-- CreateIndex
CREATE INDEX "MergeNode_workflowId_idx" ON "MergeNode"("workflowId");

-- CreateIndex
CREATE INDEX "MergeNode_nodeId_idx" ON "MergeNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorTriggerNode_nodeId_key" ON "ErrorTriggerNode"("nodeId");

-- CreateIndex
CREATE INDEX "ErrorTriggerNode_nodeId_idx" ON "ErrorTriggerNode"("nodeId");

-- CreateIndex
CREATE INDEX "ErrorTriggerNode_workflowId_idx" ON "ErrorTriggerNode"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayTrigger_nodeId_key" ON "RazorpayTrigger"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayTrigger_webhookId_key" ON "RazorpayTrigger"("webhookId");

-- CreateIndex
CREATE INDEX "RazorpayTrigger_nodeId_idx" ON "RazorpayTrigger"("nodeId");

-- CreateIndex
CREATE INDEX "RazorpayTrigger_workflowId_idx" ON "RazorpayTrigger"("workflowId");

-- CreateIndex
CREATE INDEX "RazorpayTrigger_webhookId_idx" ON "RazorpayTrigger"("webhookId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppTrigger_nodeId_key" ON "WhatsAppTrigger"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppTrigger_webhookId_key" ON "WhatsAppTrigger"("webhookId");

-- CreateIndex
CREATE INDEX "WhatsAppTrigger_nodeId_idx" ON "WhatsAppTrigger"("nodeId");

-- CreateIndex
CREATE INDEX "WhatsAppTrigger_workflowId_idx" ON "WhatsAppTrigger"("workflowId");

-- CreateIndex
CREATE INDEX "WhatsAppTrigger_webhookId_idx" ON "WhatsAppTrigger"("webhookId");

-- CreateIndex
CREATE UNIQUE INDEX "Msg91Node_nodeId_key" ON "Msg91Node"("nodeId");

-- CreateIndex
CREATE INDEX "Msg91Node_workflowId_idx" ON "Msg91Node"("workflowId");

-- CreateIndex
CREATE INDEX "Msg91Node_nodeId_idx" ON "Msg91Node"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiprocketNode_nodeId_key" ON "ShiprocketNode"("nodeId");

-- CreateIndex
CREATE INDEX "ShiprocketNode_workflowId_idx" ON "ShiprocketNode"("workflowId");

-- CreateIndex
CREATE INDEX "ShiprocketNode_nodeId_idx" ON "ShiprocketNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "ZohoCrmNode_nodeId_key" ON "ZohoCrmNode"("nodeId");

-- CreateIndex
CREATE INDEX "ZohoCrmNode_workflowId_idx" ON "ZohoCrmNode"("workflowId");

-- CreateIndex
CREATE INDEX "ZohoCrmNode_nodeId_idx" ON "ZohoCrmNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "HubspotNode_nodeId_key" ON "HubspotNode"("nodeId");

-- CreateIndex
CREATE INDEX "HubspotNode_workflowId_idx" ON "HubspotNode"("workflowId");

-- CreateIndex
CREATE INDEX "HubspotNode_nodeId_idx" ON "HubspotNode"("nodeId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookTrigger" ADD CONSTRAINT "WebhookTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTrigger" ADD CONSTRAINT "ScheduleTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credenial" ADD CONSTRAINT "Credenial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeExecution" ADD CONSTRAINT "NodeExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IfElseNode" ADD CONSTRAINT "IfElseNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwitchNode" ADD CONSTRAINT "SwitchNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmailNode" ADD CONSTRAINT "GmailNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmailWatcher" ADD CONSTRAINT "GmailWatcher_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetVariableNode" ADD CONSTRAINT "SetVariableNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSheetsNode" ADD CONSTRAINT "GoogleSheetsNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleDriveNode" ADD CONSTRAINT "GoogleDriveNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeNode" ADD CONSTRAINT "CodeNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppNode" ADD CONSTRAINT "WhatsAppNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoopNode" ADD CONSTRAINT "LoopNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotionNode" ADD CONSTRAINT "NotionNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RazorpayNode" ADD CONSTRAINT "RazorpayNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackNode" ADD CONSTRAINT "SlackNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitNode" ADD CONSTRAINT "WaitNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeNode" ADD CONSTRAINT "MergeNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorTriggerNode" ADD CONSTRAINT "ErrorTriggerNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RazorpayTrigger" ADD CONSTRAINT "RazorpayTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTrigger" ADD CONSTRAINT "WhatsAppTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Msg91Node" ADD CONSTRAINT "Msg91Node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiprocketNode" ADD CONSTRAINT "ShiprocketNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiprocketNode" ADD CONSTRAINT "ShiprocketNode_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZohoCrmNode" ADD CONSTRAINT "ZohoCrmNode_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZohoCrmNode" ADD CONSTRAINT "ZohoCrmNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubspotNode" ADD CONSTRAINT "HubspotNode_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credenial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubspotNode" ADD CONSTRAINT "HubspotNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

