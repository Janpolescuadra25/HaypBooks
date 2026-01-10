-- Add onboarding display fields back to Tenant (idempotent)
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "businessType" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "industry" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxId" varchar(50);
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "logoUrl" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "invoicePrefix" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "vatRegistered" boolean DEFAULT false;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "vatRate" numeric(5,2);
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "pricesInclusive" boolean DEFAULT false;
-- Create indexes if useful (non-blocking)
CREATE INDEX IF NOT EXISTS "Tenant_tenant_businessType_idx" ON public."Tenant" ("businessType");
CREATE INDEX IF NOT EXISTS "Tenant_tenant_industry_idx" ON public."Tenant" ("industry");
