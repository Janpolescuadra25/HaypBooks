-- Migration: Move firmName from User to TenantUser, remove companyName from User
-- Date: 2026-01-10
-- Reason: Company creation belongs to Tenant context, not User profile
--         FirmName should be associated with TenantUser relationship

BEGIN;

-- Add firmName to TenantUser table (where the tenant-user relationship is defined)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'TenantUser' AND column_name = 'firmName'
  ) THEN
    ALTER TABLE "TenantUser" ADD COLUMN "firmName" TEXT;
    COMMENT ON COLUMN "TenantUser"."firmName" IS 'Firm/company name for this user within this tenant context';
  END IF;
END $$;

-- Optional: Backfill firmName from User table if data exists
-- This preserves existing data before dropping the columns
DO $$
BEGIN
  UPDATE "TenantUser" tu
  SET "firmName" = u."firmname"
  FROM "User" u
  WHERE tu."userId" = u.id 
    AND u."firmname" IS NOT NULL
    AND tu."firmName" IS NULL;
END $$;

-- Drop companyName and firmName from User table
-- These belong in the Tenant/Company context, not the user profile
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'companyname'
  ) THEN
    ALTER TABLE "User" DROP COLUMN "companyname";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'firmname'
  ) THEN
    ALTER TABLE "User" DROP COLUMN "firmname";
  END IF;
END $$;

COMMIT;
