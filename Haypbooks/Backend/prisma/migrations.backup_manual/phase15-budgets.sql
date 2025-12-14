-- phase15-budgets.sql
-- Create Budget and BudgetLine tables

CREATE TABLE IF NOT EXISTS public."Budget" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "name" text NOT NULL,
  "scenario" text NOT NULL DEFAULT 'ACTUAL',
  "status" text NOT NULL DEFAULT 'DRAFT',
  "fiscalYear" integer NOT NULL,
  "totalAmount" numeric(20,4),
  "createdAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."BudgetLine" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "budgetId" uuid NOT NULL,
  "accountId" uuid,
  "classId" uuid,
  "month" integer,
  "amount" numeric(20,4) NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  CONSTRAINT "BudgetLine_budget_fkey" FOREIGN KEY ("budgetId") REFERENCES public."Budget" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "budget_tenant_year_idx" ON public."Budget" ("tenantId", "fiscalYear");
CREATE INDEX IF NOT EXISTS "budgetline_budget_idx" ON public."BudgetLine" ("budgetId");
CREATE INDEX IF NOT EXISTS "budgetline_account_idx" ON public."BudgetLine" ("accountId");

-- RLS will be applied by phase9-rls-policies.sql which creates tenant-based policies automatically

