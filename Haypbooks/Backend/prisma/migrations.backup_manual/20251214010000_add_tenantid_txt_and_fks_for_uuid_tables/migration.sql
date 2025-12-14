-- idempotent migration created to add tenantId_txt columns for uuid-typed tenantId columns
-- These columns mirror the existing uuid tenantId values casted to text and create a NOT VALID FK to Tenant(id)
-- This migration is designed to be safe to re-run and not to modify existing tenantId columns

DO $$
BEGIN
  -- Budget
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Budget' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."Budget" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."Budget" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'budget_tenantid_txt_idx') THEN
    CREATE INDEX budget_tenantid_txt_idx ON public."Budget" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_tenant_txt_fkey') THEN
    ALTER TABLE public."Budget" ADD CONSTRAINT "Budget_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Employee
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Employee' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."Employee" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."Employee" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'employee_tenantid_txt_idx') THEN
    CREATE INDEX employee_tenantid_txt_idx ON public."Employee" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Employee_tenant_txt_fkey') THEN
    ALTER TABLE public."Employee" ADD CONSTRAINT "Employee_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- FixedAsset
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='FixedAsset' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."FixedAsset" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."FixedAsset" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'fixedasset_tenantid_txt_idx') THEN
    CREATE INDEX fixedasset_tenantid_txt_idx ON public."FixedAsset" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FixedAsset_tenant_txt_fkey') THEN
    ALTER TABLE public."FixedAsset" ADD CONSTRAINT "FixedAsset_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- FixedAssetCategory
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='FixedAssetCategory' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."FixedAssetCategory" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."FixedAssetCategory" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'fixedassetcategory_tenantid_txt_idx') THEN
    CREATE INDEX fixedassetcategory_tenantid_txt_idx ON public."FixedAssetCategory" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FixedAssetCategory_tenant_txt_fkey') THEN
    ALTER TABLE public."FixedAssetCategory" ADD CONSTRAINT "FixedAssetCategory_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- PaySchedule
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PaySchedule' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."PaySchedule" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."PaySchedule" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payschedule_tenantid_txt_idx') THEN
    CREATE INDEX payschedule_tenantid_txt_idx ON public."PaySchedule" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaySchedule_tenant_txt_fkey') THEN
    ALTER TABLE public."PaySchedule" ADD CONSTRAINT "PaySchedule_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Paycheck
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Paycheck' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."Paycheck" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."Paycheck" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paycheck_tenantid_txt_idx') THEN
    CREATE INDEX paycheck_tenantid_txt_idx ON public."Paycheck" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Paycheck_tenant_txt_fkey') THEN
    ALTER TABLE public."Paycheck" ADD CONSTRAINT "Paycheck_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- PayrollRun
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PayrollRun' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."PayrollRun" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."PayrollRun" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payrollrun_tenantid_txt_idx') THEN
    CREATE INDEX payrollrun_tenantid_txt_idx ON public."PayrollRun" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PayrollRun_tenant_txt_fkey') THEN
    ALTER TABLE public."PayrollRun" ADD CONSTRAINT "PayrollRun_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- PayrollRunEmployee
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PayrollRunEmployee' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."PayrollRunEmployee" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."PayrollRunEmployee" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payrollrunemployee_tenantid_txt_idx') THEN
    CREATE INDEX payrollrunemployee_tenantid_txt_idx ON public."PayrollRunEmployee" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PayrollRunEmployee_tenant_txt_fkey') THEN
    ALTER TABLE public."PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- TaxRate
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='TaxRate' AND column_name='tenantId_txt') THEN
    ALTER TABLE public."TaxRate" ADD COLUMN "tenantId_txt" text;
  END IF;
  UPDATE public."TaxRate" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'taxrate_tenantid_txt_idx') THEN
    CREATE INDEX taxrate_tenantid_txt_idx ON public."TaxRate" ("tenantId_txt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaxRate_tenant_txt_fkey') THEN
    ALTER TABLE public."TaxRate" ADD CONSTRAINT "TaxRate_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

END $$;
