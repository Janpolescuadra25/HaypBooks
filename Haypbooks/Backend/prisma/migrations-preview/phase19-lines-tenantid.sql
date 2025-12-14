-- phase19-lines-tenantid.sql
-- Add tenantId to various line/child tables and populate values from parent tables

ALTER TABLE public."InvoiceLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
-- Guarded backfill to avoid errors if parent columns differ or nulls exist
DO $$ BEGIN
  BEGIN
    UPDATE public."InvoiceLine" SET "tenantId" = i."tenantId"
    FROM public."Invoice" i
    WHERE i."id" = public."InvoiceLine"."invoiceId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."InvoiceLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "invoiceline_tenant_idx" ON public."InvoiceLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceLine_tenant_fkey') THEN
    ALTER TABLE public."InvoiceLine" ADD CONSTRAINT "InvoiceLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."BillLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."BillLine" SET "tenantId" = b."tenantId"
    FROM public."Bill" b
    WHERE b."id" = public."BillLine"."billId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."BillLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "billline_tenant_idx" ON public."BillLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BillLine_tenant_fkey') THEN
    ALTER TABLE public."BillLine" ADD CONSTRAINT "BillLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."PurchaseOrderLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."PurchaseOrderLine" SET "tenantId" = p."tenantId"
    FROM public."PurchaseOrder" p
    WHERE p."id" = public."PurchaseOrderLine"."purchaseOrderId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."PurchaseOrderLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "poline_tenant_idx" ON public."PurchaseOrderLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PurchaseOrderLine_tenant_fkey') THEN
    ALTER TABLE public."PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."JournalEntryLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."JournalEntryLine" SET "tenantId" = j."tenantId"
    FROM public."JournalEntry" j
    WHERE j."id" = public."JournalEntryLine"."journalId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."JournalEntryLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "journalentryline_tenant_idx" ON public."JournalEntryLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalEntryLine_tenant_fkey') THEN
    ALTER TABLE public."JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."VendorCreditLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."VendorCreditLine" SET "tenantId" = v."tenantId"
    FROM public."VendorCredit" v
    WHERE v."id" = public."VendorCreditLine"."vendorCreditId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."VendorCreditLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "vendorcreditline_tenant_idx" ON public."VendorCreditLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VendorCreditLine_tenant_fkey') THEN
    ALTER TABLE public."VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."PaycheckLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."PaycheckLine" SET "tenantId" = p."tenantId"
    FROM public."Paycheck" p
    WHERE p."id" = public."PaycheckLine"."paycheckId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."PaycheckLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "paycheckline_tenant_idx" ON public."PaycheckLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaycheckLine_tenant_fkey') THEN
    ALTER TABLE public."PaycheckLine" ADD CONSTRAINT "PaycheckLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."BudgetLine" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."BudgetLine" SET "tenantId" = b."tenantId"
    FROM public."Budget" b
    WHERE b."id" = public."BudgetLine"."budgetId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."BudgetLine" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "budgetline_tenant_idx" ON public."BudgetLine" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BudgetLine_tenant_fkey') THEN
    ALTER TABLE public."BudgetLine" ADD CONSTRAINT "BudgetLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."FixedAssetDepreciation" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."FixedAssetDepreciation" SET "tenantId" = f."tenantId"
    FROM public."FixedAsset" f
    WHERE f."id" = public."FixedAssetDepreciation"."assetId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."FixedAssetDepreciation" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "fixedassetdepr_tenant_idx" ON public."FixedAssetDepreciation" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FixedAssetDepreciation_tenant_fkey') THEN
    ALTER TABLE public."FixedAssetDepreciation" ADD CONSTRAINT "FixedAssetDepreciation_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."BankTransaction" ADD COLUMN IF NOT EXISTS "tenantId" text;
DO $$ BEGIN
  BEGIN
    UPDATE public."BankTransaction" SET "tenantId" = b."tenantId"
    FROM public."BankAccount" b
    WHERE b."id" = public."BankTransaction"."bankAccountId";
  EXCEPTION WHEN others THEN NULL; END;
END$$;
ALTER TABLE public."BankTransaction" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "banktransaction_tenant_idx" ON public."BankTransaction" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BankTransaction_tenant_fkey') THEN
    ALTER TABLE public."BankTransaction" ADD CONSTRAINT "BankTransaction_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Apply RLS policies for these newly tenant-scoped tables
DO $$
BEGIN
  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'InvoiceLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_InvoiceLine', 'public', 'InvoiceLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'BillLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_BillLine', 'public', 'BillLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'PurchaseOrderLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_PurchaseOrderLine', 'public', 'PurchaseOrderLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'JournalEntryLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_JournalEntryLine', 'public', 'JournalEntryLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'VendorCreditLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_VendorCreditLine', 'public', 'VendorCreditLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'PaycheckLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_PaycheckLine', 'public', 'PaycheckLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'BudgetLine');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_BudgetLine', 'public', 'BudgetLine', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'FixedAssetDepreciation');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_FixedAssetDepreciation', 'public', 'FixedAssetDepreciation', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'BankTransaction');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_BankTransaction', 'public', 'BankTransaction', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
