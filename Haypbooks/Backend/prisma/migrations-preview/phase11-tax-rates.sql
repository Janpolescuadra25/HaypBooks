-- phase11-tax-rates.sql
CREATE TABLE IF NOT EXISTS public."TaxRate" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  jurisdiction text NOT NULL,
  name text NOT NULL,
  rate numeric(10,6) NOT NULL,
  "effectiveFrom" timestamptz NOT NULL,
  "effectiveTo" timestamptz,
  "isCompound" boolean DEFAULT false,
  "createdAt" timestamptz DEFAULT now()
);

-- Add tenantId column if missing (for idempotency with old migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='tenantId') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "tenantId" uuid;
  END IF;
END $$;

-- Add other missing columns if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='jurisdiction') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN jurisdiction text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='effectiveFrom') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "effectiveFrom" timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='effectiveTo') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "effectiveTo" timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TaxRate' AND column_name='createdAt') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "createdAt" timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "tax_rate_tenant_jurid_idx" ON public."TaxRate" ("tenantId", jurisdiction, "effectiveFrom");

-- Add basic RLS policy
DO $$
BEGIN
  ALTER TABLE public."TaxRate" ENABLE ROW LEVEL SECURITY;
  BEGIN
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id'')) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''))',
      'tenant_isolation_TaxRate', 'public', 'TaxRate'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
