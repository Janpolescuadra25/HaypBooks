-- Remove legacy username and firmName columns from Tenant (Grok.11 cleanup)
-- These fields are redundant:
-- - username was derived from owner's email prefix
-- - firmName belongs on User model instead

-- Drop username column and its index
DROP INDEX IF EXISTS "Tenant_username_idx";
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "username";

-- Drop firmName column  
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "firmName";
