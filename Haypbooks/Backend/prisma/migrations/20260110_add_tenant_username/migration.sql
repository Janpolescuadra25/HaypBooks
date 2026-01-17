-- Add username column to Tenant for easy identification in DB queries
-- This will store the owner's username (email prefix) for administrative purposes

-- Add the column (nullable initially)
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Backfill existing tenants with username from their owner's email (handle type mismatches)
DO $$
BEGIN
  UPDATE "Tenant" t
  SET "username" = COALESCE(
    (SELECT SPLIT_PART(u.email, '@', 1)
     FROM "TenantUser" tu
     JOIN "User" u ON u.id = tu."userId"
     WHERE tu."tenantId"::text = t.id::text
     AND tu."isOwner" = true
     LIMIT 1),
    'legacy-tenant'
  )
  WHERE "username" IS NULL;
END $$;

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS "Tenant_username_idx" ON "Tenant"("username");
