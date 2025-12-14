-- 20251213194500_add_contact_emails_journal_customer_credit/migration.sql
-- Adds ContactEmail, ContactPhone, CustomerCredit models and links JournalEntry to subledger models
-- Idempotent migration. Run in staging, then validate in production.

BEGIN;

-- Create ContactEmail table
CREATE TABLE IF NOT EXISTS public."ContactEmail" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contactId" TEXT NOT NULL,
  "email" varchar(320) NOT NULL,
  "type" varchar(32) NOT NULL DEFAULT 'WORK',
  "isPrimary" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'contactemail_contactid_idx') THEN
    CREATE INDEX contactemail_contactid_idx ON public."ContactEmail"("contactId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactemail_contact') THEN
    ALTER TABLE public."ContactEmail" ADD CONSTRAINT fk_contactemail_contact FOREIGN KEY ("contactId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$; 

-- Create ContactPhone table
CREATE TABLE IF NOT EXISTS public."ContactPhone" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contactId" TEXT NOT NULL,
  "phone" text NOT NULL,
  "type" varchar(32) NOT NULL DEFAULT 'WORK',
  "isPrimary" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'contactphone_contactid_idx') THEN
    CREATE INDEX contactphone_contactid_idx ON public."ContactPhone"("contactId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactphone_contact') THEN
    ALTER TABLE public."ContactPhone" ADD CONSTRAINT fk_contactphone_contact FOREIGN KEY ("contactId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$; 

-- Add journalEntryId columns to major models if missing
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM (VALUES ('Invoice'), ('PaymentReceived'), ('Bill'), ('BillPayment'), ('InventoryTransaction')) AS t(name) LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = rec.name AND column_name = 'journalEntryId') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN "journalEntryId" uuid', rec.name);
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = format('fk_%I_journalentry', lower(rec.name))) THEN
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT fk_%I_journalentry FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"("id") ON DELETE SET NULL NOT VALID', rec.name, lower(rec.name));
    END IF; 
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname = format('idx_%I_journalentryid', lower(rec.name))) THEN
      EXECUTE format('CREATE INDEX idx_%I_journalentryid ON public.%I("journalEntryId")', lower(rec.name), rec.name);
    END IF;
    END IF;
  END LOOP;
END$$;

-- Create CustomerCredit and related tables
CREATE TABLE IF NOT EXISTS public."CustomerCredit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT,
  "tenantId" uuid NOT NULL,
  "customerId" TEXT NOT NULL,
  "creditNumber" text,
  "total" numeric(16,4) NOT NULL DEFAULT 0,
  "balance" numeric(16,4) NOT NULL DEFAULT 0,
  "issuedAt" timestamptz NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'DRAFT',
  "postingStatus" text NOT NULL DEFAULT 'DRAFT'
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'customercredit_tenantid_idx') THEN
    CREATE INDEX customercredit_tenantid_idx ON public."CustomerCredit"("tenantId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_tenant') THEN
    ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_customer') THEN
    ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_customer FOREIGN KEY ("customerId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_company') THEN
    ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$; 

CREATE TABLE IF NOT EXISTS public."CustomerCreditLine" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT,
  "customerCreditId" uuid NOT NULL,
  "accountId" TEXT,
  "amount" numeric(16,4) NOT NULL DEFAULT 0,
  "description" text,
  "tenantId" uuid NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'customercreditline_customercreditid_idx') THEN
    CREATE INDEX customercreditline_customercreditid_idx ON public."CustomerCreditLine"("customerCreditId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_credit') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_credit FOREIGN KEY ("customerCreditId") REFERENCES public."CustomerCredit"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_company') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_account') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_account FOREIGN KEY ("accountId") REFERENCES public."Account"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_tenant') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$; 

CREATE TABLE IF NOT EXISTS public."CustomerCreditApplication" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "creditId" uuid NOT NULL,
  "invoiceId" uuid NOT NULL,
  "amount" numeric(16,4) NOT NULL DEFAULT 0,
  "appliedAt" timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'customercreditapplication_creditid_idx') THEN
    CREATE INDEX customercreditapplication_creditid_idx ON public."CustomerCreditApplication"("creditId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'customercreditapplication_invoiceid_idx') THEN
    CREATE INDEX customercreditapplication_invoiceid_idx ON public."CustomerCreditApplication"("invoiceId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_tenant') THEN
    ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_credit') THEN
    ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_credit FOREIGN KEY ("creditId") REFERENCES public."CustomerCredit"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_invoice') THEN
    ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_invoice FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$; 

COMMIT;


-- Notes:
-- 1) This migration is intentionally idempotent: creates tables and columns only if missing.
-- 2) After applying on staging, run validation scripts and migration checks (validate-company-fks).
-- 3) Some columns are NOT NULL in the Prisma schema but initially added as nullable in SQL to avoid blocking backfill; we can make them NOT NULL later when safe.
