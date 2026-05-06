/*
  Warnings:

  - Added the required column `updatedAt` to the `PriceList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BillStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "glAccountId" TEXT;

-- AlterTable
ALTER TABLE "BankTransaction" ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "journalEntryId" TEXT,
ADD COLUMN     "transactionType" TEXT;

-- AlterTable
ALTER TABLE "BankTransactionSplit" ADD COLUMN     "accountId" TEXT;

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "billType" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "purchaseOrderId" TEXT,
ADD COLUMN     "terms" TEXT;

-- AlterTable
ALTER TABLE "BillPayment" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "memo" TEXT;

-- AlterTable
ALTER TABLE "ExpenseClaim" ADD COLUMN     "advancePayment" DECIMAL(19,4),
ADD COLUMN     "businessPurpose" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "toDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ExpenseClaimLine" ADD COLUMN     "category" TEXT,
ADD COLUMN     "receiptName" TEXT,
ADD COLUMN     "receiptUrl" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "category" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "sourceReferenceId" TEXT,
ADD COLUMN     "transactionSource" TEXT;

-- AlterTable
ALTER TABLE "Practice" ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "PriceList" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerGroupId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseRequest" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "requestNumber" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseRequestLine" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "amount" DECIMAL(19,4),
ADD COLUMN     "taxRate" DECIMAL(10,6);

-- AlterTable
ALTER TABLE "VendorCredit" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "creditType" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "referenceBillId" TEXT,
ADD COLUMN     "referenceBillNumber" TEXT;

-- AlterTable
ALTER TABLE "WorkspaceInvite" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "isLinkInvite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WriteOff" ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "company_settings" ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'MMM DD, YYYY',
ADD COLUMN     "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "defaultPaymentTerms" TEXT NOT NULL DEFAULT 'net-30',
ADD COLUMN     "defaultTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 12,
ADD COLUMN     "defaultTaxTreatment" TEXT NOT NULL DEFAULT 'exclusive',
ADD COLUMN     "lateFeeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lateFeeGracePeriod" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "lateFeeMaxCap" DOUBLE PRECISION,
ADD COLUMN     "lateFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "lateFeeType" TEXT NOT NULL DEFAULT 'percentage',
ADD COLUMN     "numberFormat" TEXT NOT NULL DEFAULT '1,234.56',
ADD COLUMN     "reminderDaysAfter" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderRepeatDays" INTEGER NOT NULL DEFAULT 7;

-- AlterTable
ALTER TABLE "mileage_logs" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "distanceUnit" TEXT,
ADD COLUMN     "logNumber" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "personalVehicle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tripDate" TIMESTAMP(3),
ADD COLUMN     "vehicle" TEXT;

-- CreateTable
CREATE TABLE "revenue_recognitions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "contractId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
    "totalContractValue" DECIMAL(19,4) NOT NULL,
    "recognizedToDate" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "nextRecognitionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastRecognizedAt" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deferred_revenues" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "recognitionId" TEXT,
    "contractId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalDeferredAmount" DECIMAL(19,4) NOT NULL,
    "recognizedAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "remainingDeferred" DECIMAL(19,4) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "nextRecognitionDate" TIMESTAMP(3),
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastRecognizedAt" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deferred_revenues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "paymentReceivedId" TEXT,
    "linkId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerDiemClaim" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "perDiemNumber" TEXT,
    "destination" TEXT NOT NULL,
    "purpose" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "dailyRate" DECIMAL(19,4) NOT NULL,
    "totalAmount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "reimbursedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerDiemClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionsCase" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "invoiceId" TEXT,
    "customerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "subject" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "promisedAmount" DECIMAL(18,2),
    "promisedDate" TIMESTAMP(3),
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionsCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revenue_recognitions_workspaceId_companyId_idx" ON "revenue_recognitions"("workspaceId", "companyId");

-- CreateIndex
CREATE INDEX "revenue_recognitions_companyId_status_nextRecognitionDate_idx" ON "revenue_recognitions"("companyId", "status", "nextRecognitionDate");

-- CreateIndex
CREATE INDEX "revenue_recognitions_invoiceId_idx" ON "revenue_recognitions"("invoiceId");

-- CreateIndex
CREATE INDEX "revenue_recognitions_customerId_idx" ON "revenue_recognitions"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_recognitions_companyId_contractId_key" ON "revenue_recognitions"("companyId", "contractId");

-- CreateIndex
CREATE INDEX "deferred_revenues_workspaceId_companyId_idx" ON "deferred_revenues"("workspaceId", "companyId");

-- CreateIndex
CREATE INDEX "deferred_revenues_companyId_status_nextRecognitionDate_idx" ON "deferred_revenues"("companyId", "status", "nextRecognitionDate");

-- CreateIndex
CREATE INDEX "deferred_revenues_invoiceId_idx" ON "deferred_revenues"("invoiceId");

-- CreateIndex
CREATE INDEX "deferred_revenues_customerId_idx" ON "deferred_revenues"("customerId");

-- CreateIndex
CREATE INDEX "deferred_revenues_recognitionId_idx" ON "deferred_revenues"("recognitionId");

-- CreateIndex
CREATE UNIQUE INDEX "deferred_revenues_companyId_contractId_key" ON "deferred_revenues"("companyId", "contractId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_linkId_key" ON "payment_links"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_token_key" ON "payment_links"("token");

-- CreateIndex
CREATE INDEX "payment_links_workspaceId_companyId_idx" ON "payment_links"("workspaceId", "companyId");

-- CreateIndex
CREATE INDEX "payment_links_companyId_status_expiresAt_idx" ON "payment_links"("companyId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "payment_links_invoiceId_idx" ON "payment_links"("invoiceId");

-- CreateIndex
CREATE INDEX "payment_links_customerId_idx" ON "payment_links"("customerId");

-- CreateIndex
CREATE INDEX "payment_links_paymentReceivedId_idx" ON "payment_links"("paymentReceivedId");

-- CreateIndex
CREATE INDEX "PerDiemClaim_workspaceId_employeeId_idx" ON "PerDiemClaim"("workspaceId", "employeeId");

-- CreateIndex
CREATE INDEX "PerDiemClaim_companyId_status_idx" ON "PerDiemClaim"("companyId", "status");

-- CreateIndex
CREATE INDEX "PerDiemClaim_companyId_employeeId_idx" ON "PerDiemClaim"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "CollectionsCase_workspaceId_idx" ON "CollectionsCase"("workspaceId");

-- CreateIndex
CREATE INDEX "CollectionsCase_companyId_idx" ON "CollectionsCase"("companyId");

-- CreateIndex
CREATE INDEX "CollectionsCase_companyId_status_idx" ON "CollectionsCase"("companyId", "status");

-- CreateIndex
CREATE INDEX "CollectionsCase_workspaceId_caseNumber_idx" ON "CollectionsCase"("workspaceId", "caseNumber");

-- CreateIndex
CREATE INDEX "BankTransaction_contactId_idx" ON "BankTransaction"("contactId");

-- CreateIndex
CREATE INDEX "BankTransaction_journalEntryId_idx" ON "BankTransaction"("journalEntryId");

-- CreateIndex
CREATE INDEX "BankTransactionSplit_accountId_idx" ON "BankTransactionSplit"("accountId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_workspaceId_departmentId_idx" ON "ExpenseClaim"("workspaceId", "departmentId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_companyId_departmentId_idx" ON "ExpenseClaim"("companyId", "departmentId");

-- CreateIndex
CREATE INDEX "Item_companyId_status_idx" ON "Item"("companyId", "status");

-- CreateIndex
CREATE INDEX "Item_companyId_type_idx" ON "Item"("companyId", "type");

-- CreateIndex
CREATE INDEX "Item_companyId_category_idx" ON "Item"("companyId", "category");

-- CreateIndex
CREATE INDEX "PriceList_status_idx" ON "PriceList"("status");

-- CreateIndex
CREATE INDEX "VendorCredit_workspaceId_referenceBillId_idx" ON "VendorCredit"("workspaceId", "referenceBillId");

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerDiemClaim" ADD CONSTRAINT "PerDiemClaim_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerDiemClaim" ADD CONSTRAINT "PerDiemClaim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerDiemClaim" ADD CONSTRAINT "PerDiemClaim_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_referenceBillId_fkey" FOREIGN KEY ("referenceBillId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_entries" ADD CONSTRAINT "price_list_entries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Workspace_ownerUserId_idx" RENAME TO "Workspace_ownerUserId_idx_2";
