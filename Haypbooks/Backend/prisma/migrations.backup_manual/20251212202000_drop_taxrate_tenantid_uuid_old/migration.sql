-- Idempotent cleanup for TaxRate tenantId_uuid_old
-- Creates a replacement index on tenantId and drops the old index referencing tenantId_uuid_old.
-- Drops NOT NULL on tenantId_uuid_old and then drops the column if safe.

DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TaxRate' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS tax_rate_tenant_jurid_idx_tenantid ON public."TaxRate" ("tenantId", jurisdiction, "effectiveFrom");
		DROP INDEX IF EXISTS tax_rate_tenant_jurid_idx;
	END IF;
END$$;

-- Make the backup column nullable if present
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'TaxRate' AND column_name = 'tenantId_uuid_old') THEN
		EXECUTE 'ALTER TABLE public."TaxRate" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL';
	END IF;
END $$;

-- Finally drop column if still exists
ALTER TABLE public."TaxRate" DROP COLUMN IF EXISTS "tenantId_uuid_old";
