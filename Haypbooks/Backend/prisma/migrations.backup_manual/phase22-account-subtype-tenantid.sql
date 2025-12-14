-- phase22-account-subtype-tenantid.sql
-- Add tenantId to AccountSubType and populate values

ALTER TABLE public."AccountSubType" ADD COLUMN IF NOT EXISTS "tenantId" text;
-- Populate tenantId from associated Account rows when present
UPDATE public."AccountSubType" SET "tenantId" = a."tenantId" FROM public."Account" a WHERE a."accountSubTypeId" = public."AccountSubType"."id";
-- If these rows are not fully populated, review manually before enforcing NOT NULL
ALTER TABLE public."AccountSubType" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "accountsubtype_tenant_idx" ON public."AccountSubType" ("tenantId", "typeId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccountSubType_tenant_fkey') THEN
    ALTER TABLE public."AccountSubType" ADD CONSTRAINT "AccountSubType_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Apply RLS policy to restrict by tenant
DO $$
BEGIN
  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'AccountSubType');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_AccountSubType', 'public', 'AccountSubType', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
