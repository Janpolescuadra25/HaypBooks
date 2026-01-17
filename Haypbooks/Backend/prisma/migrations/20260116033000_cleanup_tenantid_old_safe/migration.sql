-- Attempt to drop tenantId_old safely in a migration; each step is idempotent and catches failures
DO $$
BEGIN
  -- Helper: try dropping an index if exists
  PERFORM 1;
END$$;

-- Drop known indexes (if present) before attempting to drop columns
DROP INDEX IF EXISTS public."AccountBalance_tenantId_accountId_yearMonth_key";
DROP INDEX IF EXISTS public."SearchIndexingQueue_tenantId_status_nextRetryAt_idx";
DROP INDEX IF EXISTS public."SearchIndexedDoc_tenantId_indexName_indexedAt_idx";
DROP INDEX IF EXISTS public."ApiRateLimit_tenantId_apiKeyId_windowStart_idx";
DROP INDEX IF EXISTS public."DsrExportRequest_tenantId_status_idx";
DROP INDEX IF EXISTS public."ConsentRecord_tenantId_userId_consentType_idx";
DROP INDEX IF EXISTS public."OutboxEvent_tenantId_status_nextRetryAt_idx";
DROP INDEX IF EXISTS public."Class_tenantId_name_key";
DROP INDEX IF EXISTS public."FixedAssetCategory_tenantId_name_key";
DROP INDEX IF EXISTS public."Location_tenantId_name_key";
DROP INDEX IF EXISTS public."LineTax_tenantId_invoiceLineId_billLineId_idx";
DROP INDEX IF EXISTS public."LineTax_tenantId_purchaseOrderLineId_idx";
DROP INDEX IF EXISTS public."OpeningBalance_tenantId_accountId_key";
DROP INDEX IF EXISTS public."Project_tenantId_status_idx";
DROP INDEX IF EXISTS public."TaxCodeAccount_tenantId_taxCodeId_accountId_idx";
DROP INDEX IF EXISTS public."TaxCodeAccount_tenantId_taxCodeId_accountId_key";
DROP INDEX IF EXISTS public."TenantBillingUsage_tenantId_period_key";
DROP INDEX IF EXISTS public."TenantBillingInvoice_tenantId_status_idx";

-- Try to DROP COLUMN in PL/pgSQL and ignore failures so migration doesn't fail hard
DO $$
BEGIN
  BEGIN
    ALTER TABLE public."AccountBalance" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop AccountBalance.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."SearchIndexingQueue" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop SearchIndexingQueue.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."SearchIndexedDoc" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop SearchIndexedDoc.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."ApiRateLimit" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop ApiRateLimit.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."DsrExportRequest" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop DsrExportRequest.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."ConsentRecord" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop ConsentRecord.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."IdempotencyKey" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop IdempotencyKey.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."OutboxEvent" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop OutboxEvent.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."Class" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop Class.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."Customer" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop Customer.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."FixedAssetCategory" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop FixedAssetCategory.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."Location" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop Location.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."LineTax" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop LineTax.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."OpeningBalance" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop OpeningBalance.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."Project" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop Project.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."TaxCodeAccount" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop TaxCodeAccount.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."TenantBillingUsage" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop TenantBillingUsage.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."TenantBillingInvoice" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop TenantBillingInvoice.tenantId_old: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."Vendor" DROP COLUMN IF EXISTS "tenantId_old";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop Vendor.tenantId_old: %', SQLERRM;
  END;
END$$;

-- NOTE: Remaining tables require manual review (FKs, PKs, trigger usages). See scripts/db/tenantid_old_cleanup_report.md for the full list.
