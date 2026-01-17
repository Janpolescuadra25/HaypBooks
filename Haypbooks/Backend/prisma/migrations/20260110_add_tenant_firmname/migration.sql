-- Migration: Add firmName to Tenant table
-- Date: 2026-01-10
-- Reason: Tenant needs to store its accounting firm name (e.g., "Smith & Associates CPA")

BEGIN;

-- Add firmName column to Tenant table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Tenant' AND column_name = 'firmName'
  ) THEN
    ALTER TABLE "Tenant" ADD COLUMN "firmName" TEXT;
    COMMENT ON COLUMN "Tenant"."firmName" IS 'The accounting firm name for this tenant';
  END IF;
END $$;

COMMIT;
