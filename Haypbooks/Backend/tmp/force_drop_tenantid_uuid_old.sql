-- Force-drop tenantId_uuid_old backup columns (CASCADE)
ALTER TABLE public."TaxRate" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."Employee" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."PaySchedule" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."PayrollRun" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."PayrollRunEmployee" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."Paycheck" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."Budget" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."FixedAssetCategory" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
ALTER TABLE public."FixedAsset" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE;
