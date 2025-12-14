-- Generated cleanup migration to drop tenantId_txt and tenantId_uuid_old backup columns
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Budget') THEN
		ALTER TABLE public."Budget" DROP CONSTRAINT IF EXISTS "Budget_tenant_txt_fkey";
		ALTER TABLE public."Budget" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Employee') THEN
		ALTER TABLE public."Employee" DROP CONSTRAINT IF EXISTS "Employee_tenant_txt_fkey";
		ALTER TABLE public."Employee" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAsset') THEN
		ALTER TABLE public."FixedAsset" DROP CONSTRAINT IF EXISTS "FixedAsset_tenant_txt_fkey";
		ALTER TABLE public."FixedAsset" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
		ALTER TABLE public."FixedAssetCategory" DROP CONSTRAINT IF EXISTS "FixedAssetCategory_tenant_txt_fkey";
		ALTER TABLE public."FixedAssetCategory" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
		ALTER TABLE public."PaySchedule" DROP CONSTRAINT IF EXISTS "PaySchedule_tenant_txt_fkey";
		ALTER TABLE public."PaySchedule" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Paycheck') THEN
		ALTER TABLE public."Paycheck" DROP CONSTRAINT IF EXISTS "Paycheck_tenant_txt_fkey";
		ALTER TABLE public."Paycheck" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRun') THEN
		ALTER TABLE public."PayrollRun" DROP CONSTRAINT IF EXISTS "PayrollRun_tenant_txt_fkey";
		ALTER TABLE public."PayrollRun" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRunEmployee') THEN
		ALTER TABLE public."PayrollRunEmployee" DROP CONSTRAINT IF EXISTS "PayrollRunEmployee_tenant_txt_fkey";
		ALTER TABLE public."PayrollRunEmployee" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TaxRate') THEN
		ALTER TABLE public."TaxRate" DROP CONSTRAINT IF EXISTS "TaxRate_tenant_txt_fkey";
		ALTER TABLE public."TaxRate" DROP COLUMN IF EXISTS "tenantId_txt";
	END IF;
END$$;

-- tenantId_uuid_old cleanup statements:
-- Replace index budget_tenant_year_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Budget') THEN
		CREATE INDEX IF NOT EXISTS budget_tenant_year_idx_tenantid ON public."Budget" ("tenantId", "fiscalYear");
		DROP INDEX IF EXISTS budget_tenant_year_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Budget') THEN
		ALTER TABLE public."Budget" DROP CONSTRAINT IF EXISTS "Budget_tenantId_not_null";
		ALTER TABLE public."Budget" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
		ALTER TABLE public."Budget" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index employee_tenant_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Employee' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS employee_tenant_idx_tenantid ON public."Employee" ("tenantId");
		DROP INDEX IF EXISTS employee_tenant_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Employee') THEN
		ALTER TABLE public."Employee" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
		ALTER TABLE public."Employee" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index fixedasset_tenant_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'FixedAsset' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS fixedasset_tenant_idx_tenantid ON public."FixedAsset" ("tenantId");
		DROP INDEX IF EXISTS fixedasset_tenant_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAsset') THEN
		ALTER TABLE public."FixedAsset" DROP CONSTRAINT IF EXISTS "FixedAsset_tenantId_not_null";
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAsset') THEN
		ALTER TABLE public."FixedAsset" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAsset') THEN
		ALTER TABLE public."FixedAsset" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index FixedAssetCategory_tenant_name_key with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
		CREATE INDEX IF NOT EXISTS FixedAssetCategory_tenant_name_key_tenantid ON public."FixedAssetCategory" ("tenantId", name);
		DROP INDEX IF EXISTS FixedAssetCategory_tenant_name_key;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
		ALTER TABLE public."FixedAssetCategory" DROP CONSTRAINT IF EXISTS "FixedAssetCategory_tenantId_not_null";
		CREATE UNIQUE INDEX IF NOT EXISTS FixedAssetCategory_tenant_name_key ON public."FixedAssetCategory" ("tenantId", name);
		ALTER TABLE public."FixedAssetCategory" DROP CONSTRAINT IF EXISTS "FixedAssetCategory_tenant_name_key";
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
		ALTER TABLE public."FixedAssetCategory" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
		ALTER TABLE public."FixedAssetCategory" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index pay_schedule_tenant_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PaySchedule' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS pay_schedule_tenant_idx_tenantid ON public."PaySchedule" ("tenantId");
		DROP INDEX IF EXISTS pay_schedule_tenant_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
		ALTER TABLE public."PaySchedule" DROP CONSTRAINT IF EXISTS "PaySchedule_tenantId_not_null";
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
		ALTER TABLE public."PaySchedule" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
		ALTER TABLE public."PaySchedule" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index paycheck_tenant_employee_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Paycheck' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS paycheck_tenant_employee_idx_tenantid ON public."Paycheck" ("tenantId", "employeeId");
		DROP INDEX IF EXISTS paycheck_tenant_employee_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Paycheck') THEN
		ALTER TABLE public."Paycheck" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Paycheck') THEN
		ALTER TABLE public."Paycheck" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index payroll_run_tenant_status_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PayrollRun' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS payroll_run_tenant_status_idx_tenantid ON public."PayrollRun" ("tenantId", status);
		DROP INDEX IF EXISTS payroll_run_tenant_status_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRun') THEN
		ALTER TABLE public."PayrollRun" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRun') THEN
		ALTER TABLE public."PayrollRun" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index payroll_run_employee_tenant_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PayrollRunEmployee' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS payroll_run_employee_tenant_idx_tenantid ON public."PayrollRunEmployee" ("tenantId");
		DROP INDEX IF EXISTS payroll_run_employee_tenant_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRunEmployee') THEN
		ALTER TABLE public."PayrollRunEmployee" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRunEmployee') THEN
		ALTER TABLE public."PayrollRunEmployee" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
-- Replace index tax_rate_tenant_jurid_idx with new index on tenantId
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TaxRate' AND column_name = 'tenantId') THEN
		CREATE INDEX IF NOT EXISTS tax_rate_tenant_jurid_idx_tenantid ON public."TaxRate" ("tenantId", jurisdiction, "effectiveFrom");
		DROP INDEX IF EXISTS tax_rate_tenant_jurid_idx;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TaxRate' AND column_name = 'tenantId_uuid_old') THEN
		ALTER TABLE public."TaxRate" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;
	END IF;
END$$;
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TaxRate') THEN
		ALTER TABLE public."TaxRate" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
