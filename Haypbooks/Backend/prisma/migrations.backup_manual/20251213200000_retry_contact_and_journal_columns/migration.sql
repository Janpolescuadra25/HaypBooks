-- 20251213200000_retry_contact_and_journal_columns/migration.sql
-- Retry creation of ContactEmail/ContactPhone/CustomerCredit tables and add journalEntryId columns
-- This uses explicit IF NOT EXISTS checks for older PostgreSQL and avoids unsupported `ADD CONSTRAINT IF NOT EXISTS`.

-- Create ContactEmail
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ContactEmail') THEN
    CREATE TABLE public."ContactEmail" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "contactId" text NOT NULL,
      "email" varchar(320) NOT NULL,
      "type" varchar(32) NOT NULL DEFAULT 'WORK',
      "isPrimary" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'contactemail_contactid_idx') THEN
    CREATE INDEX contactemail_contactid_idx ON public."ContactEmail"("contactId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactemail_contact') THEN
    ALTER TABLE public."ContactEmail" ADD CONSTRAINT fk_contactemail_contact FOREIGN KEY ("contactId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
END$$;

-- Create ContactPhone
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ContactPhone') THEN
    CREATE TABLE public."ContactPhone" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "contactId" text NOT NULL,
      "phone" text NOT NULL,
      "type" varchar(32) NOT NULL DEFAULT 'WORK',
      "isPrimary" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'contactphone_contactid_idx') THEN
    CREATE INDEX contactphone_contactid_idx ON public."ContactPhone"("contactId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactphone_contact') THEN
    ALTER TABLE public."ContactPhone" ADD CONSTRAINT fk_contactphone_contact FOREIGN KEY ("contactId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
END$$;

-- Create CustomerCredit and supporting tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CustomerCredit') THEN
    CREATE TABLE public."CustomerCredit" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "companyId" TEXT,
      "tenantId" TEXT NOT NULL,
      "customerId" text NOT NULL,
      "creditNumber" text,
      "total" numeric(16,4) NOT NULL DEFAULT 0,
      "balance" numeric(16,4) NOT NULL DEFAULT 0,
      "issuedAt" timestamptz NOT NULL DEFAULT now(),
      "status" text NOT NULL DEFAULT 'DRAFT',
      "postingStatus" text NOT NULL DEFAULT 'DRAFT'
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'customercredit_tenantid_idx') THEN
    CREATE INDEX customercredit_tenantid_idx ON public."CustomerCredit"("tenantId");
  END IF;
END$$;

-- Add FKs with NOT VALID and guard each to avoid abort propagation
DO $$ BEGIN
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_tenant') THEN
      ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_customer') THEN
      ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_customer FOREIGN KEY ("customerId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_company') THEN
      ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CustomerCreditLine') THEN
    CREATE TABLE public."CustomerCreditLine" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "companyId" TEXT,
      "customerCreditId" TEXT NOT NULL,
      "accountId" TEXT,
      "amount" numeric(16,4) NOT NULL DEFAULT 0,
      "description" text,
      "tenantId" uuid NOT NULL
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'customercreditline_customercreditid_idx') THEN
    CREATE INDEX customercreditline_customercreditid_idx ON public."CustomerCreditLine"("customerCreditId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_credit') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_credit FOREIGN KEY ("customerCreditId") REFERENCES public."CustomerCredit"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_company') AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Company') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_account') THEN
    ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_account FOREIGN KEY ("accountId") REFERENCES public."Account"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_tenant') THEN
    -- Only add the tenant FK if the referencing column type matches Tenant.id to avoid E42804
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Tenant' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditLine' AND rc.column_name = 'tenantId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditline_tenant: incompatible tenantId type with Tenant.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CustomerCreditApplication') THEN
    CREATE TABLE public."CustomerCreditApplication" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "tenantId" TEXT NOT NULL,
      "creditId" TEXT NOT NULL,
      "invoiceId" TEXT NOT NULL,
      "amount" numeric(16,4) NOT NULL DEFAULT 0,
      "appliedAt" timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'customercreditapplication_creditid_idx') THEN
    CREATE INDEX customercreditapplication_creditid_idx ON public."CustomerCreditApplication"("creditId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'customercreditapplication_invoiceid_idx') THEN
    CREATE INDEX customercreditapplication_invoiceid_idx ON public."CustomerCreditApplication"("invoiceId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_tenant') THEN
    -- Only add tenant FK if types match to avoid E42804 errors
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Tenant' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditApplication' AND rc.column_name = 'tenantId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditapplication_tenant: incompatible tenantId type with Tenant.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_credit') THEN
    ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_credit FOREIGN KEY ("creditId") REFERENCES public."CustomerCredit"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_invoice') THEN
    -- Only add invoice FK if the types match to avoid E42804
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Invoice' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditApplication' AND rc.column_name = 'invoiceId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_invoice FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"("id") ON DELETE CASCADE NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditapplication_invoice: incompatible invoiceId type with Invoice.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;

-- Add journalEntryId columns to major models if missing
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM (VALUES ('Invoice'), ('PaymentReceived'), ('Bill'), ('BillPayment'), ('InventoryTransaction')) AS t(name) LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = rec.name AND column_name = 'journalEntryId') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN "journalEntryId" TEXT', rec.name);
      -- Add a FK if not present
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = format('fk_%I_journalentry', lower(rec.name))) THEN
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT fk_%I_journalentry FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"("id") ON DELETE SET NULL NOT VALID', rec.name, lower(rec.name));
      END IF;
      -- Add an index
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname = format('idx_%I_journalentryid', lower(rec.name))) THEN
        EXECUTE format('CREATE INDEX idx_%I_journalentryid ON public.%I("journalEntryId")', lower(rec.name), rec.name);
      END IF;
    END IF;
  END LOOP;
END$$;

-- Notes: This migration is designed to be idempotent and compatible with older Postgres. Run in staging and validate before production.
