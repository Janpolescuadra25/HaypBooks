-- Migration: Remove firmName from TenantUser table
-- Date: 2026-01-10
-- Reason: firmName should only exist at Tenant level, not per TenantUser

BEGIN;

-- Drop firmName column from TenantUser table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'TenantUser' AND column_name = 'firmName'
  ) THEN
    ALTER TABLE "TenantUser" DROP COLUMN "firmName";
  END IF;
END $$;

COMMIT;
