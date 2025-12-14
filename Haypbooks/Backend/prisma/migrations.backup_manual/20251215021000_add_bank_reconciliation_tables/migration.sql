-- 20251215021000_add_bank_reconciliation_tables/migration.sql
-- Add BankReconciliation and BankReconciliationLine tables, indexes, and FKs (idempotent)

CREATE TABLE IF NOT EXISTS public."BankReconciliation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "bankAccountId" TEXT NOT NULL,
  "statementDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "closingBalance" numeric(20,4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."BankReconciliationLine" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "bankReconciliationId" TEXT NOT NULL,
  "bankTransactionId" TEXT NOT NULL,
  matched BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'bankreconciliation_tenant_bankaccount_statement_idx') THEN
    CREATE INDEX bankreconciliation_tenant_bankaccount_statement_idx ON public."BankReconciliation" ("tenantId","bankAccountId","statementDate");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'bankreconciliationline_tenant_recon_idx') THEN
    CREATE INDEX bankreconciliationline_tenant_recon_idx ON public."BankReconciliationLine" ("tenantId","bankReconciliationId");
  END IF;
END$$ LANGUAGE plpgsql;

-- Add FK constraints as NOT VALID to avoid long locking in production
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bankreconciliation_tenant') THEN
    ALTER TABLE public."BankReconciliation" ADD CONSTRAINT fk_bankreconciliation_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bankreconciliation_bankaccount') THEN
    ALTER TABLE public."BankReconciliation" ADD CONSTRAINT fk_bankreconciliation_bankaccount FOREIGN KEY ("bankAccountId") REFERENCES public."BankAccount"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bankreconline_tenant') THEN
    ALTER TABLE public."BankReconciliationLine" ADD CONSTRAINT fk_bankreconline_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bankreconline_recon') THEN
    ALTER TABLE public."BankReconciliationLine" ADD CONSTRAINT fk_bankreconline_recon FOREIGN KEY ("bankReconciliationId") REFERENCES public."BankReconciliation"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bankreconline_transaction') THEN
    ALTER TABLE public."BankReconciliationLine" ADD CONSTRAINT fk_bankreconline_transaction FOREIGN KEY ("bankTransactionId") REFERENCES public."BankTransaction"(id) ON DELETE RESTRICT NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$ LANGUAGE plpgsql;
