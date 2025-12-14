-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("tenantId","userId")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DECIMAL(28,12) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSubType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "AccountSubType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "balanceForeign" DECIMAL(20,4),

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "budgetAmount" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAddress" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactCustomField" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,

    CONSTRAINT "ContactCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "parentId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountSubTypeId" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "entryNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "companyId" TEXT,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "credit" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "contactId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "terms" TEXT,
    "creditLimit" DECIMAL(12,2),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "contactId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inventoryAssetAccountId" TEXT,
    "cogsAccountId" TEXT,
    "costMethod" TEXT DEFAULT 'FIFO',

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCostLayer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "itemId" TEXT NOT NULL,
    "inventoryTxLineId" TEXT,
    "quantity" DECIMAL(28,6) NOT NULL,
    "remainingQty" DECIMAL(28,6) NOT NULL,
    "unitCost" DECIMAL(28,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryCostLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "itemId" TEXT NOT NULL,
    "stockLocationId" TEXT NOT NULL,
    "quantity" DECIMAL(28,6) NOT NULL,
    "reserved" DECIMAL(28,6) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "transactionNumber" TEXT,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseOrderId" TEXT,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransactionLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "transactionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "stockLocationId" TEXT,
    "qty" DECIMAL(28,6) NOT NULL,
    "unitCost" DECIMAL(28,6),
    "lineType" TEXT,

    CONSTRAINT "InventoryTransactionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxJurisdiction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxJurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCompound" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCodeRate" (
    "id" TEXT NOT NULL,
    "taxCodeId" TEXT NOT NULL,
    "taxRateId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "ratePct" DECIMAL(10,6) NOT NULL,

    CONSTRAINT "TaxCodeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineTax" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceLineId" TEXT,
    "billLineId" TEXT,
    "taxCodeId" TEXT NOT NULL,
    "taxRateId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,

    CONSTRAINT "LineTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCodeAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "taxCodeId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "TaxCodeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "invoiceNumber" TEXT,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "invoiceId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceived" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentReceived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "accountNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "billNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "billId" TEXT NOT NULL,
    "accountId" TEXT,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "taxCodeId" TEXT,

    CONSTRAINT "BillLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "poNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "total" DECIMAL(16,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "inventoryTransactionId" TEXT,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "purchaseOrderId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,

    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCredit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "creditNumber" TEXT,
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "VendorCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCreditLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "vendorCreditId" TEXT NOT NULL,
    "accountId" TEXT,
    "amount" DECIMAL(16,4) NOT NULL,
    "description" TEXT,

    CONSTRAINT "VendorCreditLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "bankAccountId" TEXT,
    "vendorPaymentMethodId" TEXT,

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPaymentMethod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "details" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" BIGSERIAL NOT NULL,
    "tenantId" TEXT,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aggregateId" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAttempt" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "worker" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "JobAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadLetter" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryAfter" TIMESTAMP(3),

    CONSTRAINT "DeadLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexingQueue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "indexableType" TEXT NOT NULL,
    "indexableId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndexingQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexedDoc" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "indexableType" TEXT NOT NULL,
    "indexableId" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "indexedPayload" JSONB NOT NULL,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndexedDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBillingInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "TenantBillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBillingUsage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "invoicesCount" INTEGER NOT NULL DEFAULT 0,
    "apiCalls" INTEGER NOT NULL DEFAULT 0,
    "storageBytes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "TenantBillingUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsrExportRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requesterId" TEXT,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "exportLink" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DsrExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "consentType" TEXT NOT NULL,
    "consentStatus" TEXT NOT NULL,
    "metadata" JSONB,
    "grantedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "key" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT,
    "eventType" TEXT NOT NULL,
    "tenantId" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaMigration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "appliedBy" TEXT,
    "checksum" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" TEXT NOT NULL,
    "artifactRef" TEXT,

    CONSTRAINT "SchemaMigration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRateLimit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "apiKeyId" TEXT,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowMs" INTEGER NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "quota" INTEGER NOT NULL,

    CONSTRAINT "ApiRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiTokenRevocation" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "revokedBy" TEXT,
    "reason" TEXT,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiTokenRevocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_baseCurrency_toCurrency_date_key" ON "ExchangeRate"("baseCurrency", "toCurrency", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_accountId_yearMonth_key" ON "AccountBalance"("accountId", "yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "Class_tenantId_name_key" ON "Class"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_tenantId_name_key" ON "Location"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Project_tenantId_status_idx" ON "Project"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Account_tenantId_code_key" ON "Account"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_entryNumber_key" ON "JournalEntry"("entryNumber");

-- CreateIndex
CREATE INDEX "JournalEntry_tenantId_date_idx" ON "JournalEntry"("tenantId", "date");

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalId_idx" ON "JournalEntryLine"("journalId");

-- CreateIndex
CREATE INDEX "InventoryCostLayer_tenantId_itemId_idx" ON "InventoryCostLayer"("tenantId", "itemId");

-- CreateIndex
CREATE INDEX "StockLocation_tenantId_name_idx" ON "StockLocation"("tenantId", "name");

-- CreateIndex
CREATE INDEX "StockLevel_tenantId_itemId_idx" ON "StockLevel"("tenantId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_tenantId_itemId_stockLocationId_key" ON "StockLevel"("tenantId", "itemId", "stockLocationId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_tenantId_transactionNumber_idx" ON "InventoryTransaction"("tenantId", "transactionNumber");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_tenantId_itemId_idx" ON "InventoryTransactionLine"("tenantId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxJurisdiction_country_region_code_key" ON "TaxJurisdiction"("country", "region", "code");

-- CreateIndex
CREATE INDEX "TaxRate_jurisdictionId_startDate_idx" ON "TaxRate"("jurisdictionId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_tenantId_code_key" ON "TaxCode"("tenantId", "code");

-- CreateIndex
CREATE INDEX "TaxCodeRate_taxCodeId_taxRateId_idx" ON "TaxCodeRate"("taxCodeId", "taxRateId");

-- CreateIndex
CREATE INDEX "LineTax_tenantId_invoiceLineId_billLineId_idx" ON "LineTax"("tenantId", "invoiceLineId", "billLineId");

-- CreateIndex
CREATE INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_idx" ON "TaxCodeAccount"("tenantId", "taxCodeId", "accountId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Bill_tenantId_status_idx" ON "Bill"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Bill_tenantId_vendorId_idx" ON "Bill"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "Bill_companyId_idx" ON "Bill"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_tenantId_billNumber_key" ON "Bill"("tenantId", "billNumber");

-- CreateIndex
CREATE INDEX "BillLine_billId_idx" ON "BillLine"("billId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_status_idx" ON "PurchaseOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_vendorId_idx" ON "PurchaseOrder"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_idx" ON "PurchaseOrder"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_tenantId_poNumber_key" ON "PurchaseOrder"("tenantId", "poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_purchaseOrderId_idx" ON "PurchaseOrderLine"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "VendorCredit_tenantId_status_idx" ON "VendorCredit"("tenantId", "status");

-- CreateIndex
CREATE INDEX "VendorCredit_tenantId_vendorId_idx" ON "VendorCredit"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "VendorCredit_companyId_idx" ON "VendorCredit"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCredit_tenantId_creditNumber_key" ON "VendorCredit"("tenantId", "creditNumber");

-- CreateIndex
CREATE INDEX "VendorCreditLine_vendorCreditId_idx" ON "VendorCreditLine"("vendorCreditId");

-- CreateIndex
CREATE INDEX "BillPayment_tenantId_billId_idx" ON "BillPayment"("tenantId", "billId");

-- CreateIndex
CREATE INDEX "BillPayment_companyId_billId_idx" ON "BillPayment"("companyId", "billId");

-- CreateIndex
CREATE INDEX "VendorPaymentMethod_tenantId_vendorId_idx" ON "VendorPaymentMethod"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "VendorPaymentMethod_companyId_vendorId_idx" ON "VendorPaymentMethod"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "EventLog_tenantId_type_createdAt_idx" ON "EventLog"("tenantId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "JobAttempt_jobId_status_idx" ON "JobAttempt"("jobId", "status");

-- CreateIndex
CREATE INDEX "DeadLetter_jobId_idx" ON "DeadLetter"("jobId");

-- CreateIndex
CREATE INDEX "SearchIndexingQueue_tenantId_status_nextRetryAt_idx" ON "SearchIndexingQueue"("tenantId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "SearchIndexedDoc_tenantId_indexName_indexedAt_idx" ON "SearchIndexedDoc"("tenantId", "indexName", "indexedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBillingInvoice_invoiceNumber_key" ON "TenantBillingInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "TenantBillingInvoice_tenantId_status_idx" ON "TenantBillingInvoice"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBillingUsage_tenantId_period_key" ON "TenantBillingUsage"("tenantId", "period");

-- CreateIndex
CREATE INDEX "DsrExportRequest_tenantId_status_idx" ON "DsrExportRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ConsentRecord_tenantId_userId_consentType_idx" ON "ConsentRecord"("tenantId", "userId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_nextRetryAt_idx" ON "OutboxEvent"("tenantId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "ApiRateLimit_tenantId_apiKeyId_windowStart_idx" ON "ApiRateLimit"("tenantId", "apiKeyId", "windowStart");

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AccountType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_accountSubTypeId_fkey" FOREIGN KEY ("accountSubTypeId") REFERENCES "AccountSubType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_inventoryTxLineId_fkey" FOREIGN KEY ("inventoryTxLineId") REFERENCES "InventoryTransactionLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_stockLocationId_fkey" FOREIGN KEY ("stockLocationId") REFERENCES "StockLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "InventoryTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_stockLocationId_fkey" FOREIGN KEY ("stockLocationId") REFERENCES "StockLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCode" ADD CONSTRAINT "TaxCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "VendorCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_vendorPaymentMethodId_fkey" FOREIGN KEY ("vendorPaymentMethodId") REFERENCES "VendorPaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
