-- Phase 3 migration: Accounting core (COA, journal entries, invoices, customers, vendors)
-- Run with: psql $DATABASE_URL -f phase3-accounting.sql

CREATE TABLE IF NOT EXISTS "ChartOfAccount" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL,
  "accountCode" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountType" TEXT NOT NULL,
  "parentAccountId" TEXT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_coa_company FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS coa_company_code_idx ON "ChartOfAccount"("companyId", "accountCode");

CREATE TABLE IF NOT EXISTS "JournalEntry" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_journal_company FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS journal_company_date_idx ON "JournalEntry"("companyId", date);

CREATE TABLE IF NOT EXISTS "JournalEntryLine" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "journalEntryId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "debitAmount" NUMERIC NOT NULL DEFAULT 0,
  "creditAmount" NUMERIC NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_jel_entry FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"(id) ON DELETE CASCADE,
  CONSTRAINT fk_jel_account FOREIGN KEY ("accountId") REFERENCES "ChartOfAccount"(id) ON DELETE CASCADE
);
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='JournalEntryLine' AND column_name='journalEntryId'
  ) THEN
    CREATE INDEX IF NOT EXISTS jel_entry_idx ON "JournalEntryLine"("journalEntryId");
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "Customer" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_customer_company FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Vendor" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_vendor_company FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  "dueDate" TIMESTAMP WITH TIME ZONE NULL,
  "totalAmount" NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_invoice_company FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_customer FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS invoice_company_number_idx ON "Invoice"("companyId", "invoiceNumber");

CREATE TABLE IF NOT EXISTS "InvoiceLine" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceId" TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  "unitPrice" NUMERIC NOT NULL,
  "totalPrice" NUMERIC NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_invoiceline_invoice FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id) ON DELETE CASCADE
);
