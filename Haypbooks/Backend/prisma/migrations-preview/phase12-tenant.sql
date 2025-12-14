-- phase12-tenant.sql
-- Create Tenant table to match Prisma model
CREATE TABLE IF NOT EXISTS public."Tenant" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  status text DEFAULT 'ACTIVE' NOT NULL,
  plan text DEFAULT 'FREE' NOT NULL,
  "baseCurrency" text DEFAULT 'USD' NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  "deletedAt" timestamptz
);

CREATE INDEX IF NOT EXISTS "tenant_subdomain_idx" ON public."Tenant" (subdomain);

DO $$
BEGIN
  ALTER TABLE public."Tenant" ENABLE ROW LEVEL SECURITY;
  BEGIN
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR ALL USING ((TRUE)) WITH CHECK ((TRUE))',
      'allow_all_tenant', 'public', 'Tenant'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
