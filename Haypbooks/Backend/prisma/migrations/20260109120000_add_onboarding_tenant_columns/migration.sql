-- Add onboarding-related columns to Tenant (idempotent)
-- Run with: psql $DATABASE_URL -f migration.sql

ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "businessType" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "industry" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "startDate" timestamptz;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "fiscalStart" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'PH';
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxId" varchar(50);
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "vatRegistered" boolean DEFAULT false;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "vatRate" numeric(5,2);
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "pricesInclusive" boolean DEFAULT false;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxFilingFrequency" text DEFAULT 'ANNUAL';
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxExempt" boolean DEFAULT false;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "logoUrl" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "invoicePrefix" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "defaultPaymentTerms" text;
ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "accountingMethod" text DEFAULT 'CASH';

-- Optional: ensure columns are present but don't change types or constraints here to avoid blocking migrations

-- End
