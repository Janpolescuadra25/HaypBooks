-- Add optional invoice/bill/payment columns and recommended indexes
DO $$
BEGIN
  -- Invoice header fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Invoice' AND column_name='discountAmount') THEN
    ALTER TABLE public."Invoice" ADD COLUMN "discountAmount" numeric(16,4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Invoice' AND column_name='shippingAmount') THEN
    ALTER TABLE public."Invoice" ADD COLUMN "shippingAmount" numeric(16,4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Invoice' AND column_name='otherCharges') THEN
    ALTER TABLE public."Invoice" ADD COLUMN "otherCharges" numeric(16,4);
  END IF;
END$$;

DO $$
BEGIN
  -- InvoiceLine discounts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InvoiceLine' AND column_name='discountPercent') THEN
    ALTER TABLE public."InvoiceLine" ADD COLUMN "discountPercent" numeric(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InvoiceLine' AND column_name='discountAmount') THEN
    ALTER TABLE public."InvoiceLine" ADD COLUMN "discountAmount" numeric(16,4);
  END IF;
END$$;

DO $$
BEGIN
  -- PaymentReceived multi-currency fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PaymentReceived' AND column_name='currency') THEN
    ALTER TABLE public."PaymentReceived" ADD COLUMN "currency" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PaymentReceived' AND column_name='exchangeRate') THEN
    ALTER TABLE public."PaymentReceived" ADD COLUMN "exchangeRate" numeric(28,12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PaymentReceived' AND column_name='baseAmount') THEN
    ALTER TABLE public."PaymentReceived" ADD COLUMN "baseAmount" numeric(16,4);
  END IF;
END$$;

DO $$
BEGIN
  -- Bill header fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Bill' AND column_name='discountAmount') THEN
    ALTER TABLE public."Bill" ADD COLUMN "discountAmount" numeric(16,4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Bill' AND column_name='shippingAmount') THEN
    ALTER TABLE public."Bill" ADD COLUMN "shippingAmount" numeric(16,4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Bill' AND column_name='otherCharges') THEN
    ALTER TABLE public."Bill" ADD COLUMN "otherCharges" numeric(16,4);
  END IF;
END$$;

DO $$
BEGIN
  -- BillLine discounts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillLine' AND column_name='discountPercent') THEN
    ALTER TABLE public."BillLine" ADD COLUMN "discountPercent" numeric(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillLine' AND column_name='discountAmount') THEN
    ALTER TABLE public."BillLine" ADD COLUMN "discountAmount" numeric(16,4);
  END IF;
END$$;

DO $$
BEGIN
  -- BillPayment multi-currency fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillPayment' AND column_name='currency') THEN
    ALTER TABLE public."BillPayment" ADD COLUMN "currency" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillPayment' AND column_name='exchangeRate') THEN
    ALTER TABLE public."BillPayment" ADD COLUMN "exchangeRate" numeric(28,12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillPayment' AND column_name='baseAmount') THEN
    ALTER TABLE public."BillPayment" ADD COLUMN "baseAmount" numeric(16,4);
  END IF;
END$$;

-- Indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'journalentryline_tenant_account_journal_idx') THEN
    CREATE INDEX journalentryline_tenant_account_journal_idx ON public."JournalEntryLine"("tenantId","accountId","journalId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'invoice_tenant_customer_status_idx') THEN
    CREATE INDEX invoice_tenant_customer_status_idx ON public."Invoice"("tenantId","customerId","status");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'invoiceline_tenant_invoice_idx') THEN
    CREATE INDEX invoiceline_tenant_invoice_idx ON public."InvoiceLine"("tenantId","invoiceId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'bill_tenant_vendor_status_idx') THEN
    CREATE INDEX bill_tenant_vendor_status_idx ON public."Bill"("tenantId","vendorId","status");
  END IF;
END$$;
