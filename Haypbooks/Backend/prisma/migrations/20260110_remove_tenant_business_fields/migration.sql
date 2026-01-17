-- migration: remove_remaining_tenant_business_fields.sql
-- Remove business/profile fields from Tenant table as they now live on Company

ALTER TABLE "Tenant"
  DROP COLUMN IF EXISTS "fiscalStart",
  DROP COLUMN IF EXISTS "businessType",
  DROP COLUMN IF EXISTS "industry",
  DROP COLUMN IF EXISTS "address",
  DROP COLUMN IF EXISTS "taxId",
  DROP COLUMN IF EXISTS "logoUrl",
  DROP COLUMN IF EXISTS "invoicePrefix",
  DROP COLUMN IF EXISTS "vatRegistered",
  DROP COLUMN IF EXISTS "vatRate",
  DROP COLUMN IF EXISTS "pricesInclusive";
