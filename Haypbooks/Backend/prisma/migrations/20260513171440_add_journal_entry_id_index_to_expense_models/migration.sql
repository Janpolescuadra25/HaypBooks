-- CreateIndex
CREATE INDEX "ExpenseClaim_journalEntryId_idx" ON "ExpenseClaim"("journalEntryId");

-- CreateIndex
CREATE INDEX "PerDiemClaim_journalEntryId_idx" ON "PerDiemClaim"("journalEntryId");

-- CreateIndex
CREATE INDEX "VendorCredit_journalEntryId_idx" ON "VendorCredit"("journalEntryId");

-- CreateIndex
CREATE INDEX "mileage_logs_journalEntryId_idx" ON "mileage_logs"("journalEntryId");
