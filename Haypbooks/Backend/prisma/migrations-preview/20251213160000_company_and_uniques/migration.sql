-- DropIndex
DROP INDEX "AccountBalance_accountId_yearMonth_key";

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_tenantId_accountId_yearMonth_key" ON "AccountBalance"("tenantId", "accountId", "yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_tenantId_accountId_key" ON "OpeningBalance"("tenantId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_key" ON "TaxCodeAccount"("tenantId", "taxCodeId", "accountId");

