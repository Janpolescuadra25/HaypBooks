CREATE TABLE IF NOT EXISTS public."SubledgerReconciliation" (
  "id" text PRIMARY KEY,
  "workspaceId" text,
  "companyId" text NOT NULL,
  "subledgerType" "SubledgerType" NOT NULL,
  "subledgerId" text,
  "asOfDate" timestamptz NOT NULL,
  "glAccountId" text,
  "glBalance" numeric(20,4),
  "subledgerBalance" numeric(20,4),
  "difference" numeric(20,4),
  "status" "ReconciliationStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "completedAt" timestamptz,
  "notes" text
);

CREATE INDEX IF NOT EXISTS subledger_recon_workspace_company_date_idx ON public."SubledgerReconciliation"("workspaceId","companyId","subledgerType","asOfDate");
CREATE INDEX IF NOT EXISTS subledger_recon_company_status_idx ON public."SubledgerReconciliation"("companyId","status");

CREATE TABLE IF NOT EXISTS public."Estimate" (
  "id" text PRIMARY KEY,
  "workspaceId" text,
  "companyId" text NOT NULL,
  "name" text NOT NULL,
  "estimateType" "EstimateType" NOT NULL,
  "amount" numeric(20,4),
  "method" text,
  "assumptions" jsonb,
  "impactedAccounts" jsonb,
  "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewedById" text,
  "reviewedAt" timestamptz,
  "approvedById" text,
  "approvedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS estimate_workspace_company_status_idx ON public."Estimate"("workspaceId","companyId","status");
