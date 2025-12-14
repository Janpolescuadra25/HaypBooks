-- Ensure tracking columns are present on line tables (InvoiceLine, BillLine, JournalEntryLine, PurchaseOrderLine, InventoryTransactionLine)
DO $$
BEGIN
  PERFORM 1;
  -- InvoiceLine
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InvoiceLine' AND column_name='classId') THEN
    ALTER TABLE public."InvoiceLine" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InvoiceLine' AND column_name='locationId') THEN
    ALTER TABLE public."InvoiceLine" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InvoiceLine' AND column_name='projectId') THEN
    ALTER TABLE public."InvoiceLine" ADD COLUMN "projectId" TEXT;
  END IF;

  -- BillLine
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillLine' AND column_name='classId') THEN
    ALTER TABLE public."BillLine" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillLine' AND column_name='locationId') THEN
    ALTER TABLE public."BillLine" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BillLine' AND column_name='projectId') THEN
    ALTER TABLE public."BillLine" ADD COLUMN "projectId" TEXT;
  END IF;

  -- JournalEntryLine
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='JournalEntryLine' AND column_name='classId') THEN
    ALTER TABLE public."JournalEntryLine" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='JournalEntryLine' AND column_name='locationId') THEN
    ALTER TABLE public."JournalEntryLine" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='JournalEntryLine' AND column_name='projectId') THEN
    ALTER TABLE public."JournalEntryLine" ADD COLUMN "projectId" TEXT;
  END IF;

  -- PurchaseOrderLine
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PurchaseOrderLine' AND column_name='classId') THEN
    ALTER TABLE public."PurchaseOrderLine" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PurchaseOrderLine' AND column_name='locationId') THEN
    ALTER TABLE public."PurchaseOrderLine" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PurchaseOrderLine' AND column_name='projectId') THEN
    ALTER TABLE public."PurchaseOrderLine" ADD COLUMN "projectId" TEXT;
  END IF;

  -- InventoryTransactionLine
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InventoryTransactionLine' AND column_name='classId') THEN
    ALTER TABLE public."InventoryTransactionLine" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InventoryTransactionLine' AND column_name='locationId') THEN
    ALTER TABLE public."InventoryTransactionLine" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='InventoryTransactionLine' AND column_name='projectId') THEN
    ALTER TABLE public."InventoryTransactionLine" ADD COLUMN "projectId" TEXT;
  END IF;
END$$;

-- Create indexes on class/location/project for line tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='invoiceline_class_idx') THEN
    CREATE INDEX invoiceline_class_idx ON public."InvoiceLine"("classId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='invoiceline_location_idx') THEN
    CREATE INDEX invoiceline_location_idx ON public."InvoiceLine"("locationId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='invoiceline_project_idx') THEN
    CREATE INDEX invoiceline_project_idx ON public."InvoiceLine"("projectId");
  END IF;
END$$;

-- Add FKs where possible (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_invoiceline_class') THEN
    BEGIN
      ALTER TABLE public."InvoiceLine" ADD CONSTRAINT fk_invoiceline_class FOREIGN KEY ("classId") REFERENCES public."Class"(id) NOT VALID;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_invoiceline_location') THEN
    BEGIN
      ALTER TABLE public."InvoiceLine" ADD CONSTRAINT fk_invoiceline_location FOREIGN KEY ("locationId") REFERENCES public."Location"(id) NOT VALID;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_invoiceline_project') THEN
    BEGIN
      ALTER TABLE public."InvoiceLine" ADD CONSTRAINT fk_invoiceline_project FOREIGN KEY ("projectId") REFERENCES public."Project"(id) NOT VALID;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END$$;
