-- 20251214061000_fix_tenantid_type_in_new_tables/migration.sql
-- Correct tenantId type for newly created tables from uuid -> text to match Tenant.id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ContactEmail' AND udt_name <> 'text') THEN
    ALTER TABLE public."ContactEmail" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ContactPhone' AND udt_name <> 'text') THEN
    ALTER TABLE public."ContactPhone" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CustomerCredit' AND udt_name <> 'text') THEN
    ALTER TABLE public."CustomerCredit" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CustomerCreditLine' AND udt_name <> 'text') THEN
    ALTER TABLE public."CustomerCreditLine" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CustomerCreditApplication' AND udt_name <> 'text') THEN
    ALTER TABLE public."CustomerCreditApplication" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;
END$$;

-- If FKs still missing, add them now (Tenant.id is text so these will implement)
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
