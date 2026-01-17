-- Safe tenantId_old column drops
-- Generated: 2026-01-16
-- These tables have 0 non-null rows and no constraints on tenantId_old

-- Tables with no constraints
ALTER TABLE "AccountBalance" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "SearchIndexingQueue" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "SearchIndexedDoc" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "ApiRateLimit" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "DsrExportRequest" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "ConsentRecord" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "IdempotencyKey" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "OutboxEvent" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "FixedAssetCategory" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Location" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "LineTax" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "OpeningBalance" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TaxCodeAccount" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TenantBillingUsage" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TenantBillingInvoice" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Vendor" DROP COLUMN IF EXISTS "tenantId_old";

-- Verification queries (run after to confirm drops)
-- SELECT table_name FROM information_schema.columns 
-- WHERE column_name = 'tenantId_old' AND table_schema = 'public';
