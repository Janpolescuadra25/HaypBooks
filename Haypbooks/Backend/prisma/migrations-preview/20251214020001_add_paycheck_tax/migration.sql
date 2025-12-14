-- Create new table PaycheckTax
CREATE TABLE IF NOT EXISTS public."PaycheckTax" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "paycheckId" uuid NOT NULL,
  "tenantId" text NOT NULL,
  "jurisdiction" text NOT NULL,
  "rate" numeric(10,6) NOT NULL DEFAULT 0,
  "amount" numeric(20,4) NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PaycheckTax_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "paychecktax_paycheckId_idx" ON public."PaycheckTax" ("paycheckId");
CREATE INDEX IF NOT EXISTS "paychecktax_tenantId_idx" ON public."PaycheckTax" ("tenantId");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paychecktax_paycheck_fk') THEN
  ALTER TABLE public."PaycheckTax" ADD CONSTRAINT paychecktax_paycheck_fk FOREIGN KEY ("paycheckId") REFERENCES public."Paycheck" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paychecktax_tenant_fkey') THEN
  ALTER TABLE public."PaycheckTax" ADD CONSTRAINT paychecktax_tenant_fkey FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;
END $$;

-- RLS: enable row level security and add a basic policy for tenant_Id
ALTER TABLE public."PaycheckTax" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'paychecktax_tenant_isolation' AND polrelid = (SELECT oid FROM pg_class WHERE relname = 'PaycheckTax')) THEN
    CREATE POLICY "paychecktax_tenant_isolation" ON public."PaycheckTax" USING ("tenantId" = current_setting('hayp.tenant_id')::text) WITH CHECK ("tenantId" = current_setting('hayp.tenant_id')::text);
  END IF;
END $$;
