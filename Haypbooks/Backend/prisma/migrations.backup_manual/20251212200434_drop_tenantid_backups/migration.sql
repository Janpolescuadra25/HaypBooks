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
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Budget') THEN
		ALTER TABLE public."Budget" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Employee') THEN
		ALTER TABLE public."Employee" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAsset') THEN
		ALTER TABLE public."FixedAsset" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
		ALTER TABLE public."FixedAssetCategory" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
		ALTER TABLE public."PaySchedule" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Paycheck') THEN
		ALTER TABLE public."Paycheck" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRun') THEN
		ALTER TABLE public."PayrollRun" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRunEmployee') THEN
		ALTER TABLE public."PayrollRunEmployee" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TaxRate') THEN
		ALTER TABLE public."TaxRate" DROP COLUMN IF EXISTS "tenantId_uuid_old";
	END IF;
END$$;
