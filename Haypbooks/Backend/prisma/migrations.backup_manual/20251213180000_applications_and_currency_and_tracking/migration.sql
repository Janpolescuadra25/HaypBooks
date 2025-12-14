-- 20251213180000_applications_and_currency_and_tracking/migration.sql
-- Adds payment application tables, multi-currency fields, tracking dimension columns, and tenant-user role linking

-- New tables: InvoicePaymentApplication, BillPaymentApplication, RecurringInvoice
CREATE TABLE IF NOT EXISTS public."InvoicePaymentApplication" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  amount numeric(16,4) NOT NULL,
  "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS invoice_payment_app_tenant_invoice_idx ON public."InvoicePaymentApplication" ("tenantId", "invoiceId");
CREATE INDEX IF NOT EXISTS invoice_payment_app_tenant_payment_idx ON public."InvoicePaymentApplication" ("tenantId", "paymentId");
DO $$
DECLARE
  tbl RECORD;
  tables TEXT[] := ARRAY['InvoiceLine','BillLine','JournalEntryLine','PurchaseOrderLine','InventoryTransactionLine'];
  t TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoicepaymentapplication_invoice') THEN
    ALTER TABLE public."InvoicePaymentApplication" ADD CONSTRAINT fk_invoicepaymentapplication_invoice FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoicepaymentapplication_payment') THEN
    ALTER TABLE public."InvoicePaymentApplication" ADD CONSTRAINT fk_invoicepaymentapplication_payment FOREIGN KEY ("paymentId") REFERENCES public."PaymentReceived"(id) ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public."BillPaymentApplication" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "billId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  amount numeric(16,4) NOT NULL,
  "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS bill_payment_app_tenant_bill_idx ON public."BillPaymentApplication" ("tenantId", "billId");
CREATE INDEX IF NOT EXISTS bill_payment_app_tenant_payment_idx ON public."BillPaymentApplication" ("tenantId", "paymentId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_billpaymentapplication_bill') THEN
    ALTER TABLE public."BillPaymentApplication" ADD CONSTRAINT fk_billpaymentapplication_bill FOREIGN KEY ("billId") REFERENCES public."Bill"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_billpaymentapplication_payment') THEN
    ALTER TABLE public."BillPaymentApplication" ADD CONSTRAINT fk_billpaymentapplication_payment FOREIGN KEY ("paymentId") REFERENCES public."BillPayment"(id) ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public."RecurringInvoice" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "companyId" TEXT,
  "customerId" TEXT NOT NULL,
  frequency TEXT NOT NULL,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "nextRun" TIMESTAMP WITH TIME ZONE NOT NULL,
  "templateData" JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS recurring_invoice_tenant_next_run_idx ON public."RecurringInvoice" ("tenantId", "nextRun");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_recurringinvoice_tenant') THEN
    ALTER TABLE public."RecurringInvoice" ADD CONSTRAINT fk_recurringinvoice_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_recurringinvoice_company') THEN
    ALTER TABLE public."RecurringInvoice" ADD CONSTRAINT fk_recurringinvoice_company FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$ LANGUAGE plpgsql;

-- Add multi-currency fields
DO $$ BEGIN
  -- Invoices
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invoice' AND column_name='currency') THEN
    ALTER TABLE public."Invoice" ADD COLUMN "currency" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invoice' AND column_name='exchangeRate') THEN
    ALTER TABLE public."Invoice" ADD COLUMN "exchangeRate" numeric(28,12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invoice' AND column_name='baseTotal') THEN
    ALTER TABLE public."Invoice" ADD COLUMN "baseTotal" numeric(16,4);
  END IF;

  -- Bills
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Bill' AND column_name='currency') THEN
    ALTER TABLE public."Bill" ADD COLUMN "currency" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Bill' AND column_name='exchangeRate') THEN
    ALTER TABLE public."Bill" ADD COLUMN "exchangeRate" numeric(28,12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Bill' AND column_name='baseTotal') THEN
    ALTER TABLE public."Bill" ADD COLUMN "baseTotal" numeric(16,4);
  END IF;

  -- JournalEntry
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='JournalEntry' AND column_name='currency') THEN
    ALTER TABLE public."JournalEntry" ADD COLUMN "currency" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='JournalEntry' AND column_name='exchangeRate') THEN
    ALTER TABLE public."JournalEntry" ADD COLUMN "exchangeRate" numeric(28,12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='JournalEntry' AND column_name='baseTotal') THEN
    ALTER TABLE public."JournalEntry" ADD COLUMN "baseTotal" numeric(16,4);
  END IF;
END$$ LANGUAGE plpgsql;

-- Tracking dimensions: add classId, locationId, projectId to common line tables
DO $$
DECLARE
  tables TEXT[] := ARRAY['InvoiceLine','BillLine','JournalEntryLine','PurchaseOrderLine','InventoryTransactionLine'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'classId') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN "classId" TEXT', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'locationId') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN "locationId" TEXT', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'projectId') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN "projectId" TEXT', t);
    END IF;
    -- Create indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I("classId")', concat(t,'_class_idx'), t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I("locationId")', concat(t,'_location_idx'), t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I("projectId")', concat(t,'_project_idx'), t);
    -- Add FK constraints NOT VALID
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY("classId") REFERENCES public."Class"(id) NOT VALID', t, concat('fk_',t,'_class'));
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY("locationId") REFERENCES public."Location"(id) NOT VALID', t, concat('fk_',t,'_location'));
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY("projectId") REFERENCES public."Project"(id) NOT VALID', t, concat('fk_',t,'_project'));
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END$$ LANGUAGE plpgsql;

-- Add roleId to TenantUser and FK to Role
ALTER TABLE public."TenantUser" ADD COLUMN IF NOT EXISTS "roleId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_role') THEN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_role FOREIGN KEY ("roleId") REFERENCES public."Role"(id) NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$ LANGUAGE plpgsql;

-- Add purchaseOrderLineId to LineTax (already exists in Prisma change) if needed
ALTER TABLE public."LineTax" ADD COLUMN IF NOT EXISTS "purchaseOrderLineId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_linetax_pol') THEN
    ALTER TABLE public."LineTax" ADD CONSTRAINT fk_linetax_pol FOREIGN KEY ("purchaseOrderLineId") REFERENCES public."PurchaseOrderLine"(id) NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$ LANGUAGE plpgsql;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS invoice_currency_idx ON public."Invoice"("currency");
CREATE INDEX IF NOT EXISTS bill_currency_idx ON public."Bill"("currency");
CREATE INDEX IF NOT EXISTS journalentry_currency_idx ON public."JournalEntry"("currency");

