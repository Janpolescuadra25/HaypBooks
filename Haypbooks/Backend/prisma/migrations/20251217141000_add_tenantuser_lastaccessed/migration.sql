-- 20251217141000_add_tenantuser_lastaccessed/migration.sql
-- Add nullable lastAccessedAt column to TenantUser to support "last accessed" UI and sorting

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='TenantUser' AND column_name='lastAccessedAt'
  ) THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "lastAccessedAt" timestamptz NULL;
  END IF;
END$$;

-- Add an index to help queries that order by lastAccessedAt per tenant
CREATE INDEX IF NOT EXISTS idx_tenantuser_lastaccessed ON public."TenantUser" ("tenantId", "lastAccessedAt");
