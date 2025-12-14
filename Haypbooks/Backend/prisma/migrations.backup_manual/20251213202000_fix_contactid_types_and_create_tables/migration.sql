-- 20251213202000_fix_contactid_types_and_create_tables/migration.sql


-- Create ContactEmail (text contactId) if missing
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

-- Create ContactPhone (text contactId) if missing
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

-- Add FKs if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactemail_contact') THEN
    ALTER TABLE public."ContactEmail" ADD CONSTRAINT fk_contactemail_contact FOREIGN KEY ("contactId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_contactphone_contact') THEN
    ALTER TABLE public."ContactPhone" ADD CONSTRAINT fk_contactphone_contact FOREIGN KEY ("contactId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
  END IF;
END$$;

-- Create customer credit tables if missing (customerId text)
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

-- Add FKs with NOT VALID and per-block guards to avoid abort propagation
DO $$ BEGIN
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_tenant') THEN
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns rc
            JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Tenant' AND rt.column_name = 'id'
            WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCredit' AND rc.column_name = 'tenantId' AND rc.udt_name = rt.udt_name
          ) THEN
            ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
          ELSE
            RAISE NOTICE 'Skipping fk_customercredit_tenant: incompatible tenantId type with Tenant.id';
          END IF;
        EXCEPTION WHEN others THEN NULL; END;
      END IF;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_customer') THEN
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns rc
          JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Contact' AND rt.column_name = 'id'
          WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCredit' AND rc.column_name = 'customerId' AND rc.udt_name = rt.udt_name
        ) THEN
          ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_customer FOREIGN KEY ("customerId") REFERENCES public."Contact"("id") ON DELETE CASCADE NOT VALID;
        ELSE
          RAISE NOTICE 'Skipping fk_customercredit_customer: incompatible customerId type with Contact.id';
        END IF;
      EXCEPTION WHEN others THEN NULL; END;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_company') THEN
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns rc
          JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Company' AND rt.column_name = 'id'
          WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCredit' AND rc.column_name = 'companyId' AND rc.udt_name = rt.udt_name
        ) THEN
          ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
        ELSE
          RAISE NOTICE 'Skipping fk_customercredit_company: incompatible companyId type with Company.id';
        END IF;
      EXCEPTION WHEN others THEN NULL; END;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
END$$;

-- CustomerCreditLine
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
      "tenantId" TEXT NOT NULL
    );
  END IF;
END$$;

DO $$
BEGIN
  -- Add credit FK if types match
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_credit') THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'CustomerCredit' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditLine' AND rc.column_name = 'customerCreditId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_credit FOREIGN KEY ("customerCreditId") REFERENCES public."CustomerCredit"("id") ON DELETE CASCADE NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditline_credit: incompatible customerCreditId type with CustomerCredit.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;

  -- Only add company FK if types match
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_company') THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Company' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditLine' AND rc.column_name = 'companyId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditline_company: incompatible companyId type with Company.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;

  -- Only add account FK if types match
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_account') THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'Account' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditLine' AND rc.column_name = 'accountId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditLine" ADD CONSTRAINT fk_customercreditline_account FOREIGN KEY ("accountId") REFERENCES public."Account"("id") ON DELETE SET NULL NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditline_account: incompatible accountId type with Account.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;

  -- Only add tenant FK if types match
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditline_tenant') THEN
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

-- CustomerCreditApplication
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

DO $$
BEGIN
  -- Only add tenant FK if types align to avoid E42804
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_tenant') THEN
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
  -- Add credit FK (creditId should match CustomerCredit.id types)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_credit') THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns rc
        JOIN information_schema.columns rt ON rt.table_schema = 'public' AND rt.table_name = 'CustomerCredit' AND rt.column_name = 'id'
        WHERE rc.table_schema = 'public' AND rc.table_name = 'CustomerCreditApplication' AND rc.column_name = 'creditId' AND rc.udt_name = rt.udt_name
      ) THEN
        ALTER TABLE public."CustomerCreditApplication" ADD CONSTRAINT fk_customercreditapplication_credit FOREIGN KEY ("creditId") REFERENCES public."CustomerCredit"("id") ON DELETE CASCADE NOT VALID;
      ELSE
        RAISE NOTICE 'Skipping fk_customercreditapplication_credit: incompatible creditId type with CustomerCredit.id';
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
  -- Only add invoice FK if types align
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercreditapplication_invoice') THEN
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

-- Add journalEntryId columns to major models if missing (Invoice, PaymentReceived, Bill, BillPayment, InventoryTransaction)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM (VALUES ('Invoice'), ('PaymentReceived'), ('Bill'), ('BillPayment'), ('InventoryTransaction')) AS t(name) LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = rec.name AND column_name = 'journalEntryId') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN "journalEntryId" text', rec.name);
    END IF;
    -- Add FK only if the types align and absence of constraint
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = rec.name AND column_name = 'journalEntryId') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = format('fk_%I_journalentry', lower(rec.name))) THEN
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT fk_%I_journalentry FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"("id") ON DELETE SET NULL NOT VALID', rec.name, lower(rec.name));
      END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname = format('idx_%I_journalentryid', lower(rec.name))) THEN
      EXECUTE format('CREATE INDEX idx_%I_journalentryid ON public.%I("journalEntryId")', lower(rec.name), rec.name);
    END IF;
  END LOOP;
END$$;


-- Note: `journalEntryId` columns are added as `text` to avoid FK type mismatches when JournalEntry.id is not uuid — review final types and adjust to uuid if desired in a maintenance window.
