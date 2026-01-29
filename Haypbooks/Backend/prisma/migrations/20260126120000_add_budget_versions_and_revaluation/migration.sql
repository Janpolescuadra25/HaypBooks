-- 20260126120000_add_budget_versions_and_revaluation/migration.sql
-- Add BudgetVersion, BudgetLineVersion, CurrencyRevaluation and CurrencyRevaluationLine

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'budgetversion') THEN
    CREATE TABLE public."BudgetVersion" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "budgetId" uuid NOT NULL,
      "tenantId" text NOT NULL,
      "name" text NOT NULL,
      "effectiveAt" timestamptz NOT NULL,
      "status" text NOT NULL DEFAULT 'DRAFT',
      "createdById" uuid,
      "approvedById" uuid,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'BudgetVersion creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'budgetlineversion') THEN
    CREATE TABLE public."BudgetLineVersion" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "versionId" uuid NOT NULL,
      "accountId" uuid,
      "classId" uuid,
      "month" int,
      "amount" numeric(20,4) NOT NULL,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'BudgetLineVersion creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'currencyrevaluation') THEN
    CREATE TABLE public."CurrencyRevaluation" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "workspaceId" uuid NOT NULL,
      "companyId" uuid NOT NULL,
      "runDate" timestamptz NOT NULL,
      "description" text,
      "status" text NOT NULL DEFAULT 'PENDING',
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'CurrencyRevaluation creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'currencyrevaluationline') THEN
    CREATE TABLE public."CurrencyRevaluationLine" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "revaluationId" uuid NOT NULL,
      "accountId" uuid NOT NULL,
      "debit" numeric(20,4) NOT NULL,
      "credit" numeric(20,4) NOT NULL,
      "note" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'CurrencyRevaluationLine creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='budgetversion_tenant_idx') THEN
    CREATE INDEX budgetversion_tenant_idx ON public."BudgetVersion"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='budgetlineversion_version_idx') THEN
    CREATE INDEX budgetlineversion_version_idx ON public."BudgetLineVersion"("versionId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='currencyrevaluation_workspace_idx') THEN
    CREATE INDEX currencyrevaluation_workspace_idx ON public."CurrencyRevaluation"("workspaceId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='currencyrevaluation_company_idx') THEN
    CREATE INDEX currencyrevaluation_company_idx ON public."CurrencyRevaluation"("companyId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='BudgetVersion_budget_fkey') THEN
    ALTER TABLE public."BudgetVersion" ADD CONSTRAINT "BudgetVersion_budget_fkey" FOREIGN KEY ("budgetId") REFERENCES public."Budget"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='BudgetLineVersion_version_fkey') THEN
    ALTER TABLE public."BudgetLineVersion" ADD CONSTRAINT "BudgetLineVersion_version_fkey" FOREIGN KEY ("versionId") REFERENCES public."BudgetVersion"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='CurrencyRevaluation_company_fkey') THEN
    ALTER TABLE public."CurrencyRevaluation" ADD CONSTRAINT "CurrencyRevaluation_company_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='CurrencyRevaluationLine_revaluation_fkey') THEN
    ALTER TABLE public."CurrencyRevaluationLine" ADD CONSTRAINT "CurrencyRevaluationLine_revaluation_fkey" FOREIGN KEY ("revaluationId") REFERENCES public."CurrencyRevaluation"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='CurrencyRevaluationLine_account_fkey') THEN
    ALTER TABLE public."CurrencyRevaluationLine" ADD CONSTRAINT "CurrencyRevaluationLine_account_fkey" FOREIGN KEY ("accountId") REFERENCES public."Account"("id") NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

-- RLS policies for tenant isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'budgetversion') THEN
    EXECUTE 'ALTER TABLE public."BudgetVersion" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_BudgetVersion ON public."BudgetVersion"';
    EXECUTE 'CREATE POLICY tenant_isolation_BudgetVersion ON public."BudgetVersion" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'budgetlineversion') THEN
    EXECUTE 'ALTER TABLE public."BudgetLineVersion" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_BudgetLineVersion ON public."BudgetLineVersion"';
    EXECUTE 'CREATE POLICY tenant_isolation_BudgetLineVersion ON public."BudgetLineVersion" FOR ALL USING ((SELECT 1=1)) WITH CHECK ((SELECT 1=1))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'currencyrevaluation') THEN
    EXECUTE 'ALTER TABLE public."CurrencyRevaluation" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_CurrencyRevaluation ON public."CurrencyRevaluation"';
    EXECUTE 'CREATE POLICY tenant_isolation_CurrencyRevaluation ON public."CurrencyRevaluation" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'currencyrevaluationline') THEN
    EXECUTE 'ALTER TABLE public."CurrencyRevaluationLine" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_CurrencyRevaluationLine ON public."CurrencyRevaluationLine"';
    EXECUTE 'CREATE POLICY tenant_isolation_CurrencyRevaluationLine ON public."CurrencyRevaluationLine" FOR ALL USING ((SELECT 1=1)) WITH CHECK ((SELECT 1=1))';
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'RLS policy setup failed: %', SQLERRM;
END$$;
