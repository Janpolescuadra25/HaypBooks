-- 20251214063000_rls_safe_alter_tenantid_type_and_add_constraints/migration.sql
-- Safely alter tenantId column type to text by dropping tenant RLS policies, altering the column,
-- and recreating policies. Also add missing tenant FK constraints as NOT VALID where suitable.

DO $$ DECLARE
  t TEXT;
  policy TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('ContactEmail','ContactPhone','CustomerCredit','CustomerCreditLine','CustomerCreditApplication') LOOP
    policy := format('tenant_isolation_%s', t);
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename = t AND policyname = policy) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy, t);
    END IF;
    -- Alter tenantId from uuid to text if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = t AND udt_name <> 'text' AND column_name = 'tenantId') THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text', t);
    END IF;
    -- Recreate tenant isolation policy using text comparison
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename = t AND policyname = policy) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))', policy, t);
    END IF;
  END LOOP;
END$$;

-- Add tenant FKs as NOT VALID if missing now that column types are aligned
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactemail_tenant') THEN
    ALTER TABLE public."ContactEmail" ADD CONSTRAINT fk_contactemail_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactphone_tenant') THEN
    ALTER TABLE public."ContactPhone" ADD CONSTRAINT fk_contactphone_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_tenant') THEN
    ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_tenant') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_tenant') THEN
    ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
END$$;
