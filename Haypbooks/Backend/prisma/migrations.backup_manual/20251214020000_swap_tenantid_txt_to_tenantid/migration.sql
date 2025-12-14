-- SAFE SWAP MIGRATION: rename tenantId to tenantId_uuid_old and tenantId_txt to tenantId
-- Idempotent: will check for the presence of columns/constraints/indexes before actions
DO $$
BEGIN
  -- Swap columns for table Budget
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Budget' AND column_name = 'tenantId' AND (SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Budget' AND column_name = 'tenantId') != 'text') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Budget' AND column_name = 'tenantId_uuid_old') THEN
      ALTER TABLE public."Budget" RENAME COLUMN "tenantId" TO "tenantId_uuid_old";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Budget' AND column_name = 'tenantId_txt') THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Budget' AND column_name = 'tenantId') THEN
        ALTER TABLE public."Budget" RENAME COLUMN "tenantId_txt" TO "tenantId";
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'budget_tenantid_txt_idx') AND NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'budget_tenantid_idx') THEN
      ALTER INDEX "budget_tenantid_txt_idx" RENAME TO "budget_tenantid_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_tenant_txt_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_tenantId_fkey') THEN
      ALTER TABLE public."Budget" RENAME CONSTRAINT "Budget_tenant_txt_fkey" TO "Budget_tenantId_fkey";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_tenantId_fkey') THEN
      ALTER TABLE public."Budget" ADD CONSTRAINT "Budget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
    -- Validate the FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_tenantId_fkey' AND NOT convalidated) THEN
      ALTER TABLE public."Budget" VALIDATE CONSTRAINT "Budget_tenantId_fkey";
    END IF;
  END IF;

  -- swap logic continues for other tables ... (omitted here for brevity)

END$$;
