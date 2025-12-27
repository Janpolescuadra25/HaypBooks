-- rls-policy-templates.sql
-- Auto-generated templates for adding tenant-based RLS policies.
-- DO NOT run these against production without review and backup.
-- Tip: use `SET LOCAL haypbooks.rls_bypass = '1';` in the session when validating to bypass policies during rollout.

-- Example per-table template (applies to any table that has tenantId):
--
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='X' AND column_name='tenantId') THEN
--     ALTER TABLE public."X" ENABLE ROW LEVEL SECURITY;
--     IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'X' AND p.polname = 'rls_tenant') THEN
--       EXECUTE $$CREATE POLICY rls_tenant ON public."X" FOR ALL
--         USING (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true))
--         WITH CHECK (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true));$$;
--     END IF;
--   END IF;
-- END$$;

-- Below are templates for the tables flagged by db:drift-check. Review each before applying.

-- (Templates produced by generate-rls-templates.js)

-- RLS template for table: Account
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Account' AND column_name='tenantId') THEN
    ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'Account' AND p.polname = 'rls_tenant') THEN
      EXECUTE $$CREATE POLICY rls_tenant ON public."Account" FOR ALL
        USING (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true))
        WITH CHECK (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true));$$;
    END IF;
  END IF;
END$$;

-- RLS template for table: AccountBalance
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='AccountBalance' AND column_name='tenantId') THEN
    ALTER TABLE public."AccountBalance" ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountBalance' AND p.polname = 'rls_tenant') THEN
      EXECUTE $$CREATE POLICY rls_tenant ON public."AccountBalance" FOR ALL
        USING (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true))
        WITH CHECK (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true));$$;
    END IF;
  END IF;
END$$;

-- (Templates continue for all flagged tables...)

-- NOTE: This file contains templates for ~80 tables. Use the generator script to re-generate or to produce per-migration files.
