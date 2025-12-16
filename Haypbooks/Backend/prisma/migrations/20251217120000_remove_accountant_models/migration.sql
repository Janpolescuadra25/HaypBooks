-- Migration: 20251217120000_remove_accountant_models
-- Safely remove legacy accountant-specific tables, columns, and enums.
-- Designed to be idempotent and safe to re-run in CI.

-- Drop RLS policies and disable RLS for affected tables (if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_policy p ON p.polrelid = c.oid WHERE c.relname = 'AccountantClient' AND p.polname = 'rls_tenant') THEN
    EXECUTE 'ALTER TABLE IF EXISTS public."AccountantClient" DISABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS rls_tenant ON public."AccountantClient"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_policy p ON p.polrelid = c.oid WHERE c.relname = 'AccountantActivity' AND p.polname = 'rls_tenant') THEN
    EXECUTE 'ALTER TABLE IF EXISTS public."AccountantActivity" DISABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS rls_tenant ON public."AccountantActivity"';
  END IF;
END$$;

-- Drop tables if they exist
DROP TABLE IF EXISTS public."AccountantClient" CASCADE;
DROP TABLE IF EXISTS public."AccountantActivity" CASCADE;
DROP TABLE IF EXISTS public."ProAdvisorPerk" CASCADE;

-- Drop columns from User safely
ALTER TABLE IF EXISTS public."User" DROP COLUMN IF EXISTS "userType";
ALTER TABLE IF EXISTS public."User" DROP COLUMN IF EXISTS "isCertified";
ALTER TABLE IF EXISTS public."User" DROP COLUMN IF EXISTS "firmName";
ALTER TABLE IF EXISTS public."User" DROP COLUMN IF EXISTS "certification";
ALTER TABLE IF EXISTS public."User" DROP COLUMN IF EXISTS "proAdvisorBadge";

-- Drop any lingering constraints or indexes that may reference dropped tables
DO $$
BEGIN
  -- attempt to drop indexes if they exist
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AccountantClient_accountant_tenant_uq') THEN
    EXECUTE 'DROP INDEX IF EXISTS public."AccountantClient_accountant_tenant_uq"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AccountantClient_tenantId_idx') THEN
    EXECUTE 'DROP INDEX IF EXISTS public."AccountantClient_tenantId_idx"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AccountantClient_accountantId_idx') THEN
    EXECUTE 'DROP INDEX IF EXISTS public."AccountantClient_accountantId_idx"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AccountantActivity_accountant_created_idx') THEN
    EXECUTE 'DROP INDEX IF EXISTS public."AccountantActivity_accountant_created_idx"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AccountantActivity_tenantId_idx') THEN
    EXECUTE 'DROP INDEX IF EXISTS public."AccountantActivity_tenantId_idx"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProAdvisorPerk_userId_idx') THEN
    EXECUTE 'DROP INDEX IF EXISTS public."ProAdvisorPerk_userId_idx"';
  END IF;
END$$;

-- Drop enum types if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usertype') THEN
    EXECUTE 'DROP TYPE IF EXISTS "UserType"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'accountantaccesslevel') THEN
    EXECUTE 'DROP TYPE IF EXISTS "AccountantAccessLevel"';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perktype') THEN
    EXECUTE 'DROP TYPE IF EXISTS "PerkType"';
  END IF;
END$$;

-- Note: CASCADE above ensures dependent objects removed; statements are idempotent and safe on re-run.
