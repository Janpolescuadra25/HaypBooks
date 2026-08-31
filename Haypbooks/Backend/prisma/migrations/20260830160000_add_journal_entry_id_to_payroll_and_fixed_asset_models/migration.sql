-- Migration: add journalEntryId and postingStatus to payroll and fixed asset models
-- Scope: PayrollRun, FixedAssetDepreciation, AssetDisposal only.

-- PostingStatus enum already exists in baseline migration.

ALTER TABLE "PayrollRun"
  ADD COLUMN "journalEntryId" TEXT,
  ADD COLUMN "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';
CREATE INDEX "PayrollRun_journalEntryId_idx" ON "PayrollRun"("journalEntryId");
ALTER TABLE "PayrollRun"
  ADD CONSTRAINT "PayrollRun_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FixedAssetDepreciation"
  ADD COLUMN "journalEntryId" TEXT,
  ADD COLUMN "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';
CREATE INDEX "FixedAssetDepreciation_journalEntryId_idx" ON "FixedAssetDepreciation"("journalEntryId");
ALTER TABLE "FixedAssetDepreciation"
  ADD CONSTRAINT "FixedAssetDepreciation_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AssetDisposal"
  ADD COLUMN "journalEntryId" TEXT,
  ADD COLUMN "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';
CREATE INDEX "AssetDisposal_journalEntryId_idx" ON "AssetDisposal"("journalEntryId");
ALTER TABLE "AssetDisposal"
  ADD CONSTRAINT "AssetDisposal_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
