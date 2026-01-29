/*
  Warnings:

  - You are about to drop the column `firmname` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,accountId,yearMonth]` on the table `AccountBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `FixedAssetCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,accountId]` on the table `OpeningBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,taxCodeId,accountId]` on the table `TaxCodeAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,period]` on the table `TenantBillingUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "Accountant_Workspace_Name" TEXT,
ADD COLUMN     "Owner_Workspace_name" TEXT,
ADD COLUMN     "active_companies_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "active_non_owner_users_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firmname";

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_tenantId_accountId_yearMonth_key" ON "AccountBalance"("tenantId", "accountId", "yearMonth");

-- CreateIndex
CREATE INDEX "ApiRateLimit_tenantId_apiKeyId_windowStart_idx" ON "ApiRateLimit"("tenantId", "apiKeyId", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "Class_tenantId_name_key" ON "Class"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ConsentRecord_tenantId_userId_consentType_idx" ON "ConsentRecord"("tenantId", "userId", "consentType");

-- CreateIndex
CREATE INDEX "DsrExportRequest_tenantId_status_idx" ON "DsrExportRequest"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FixedAssetCategory_tenantId_name_key" ON "FixedAssetCategory"("tenantId", "name");

-- CreateIndex
CREATE INDEX "LineTax_tenantId_invoiceLineId_billLineId_idx" ON "LineTax"("tenantId", "invoiceLineId", "billLineId");

-- CreateIndex
CREATE INDEX "LineTax_tenantId_purchaseOrderLineId_idx" ON "LineTax"("tenantId", "purchaseOrderLineId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_tenantId_name_key" ON "Location"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_tenantId_accountId_key" ON "OpeningBalance"("tenantId", "accountId");

-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_nextRetryAt_idx" ON "OutboxEvent"("tenantId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "Project_tenantId_status_idx" ON "Project"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SearchIndexedDoc_tenantId_indexName_indexedAt_idx" ON "SearchIndexedDoc"("tenantId", "indexName", "indexedAt");

-- CreateIndex
CREATE INDEX "SearchIndexingQueue_tenantId_status_nextRetryAt_idx" ON "SearchIndexingQueue"("tenantId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_idx" ON "TaxCodeAccount"("tenantId", "taxCodeId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_key" ON "TaxCodeAccount"("tenantId", "taxCodeId", "accountId");

-- CreateIndex
CREATE INDEX "TenantBillingInvoice_tenantId_status_idx" ON "TenantBillingInvoice"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBillingUsage_tenantId_period_key" ON "TenantBillingUsage"("tenantId", "period");
