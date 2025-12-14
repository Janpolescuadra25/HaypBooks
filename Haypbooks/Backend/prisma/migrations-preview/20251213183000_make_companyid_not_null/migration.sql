-- 20251213183000_make_companyid_not_null/migration.sql
-- Makes companyId non-nullable for core transactional tables after backfill
-- WARNING: Run only after the backfill script and FK validation have completed.

DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'Invoice','InvoiceLine','Bill','BillLine','PurchaseOrder','PurchaseOrderLine',
    'VendorCredit','VendorCreditLine','JournalEntry','JournalEntryLine','InventoryTransaction','InventoryTransactionLine',
    'StockLocation','StockLevel','BillPayment','VendorPaymentMethod'
  ];
  t TEXT;
  vcount INT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Only attempt change if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = t AND column_name = 'companyId') THEN
      EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE "companyId" IS NULL', t) INTO vcount;
      RAISE NOTICE 'Table % row_count_missing_company = %', t, vcount;
      IF vcount = 0 THEN
        BEGIN
          EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "companyId" SET NOT NULL', t);
        EXCEPTION WHEN others THEN
          RAISE WARNING 'Could not set NOT NULL on % due to %', t, SQLERRM;
        END;
      ELSE
        RAISE NOTICE 'Skipping ALTER NOT NULL on % because % rows have NULL companyId', t, vcount;
      END IF;
    END IF;
  END LOOP;
END $$;
