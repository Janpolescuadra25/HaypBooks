-- Migration: 002_constraints_and_indexes.sql
-- Purpose: Add DB-level CHECK constraints and useful search / partial indexes.
-- IMPORTANT: Review and run this in staging first. Some checks will RAISE EXCEPTION if violations are found — resolve rows first.

-- === 1) XOR / Ownership checks & scope rules ===
-- OnboardingStep: exactly one of companyId or practiceId must be set
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "OnboardingStep" WHERE ("companyId" IS NULL AND "practiceId" IS NULL) OR ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL)) THEN
    RAISE EXCEPTION 'OnboardingStep XOR violation: some rows have neither or both companyId and practiceId set. Resolve before applying constraint.';
  END IF;
  ALTER TABLE "OnboardingStep" ADD CONSTRAINT onboardingstep_company_practice_xor CHECK (("companyId" IS NOT NULL AND "practiceId" IS NULL) OR ("companyId" IS NULL AND "practiceId" IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, ignore
  NULL;
END;
$$;

-- Subscription: exactly one of companyId or practiceId must be set
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Subscription" WHERE ("companyId" IS NULL AND "practiceId" IS NULL) OR ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL)) THEN
    RAISE EXCEPTION 'Subscription XOR violation: some rows have neither or both companyId and practiceId set. Resolve before applying constraint.';
  END IF;
  ALTER TABLE "Subscription" ADD CONSTRAINT subscription_company_practice_xor CHECK (("companyId" IS NOT NULL AND "practiceId" IS NULL) OR ("companyId" IS NULL AND "practiceId" IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- Task: ensure companyId and practiceId are not both set (either or neither allowed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Task" WHERE "companyId" IS NOT NULL AND "practiceId" IS NOT NULL) THEN
    RAISE EXCEPTION 'Task scope violation: some rows have both companyId and practiceId set. Resolve before applying constraint.';
  END IF;
  ALTER TABLE "Task" ADD CONSTRAINT task_company_practice_not_both CHECK (NOT ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- RecurringSchedule: ensure not both companyId and practiceId
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "RecurringSchedule" WHERE "companyId" IS NOT NULL AND "practiceId" IS NOT NULL) THEN
    RAISE EXCEPTION 'RecurringSchedule scope violation: some rows have both companyId and practiceId set. Resolve before applying constraint.';
  END IF;
  ALTER TABLE "RecurringSchedule" ADD CONSTRAINT recurringschedule_company_practice_not_both CHECK (NOT ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- === 2) Date ordering checks ===
-- FixedAssetSchedule: startDate <= endDate when endDate is not null
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "FixedAssetSchedule" WHERE "endDate" IS NOT NULL AND "startDate" > "endDate") THEN
    RAISE EXCEPTION 'FixedAssetSchedule date ordering violation found. Resolve startDate/endDate values before adding constraint.';
  END IF;
  ALTER TABLE "FixedAssetSchedule" ADD CONSTRAINT fixedassetschedule_start_before_end CHECK ("endDate" IS NULL OR "startDate" <= "endDate");
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- ConsolidationGroupMember: effectiveFrom <= effectiveTo when effectiveTo is not null
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "ConsolidationGroupMember" WHERE "effectiveTo" IS NOT NULL AND "effectiveFrom" > "effectiveTo") THEN
    RAISE EXCEPTION 'ConsolidationGroupMember date ordering violation found. Fix rows before applying constraint.';
  END IF;
  ALTER TABLE "ConsolidationGroupMember" ADD CONSTRAINT consolidation_group_member_dates CHECK ("effectiveTo" IS NULL OR "effectiveFrom" <= "effectiveTo");
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- YearEndClose: startedAt <= completedAt if both set
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "YearEndClose" WHERE "startedAt" IS NOT NULL AND "completedAt" IS NOT NULL AND "startedAt" > "completedAt") THEN
    RAISE EXCEPTION 'YearEndClose date ordering violation found. Fix rows before applying constraint.';
  END IF;
  ALTER TABLE "YearEndClose" ADD CONSTRAINT yearendclose_started_before_completed CHECK ("startedAt" IS NULL OR "completedAt" IS NULL OR "startedAt" <= "completedAt");
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- === 3) Non-negative / Range checks ===
-- Invoice.totalAmount and balance
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "Invoice" WHERE "total" < 0) THEN
    RAISE EXCEPTION 'Invoice negative total found. Resolve rows before applying constraint.';
  END IF;
  ALTER TABLE "Invoice" ADD CONSTRAINT invoice_total_nonnegative CHECK ("total" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- PaymentReceived.amount non-negative
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "PaymentReceived" WHERE "amount" < 0) THEN
    RAISE EXCEPTION 'PaymentReceived negative amounts found. Resolve rows before applying constraint.';
  END IF;
  ALTER TABLE "PaymentReceived" ADD CONSTRAINT paymentreceived_amount_nonnegative CHECK ("amount" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- JournalEntryLine debit and credit non-negative
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "JournalEntryLine" WHERE "debit" < 0 OR "credit" < 0) THEN
    RAISE EXCEPTION 'JournalEntryLine negative debit/credit found. Resolve rows before applying constraint.';
  END IF;
  ALTER TABLE "JournalEntryLine" ADD CONSTRAINT journalentryline_nonnegative CHECK ("debit" >= 0 AND "credit" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- ExchangeRate rate > 0
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "ExchangeRate" WHERE "rate" <= 0) THEN
    RAISE EXCEPTION 'ExchangeRate non-positive rate found. Resolve rows before applying constraint.';
  END IF;
  ALTER TABLE "ExchangeRate" ADD CONSTRAINT exchangerate_positive_rate CHECK ("rate" > 0);
