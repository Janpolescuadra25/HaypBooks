-- Safe manual migration: add enums, SubledgerReconciliation, Estimate, and journal approval fields
BEGIN;

-- 1) Add enum values to PostingStatus (if not present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PostingStatus') THEN
    -- If enum missing entirely, create it (unlikely)
    CREATE TYPE "PostingStatus" AS ENUM ('DRAFT','POSTED','VOIDED');
  END IF;
  -- Add values if they don't exist
  BEGIN
    ALTER TYPE "PostingStatus" ADD VALUE IF NOT EXISTS 'REVIEWED';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER TYPE "PostingStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;

-- 2) Create new enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subledgertype') THEN
    CREATE TYPE "SubledgerType" AS ENUM ('BANK','AR','AP','INVENTORY','PAYROLL','OTHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reconciliationstatus') THEN
    CREATE TYPE "ReconciliationStatus" AS ENUM ('DRAFT','IN_PROGRESS','COMPLETED','ESCALATED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimatetype') THEN
    CREATE TYPE "EstimateType" AS ENUM ('BAD_DEBT','INVENTORY_OBSOLESCENCE','USEFUL_LIFE','DEFERRED_TAX','OTHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimatestatus') THEN
    CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT','REVIEWED','APPROVED','ARCHIVED');
  END IF;
END$$;

-- 3) Create tables
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

-- 4) Add columns to JournalEntry (if not present)
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "reviewedById" text;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "reviewedAt" timestamptz;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "reviewNotes" text;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "approvedById" text;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "approvedAt" timestamptz;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "approvalNotes" text;

CREATE INDEX IF NOT EXISTS journalentry_reviewedBy_idx ON public."JournalEntry"("reviewedById");
CREATE INDEX IF NOT EXISTS journalentry_approvedBy_idx ON public."JournalEntry"("approvedById");

-- 5) Add column to ReconciliationException to link to SubledgerReconciliation
ALTER TABLE public."ReconciliationException" ADD COLUMN IF NOT EXISTS "subledgerReconciliationId" text;
CREATE INDEX IF NOT EXISTS reconexception_subledger_recon_idx ON public."ReconciliationException"("subledgerReconciliationId");

-- 6) Foreign keys (add after tables exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'subledgerreconciliation' AND kcu.column_name = 'companyid') THEN
    ALTER TABLE public."SubledgerReconciliation" ADD CONSTRAINT "SubledgerReconciliation_company_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'estimate' AND kcu.column_name = 'companyid') THEN
    ALTER TABLE public."Estimate" ADD CONSTRAINT "Estimate_company_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ReconciliationException_subledger_recon_fkey') THEN
    ALTER TABLE public."ReconciliationException" ADD CONSTRAINT "ReconciliationException_subledger_recon_fkey" FOREIGN KEY ("subledgerReconciliationId") REFERENCES public."SubledgerReconciliation"("id") ON DELETE SET NULL;
  END IF;
  -- Optional user foreign keys (reviewedById/approvedById) - user table may be named "User"
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '"User"' OR table_name = 'User') THEN
    BEGIN
      ALTER TABLE public."JournalEntry" ADD CONSTRAINT IF NOT EXISTS "JournalEntry_reviewedBy_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"("id") ON DELETE SET NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE public."JournalEntry" ADD CONSTRAINT IF NOT EXISTS "JournalEntry_approvedBy_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"("id") ON DELETE SET NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE public."Estimate" ADD CONSTRAINT IF NOT EXISTS "Estimate_reviewedBy_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"("id") ON DELETE SET NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE public."Estimate" ADD CONSTRAINT IF NOT EXISTS "Estimate_approvedBy_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"("id") ON DELETE SET NULL;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;

COMMIT;
