-- Add tenant trial fields, remove tenant-wide plan, remove subscription trial column,
-- and add unique index on companyId for subscriptions (idempotent)
BEGIN;

-- Remove tenant-level plan
ALTER TABLE IF EXISTS "Tenant" DROP COLUMN IF EXISTS "plan";

-- Add tenant trial fields (idempotent)
ALTER TABLE IF EXISTS "Tenant" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP;
ALTER TABLE IF EXISTS "Tenant" ADD COLUMN IF NOT EXISTS "trialUsed" BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE IF EXISTS "Tenant" ADD COLUMN IF NOT EXISTS "maxCompanies" INTEGER DEFAULT 0 NOT NULL;

-- Remove subscription-level trial column (we are moving trial to tenant)
ALTER TABLE IF EXISTS "Subscription" DROP COLUMN IF EXISTS "trialEndsAt";

-- NOTE: We create the companyId unique index at runtime (some DBs may not
-- have the Subscription table yet). The apply script will create the index
-- if the Subscription table is present.
-- CREATE UNIQUE INDEX IF NOT EXISTS "subscription_companyid_unique" ON "Subscription" ("companyId");

COMMIT;