EXCEPTION WHEN duplicate_object THEN NULL; END;
$$;

-- === 4) Full-text and partial indexes (Postgres-specific) ===
-- Note: For large tables, prefer creating CONCURRENTLY during maintenance windows.
-- Customer displayName full-text
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_customer_displayname_gin') THEN
    CREATE INDEX idx_customer_displayname_gin ON "Customer" USING gin (to_tsvector('english', COALESCE("displayName", '')));
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'Skipping creation of idx_customer_displayname_gin: %', SQLERRM; END;
$$;

-- InvoiceLine description full-text
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_invoiceline_description_gin') THEN
    CREATE INDEX idx_invoiceline_description_gin ON "InvoiceLine" USING gin (to_tsvector('english', COALESCE("description", '')));
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'Skipping creation of idx_invoiceline_description_gin: %', SQLERRM; END;
$$;

-- JournalEntry description full-text
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_journalentry_description_gin') THEN
    CREATE INDEX idx_journalentry_description_gin ON "JournalEntry" USING gin (to_tsvector('english', COALESCE("description", '')));
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'Skipping creation of idx_journalentry_description_gin: %', SQLERRM; END;
$$;

-- JournalEntryLine description full-text
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_journalentryline_description_gin') THEN
    CREATE INDEX idx_journalentryline_description_gin ON "JournalEntryLine" USING gin (to_tsvector('english', COALESCE("description", '')));
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'Skipping creation of idx_journalentryline_description_gin: %', SQLERRM; END;
$$;

-- Partial index: Invoice active (deletedAt IS NULL) for common queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_invoice_company_status_due_not_deleted') THEN
    CREATE INDEX idx_invoice_company_status_due_not_deleted ON "Invoice" ("companyId", "status", "dueDate") WHERE "deletedAt" IS NULL;
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'Skipping creation of idx_invoice_company_status_due_not_deleted: %', SQLERRM; END;
$$;

-- Partial index: PaymentReceived active
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_paymentreceived_company_date_not_deleted') THEN
    CREATE INDEX idx_paymentreceived_company_date_not_deleted ON "PaymentReceived" ("companyId", "paymentDate") WHERE "deletedAt" IS NULL;
  END IF;
EXCEPTION WHEN others THEN RAISE NOTICE 'Skipping creation of idx_paymentreceived_company_date_not_deleted: %', SQLERRM; END;
$$;

-- === 5) Notes ===
-- If any of the RAISE EXCEPTION messages fire, fix the offending rows in staging before running in production.
-- For extremely large tables, consider creating the indexes CONCURRENTLY outside of a transaction using:
-- CREATE INDEX CONCURRENTLY idx_name ON table USING gin (...);

-- END 002
