-- phase21-contact-taxcode-tenantid.sql
-- Add tenantId to ContactAddress, ContactCustomField, and TaxCodeRate and populate values

ALTER TABLE public."ContactAddress" ADD COLUMN IF NOT EXISTS "tenantId" text;
UPDATE public."ContactAddress" SET "tenantId" = c."tenantId" FROM public."Contact" c WHERE c.id = public."ContactAddress"."contactId";
-- If there are any ContactAddress rows without a tenantId but with contact pointing to tenant null, they will remain null — set to NOT NULL only if all rows have tenantId
ALTER TABLE public."ContactAddress" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "contactaddress_tenant_idx" ON public."ContactAddress" ("tenantId", "contactId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContactAddress_tenant_fkey') THEN
    ALTER TABLE public."ContactAddress" ADD CONSTRAINT "ContactAddress_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."ContactCustomField" ADD COLUMN IF NOT EXISTS "tenantId" text;
UPDATE public."ContactCustomField" SET "tenantId" = c."tenantId" FROM public."Contact" c WHERE c.id = public."ContactCustomField"."contactId";
ALTER TABLE public."ContactCustomField" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "contactcustomfield_tenant_idx" ON public."ContactCustomField" ("tenantId", "contactId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContactCustomField_tenant_fkey') THEN
    ALTER TABLE public."ContactCustomField" ADD CONSTRAINT "ContactCustomField_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."TaxCodeRate" ADD COLUMN IF NOT EXISTS "tenantId" text;
UPDATE public."TaxCodeRate" SET "tenantId" = tc."tenantId" FROM public."TaxCode" tc WHERE tc.id = public."TaxCodeRate"."taxCodeId";
ALTER TABLE public."TaxCodeRate" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "taxcoderate_tenant_idx" ON public."TaxCodeRate" ("tenantId", "taxCodeId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaxCodeRate_tenant_fkey') THEN
    ALTER TABLE public."TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Apply RLS policies
DO $$
BEGIN
  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'ContactAddress');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_ContactAddress', 'public', 'ContactAddress', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'ContactCustomField');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_ContactCustomField', 'public', 'ContactCustomField', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'TaxCodeRate');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_TaxCodeRate', 'public', 'TaxCodeRate', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
