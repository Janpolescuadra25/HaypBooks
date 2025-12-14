-- phase16-fixed-assets.sql
-- Create FixedAssetCategory, FixedAsset, and FixedAssetDepreciation tables

CREATE TABLE IF NOT EXISTS public."FixedAssetCategory" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "name" text NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  CONSTRAINT "FixedAssetCategory_tenant_name_key" UNIQUE ("tenantId", "name")
);

CREATE TABLE IF NOT EXISTS public."FixedAsset" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "categoryId" uuid,
  "name" text NOT NULL,
  "description" text,
  "acquisitionDate" timestamptz NOT NULL,
  "cost" numeric(20,4) NOT NULL,
  "salvageValue" numeric(20,4),
  "usefulLifeMonths" integer,
  "depreciationMethod" text NOT NULL DEFAULT 'STRAIGHT_LINE',
  "assetAccountId" uuid,
  "accumulatedDepreciationId" uuid,
  "createdAt" timestamptz DEFAULT now(),
  CONSTRAINT "FixedAsset_category_fkey" FOREIGN KEY ("categoryId") REFERENCES public."FixedAssetCategory"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public."FixedAssetDepreciation" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "assetId" uuid NOT NULL,
  "periodStart" timestamptz NOT NULL,
  "periodEnd" timestamptz NOT NULL,
  "amount" numeric(20,4) NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  CONSTRAINT "FixedAssetDep_asset_fkey" FOREIGN KEY ("assetId") REFERENCES public."FixedAsset"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "fixedasset_tenant_idx" ON public."FixedAsset" ("tenantId");
CREATE INDEX IF NOT EXISTS "fixedassetdep_asset_idx" ON public."FixedAssetDepreciation" ("assetId");

-- RLS will be applied by phase9-rls-policies.sql
