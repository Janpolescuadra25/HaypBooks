-- phase14-align-taxrates.sql
-- Align existing TaxRate table schema from older "jurisdictionId" form to tenant-scoped.
-- 1) Add tenantId column if missing (nullable)
-- 2) Add jurisdiction, name, effectiveFrom columns if missing
-- 3) Copy values from jurisdictionId (if exists) to jurisdiction string when possible
-- 4) Create a demo tenant if no tenant exists and point legacy rows to that tenant
-- 5) Add RLS and create index

DO $$
BEGIN
  -- Add tenantId UUID column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='tenantId') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "tenantId" uuid;
  END IF;

  -- Add jurisdiction and name columns if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='jurisdiction') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN jurisdiction text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='name') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN name text;
  END IF;

  -- Add effectiveFrom column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='effectiveFrom') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "effectiveFrom" timestamptz;
  END IF;

  -- If jurisdictionId exists, attempt to populate jurisdiction from TaxJurisdiction.code
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='jurisdictionId') THEN
    -- If TaxJurisdiction table exists, copy the code — otherwise copy jurisdictionId as text
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='TaxJurisdiction') THEN
      UPDATE public."TaxRate" tr
      SET jurisdiction = tj.code
      FROM public."TaxJurisdiction" tj
      WHERE tr."jurisdictionId" = tj.id AND tr.jurisdiction IS NULL;
    ELSE
      UPDATE public."TaxRate" SET jurisdiction = jurisdictionId
      WHERE jurisdiction IS NULL;
    END IF;
  END IF;

  -- Fill missing name from jurisdiction if needed
  UPDATE public."TaxRate"
  SET name = COALESCE(name, jurisdiction, 'Imported Tax Rate')
  WHERE name IS NULL;

  -- For legacy rows without tenantId, create a demo tenant and assign rows to it.
  IF EXISTS (SELECT 1 FROM public."TaxRate" WHERE "tenantId" IS NULL) THEN
    -- create a demo tenant if not exists
    IF NOT EXISTS (SELECT 1 FROM public."Tenant" WHERE subdomain = 'demo') THEN
      INSERT INTO public."Tenant" (id, name, subdomain, status, plan, "baseCurrency", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Demo Tenant', 'demo', 'ACTIVE', 'FREE', 'USD', now(), now());
    END IF;
    -- assign tenantId to demo tenant
    UPDATE public."TaxRate" SET "tenantId" = (SELECT id FROM public."Tenant" WHERE subdomain = 'demo') WHERE "tenantId" IS NULL;
  END IF;

  -- Ensure createdAt present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='createdAt') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "createdAt" timestamptz DEFAULT now();
  END IF;

  -- Make old jurisdictionId column nullable (since new schema doesn't use it)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='jurisdictionId') THEN
    ALTER TABLE public."TaxRate" ALTER COLUMN "jurisdictionId" DROP NOT NULL;
  END IF;

  -- Make old startDate column nullable (new schema uses effectiveFrom)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='startDate') THEN
    ALTER TABLE public."TaxRate" ALTER COLUMN "startDate" DROP NOT NULL;
    -- Copy startDate to effectiveFrom if effectiveFrom is null
    UPDATE public."TaxRate" SET "effectiveFrom" = "startDate" WHERE "effectiveFrom" IS NULL AND "startDate" IS NOT NULL;
  END IF;

  -- Index and RLS
  CREATE INDEX IF NOT EXISTS "tax_rate_tenant_jurid_idx" ON public."TaxRate" ("tenantId", jurisdiction, "effectiveFrom");
  ALTER TABLE public."TaxRate" ENABLE ROW LEVEL SECURITY;
  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id'')) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_TaxRate', 'public', 'TaxRate');
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
