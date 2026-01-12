-- 2026-01-13: Add nullable tenantId to Subscription and backfill from Company
-- Idempotent: safe to run multiple times

BEGIN;

-- Add column if missing
ALTER TABLE public."Subscription" ADD COLUMN IF NOT EXISTS "tenantId" uuid;

-- Optional index (CONCURRENTLY to avoid locking in production)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_tenantid ON public."Subscription"("tenantId");

-- Backfill tenantId from Company when company.tenantId is a valid UUID
-- Uses regex to only cast valid UUIDs to avoid errors
WITH candidates AS (
  SELECT s.id AS subscription_id, c."tenantId" AS tenant_text
  FROM public."Subscription" s
  JOIN public."Company" c ON (s."companyId" = c.id OR s."company_id" = c.id OR s.companyid = c.id)
  WHERE s."tenantId" IS NULL AND c."tenantId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)
UPDATE public."Subscription" s
SET "tenantId" = (candidates.tenant_text)::uuid
FROM candidates
WHERE s.id = candidates.subscription_id;

COMMIT;

-- Verification: run the following after applying
-- SELECT COUNT(*) FROM public."Subscription" WHERE "tenantId" IS NULL AND ("companyId" IS NOT NULL OR "company_id" IS NOT NULL);
-- should return 0 (or only rows where company.tenantId was not a valid UUID and must be handled manually)

-- Rollback: restore DB from backup before running this script (recommended). This operation is generally safe but may be disruptive if done without backup.
