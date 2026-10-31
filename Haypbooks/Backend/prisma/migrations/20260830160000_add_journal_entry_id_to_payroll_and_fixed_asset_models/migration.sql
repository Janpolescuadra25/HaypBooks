-- Migration: add journalEntryId and postingStatus to payroll and fixed asset models
-- Scope: PayrollRun, FixedAssetDepreciation, AssetDisposal only.
-- Idempotent for pre-existing columns, indexes, and constraints in the active schema.

-- PostingStatus enum already exists in the baseline migration.

-- PayrollRun: postingStatus already exists in the baseline.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'PayrollRun'
      AND column_name = 'journalEntryId'
  ) THEN
    ALTER TABLE "PayrollRun" ADD COLUMN "journalEntryId" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'PayrollRun'
      AND indexname = 'PayrollRun_journalEntryId_idx'
  ) THEN
    CREATE INDEX "PayrollRun_journalEntryId_idx" ON "PayrollRun"("journalEntryId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = current_schema()
      AND table_name = 'PayrollRun'
      AND constraint_name = 'PayrollRun_journalEntryId_fkey'
  ) THEN
    ALTER TABLE "PayrollRun"
      ADD CONSTRAINT "PayrollRun_journalEntryId_fkey"
      FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- FixedAssetDepreciation.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'FixedAssetDepreciation'
      AND column_name = 'journalEntryId'
  ) THEN
    ALTER TABLE "FixedAssetDepreciation" ADD COLUMN "journalEntryId" TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'FixedAssetDepreciation'
      AND column_name = 'postingStatus'
  ) THEN
    ALTER TABLE "FixedAssetDepreciation"
      ADD COLUMN "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'FixedAssetDepreciation'
      AND indexname = 'FixedAssetDepreciation_journalEntryId_idx'
  ) THEN
    CREATE INDEX "FixedAssetDepreciation_journalEntryId_idx"
      ON "FixedAssetDepreciation"("journalEntryId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = current_schema()
      AND table_name = 'FixedAssetDepreciation'
      AND constraint_name = 'FixedAssetDepreciation_journalEntryId_fkey'
  ) THEN
    ALTER TABLE "FixedAssetDepreciation"
      ADD CONSTRAINT "FixedAssetDepreciation_journalEntryId_fkey"
      FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AssetDisposal.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'AssetDisposal'
      AND column_name = 'journalEntryId'
  ) THEN
    ALTER TABLE "AssetDisposal" ADD COLUMN "journalEntryId" TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'AssetDisposal'
      AND column_name = 'postingStatus'
  ) THEN
    ALTER TABLE "AssetDisposal"
      ADD COLUMN "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'AssetDisposal'
      AND indexname = 'AssetDisposal_journalEntryId_idx'
  ) THEN
    CREATE INDEX "AssetDisposal_journalEntryId_idx" ON "AssetDisposal"("journalEntryId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = current_schema()
      AND table_name = 'AssetDisposal'
      AND constraint_name = 'AssetDisposal_journalEntryId_fkey'
  ) THEN
    ALTER TABLE "AssetDisposal"
      ADD CONSTRAINT "AssetDisposal_journalEntryId_fkey"
      FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
