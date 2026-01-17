-- Migration: Add trialStartsAt to Tenant table
-- Date: 2026-01-10
-- Reason: Track when tenant trial period begins, completing tenant-level trial management

BEGIN;

-- Add trialStartsAt column to Tenant table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Tenant' AND column_name = 'trialStartsAt'
  ) THEN
    ALTER TABLE "Tenant" ADD COLUMN "trialStartsAt" TIMESTAMP(3);
    COMMENT ON COLUMN "Tenant"."trialStartsAt" IS 'When the tenant trial period started';
  END IF;
END $$;

COMMIT;
