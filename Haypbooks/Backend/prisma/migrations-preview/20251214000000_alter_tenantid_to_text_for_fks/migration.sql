-- migration to convert tenantId column types to text where they are uuid
DO $$
BEGIN
  -- Drop known tenant isolation policies for these tables to allow ALTER TYPE on tenantId
  DROP POLICY IF EXISTS tenant_isolation_TaxRate ON public."TaxRate";
  DROP POLICY IF EXISTS tenant_isolation_Budget ON public."Budget";
  DROP POLICY IF EXISTS tenant_isolation_FixedAsset ON public."FixedAsset";
  DROP POLICY IF EXISTS tenant_isolation_FixedAssetCategory ON public."FixedAssetCategory";
  -- TaxRate: ensure tenantId is text
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public."TaxRate"'::regclass AND attname = 'tenantId' AND atttypid::regtype::text <> 'text') THEN
    ALTER TABLE public."TaxRate" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;

  -- Budget
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public."Budget"'::regclass AND attname = 'tenantId' AND atttypid::regtype::text <> 'text') THEN
    ALTER TABLE public."Budget" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;

  -- FixedAsset
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public."FixedAsset"'::regclass AND attname = 'tenantId' AND atttypid::regtype::text <> 'text') THEN
    ALTER TABLE public."FixedAsset" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;

  -- FixedAssetCategory
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public."FixedAssetCategory"'::regclass AND attname = 'tenantId' AND atttypid::regtype::text <> 'text') THEN
    ALTER TABLE public."FixedAssetCategory" ALTER COLUMN "tenantId" TYPE text USING "tenantId"::text;
  END IF;

  -- Recreate the RLS policies for these tables using tenantId as text
  CREATE POLICY tenant_isolation_TaxRate ON public."TaxRate" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  CREATE POLICY tenant_isolation_Budget ON public."Budget" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  CREATE POLICY tenant_isolation_FixedAsset ON public."FixedAsset" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  CREATE POLICY tenant_isolation_FixedAssetCategory ON public."FixedAssetCategory" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
END $$;
