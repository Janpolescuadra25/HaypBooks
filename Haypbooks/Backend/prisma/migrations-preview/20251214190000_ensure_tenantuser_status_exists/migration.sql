-- 20251214190000_ensure_tenantuser_status_exists/migration.sql
-- Adds status column to TenantUser if it doesn't exist

BEGIN;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TenantUser') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='status') THEN
      ALTER TABLE public."TenantUser" ADD COLUMN "status" text NOT NULL DEFAULT 'ACTIVE';
    END IF;
  END IF;
END$$;

COMMIT;
