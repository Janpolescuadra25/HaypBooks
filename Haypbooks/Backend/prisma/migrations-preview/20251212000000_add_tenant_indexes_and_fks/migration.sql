-- idempotent migration to add tenantId indexes and foreign keys where missing
-- Adds indexes and FK constraints to tenant-scoped tables

-- NOTE: This migration is intentionally idempotent and safe to re-run.

-- Indexes and FKs for core tenant-scoped tables
DO $$
BEGIN
  -- TenantUser
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TenantUser' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantuser_tenant_idx') THEN
      CREATE INDEX tenantuser_tenant_idx ON public."TenantUser" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TenantUser_tenant_fkey') THEN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT "TenantUser_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- AccountBalance
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'AccountBalance' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'accountbalance_tenant_idx') THEN
      CREATE INDEX accountbalance_tenant_idx ON public."AccountBalance" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccountBalance_tenant_fkey') THEN
    ALTER TABLE public."AccountBalance" ADD CONSTRAINT "AccountBalance_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- OpeningBalance
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'OpeningBalance' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'openingbalance_tenant_idx') THEN
      CREATE INDEX openingbalance_tenant_idx ON public."OpeningBalance" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OpeningBalance_tenant_fkey') THEN
    ALTER TABLE public."OpeningBalance" ADD CONSTRAINT "OpeningBalance_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Class
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Class' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'class_tenant_idx') THEN
      CREATE INDEX class_tenant_idx ON public."Class" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Class_tenant_fkey') THEN
    ALTER TABLE public."Class" ADD CONSTRAINT "Class_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Location
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Location' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'location_tenant_idx') THEN
      CREATE INDEX location_tenant_idx ON public."Location" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Location_tenant_fkey') THEN
    ALTER TABLE public."Location" ADD CONSTRAINT "Location_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Project
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Project' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'project_tenant_idx') THEN
      CREATE INDEX project_tenant_idx ON public."Project" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_tenant_fkey') THEN
    ALTER TABLE public."Project" ADD CONSTRAINT "Project_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Accounts & Journals
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Account' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'account_tenant_idx') THEN
      CREATE INDEX account_tenant_idx ON public."Account" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Account_tenant_fkey') THEN
    ALTER TABLE public."Account" ADD CONSTRAINT "Account_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'JournalEntry' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'journalentry_tenant_idx') THEN
      CREATE INDEX journalentry_tenant_idx ON public."JournalEntry" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalEntry_tenant_fkey') THEN
    ALTER TABLE public."JournalEntry" ADD CONSTRAINT "JournalEntry_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Contacts & parties
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Contact' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'contact_tenant_idx') THEN
      CREATE INDEX contact_tenant_idx ON public."Contact" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Contact_tenant_fkey') THEN
    ALTER TABLE public."Contact" ADD CONSTRAINT "Contact_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Customer' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'customer_tenant_idx') THEN
      CREATE INDEX customer_tenant_idx ON public."Customer" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Customer_tenant_fkey') THEN
    ALTER TABLE public."Customer" ADD CONSTRAINT "Customer_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Vendor' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'vendor_tenant_idx') THEN
      CREATE INDEX vendor_tenant_idx ON public."Vendor" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vendor_tenant_fkey') THEN
    ALTER TABLE public."Vendor" ADD CONSTRAINT "Vendor_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Items & inventory
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Item' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'item_tenant_idx') THEN
      CREATE INDEX item_tenant_idx ON public."Item" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Item_tenant_fkey') THEN
    ALTER TABLE public."Item" ADD CONSTRAINT "Item_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'InventoryCostLayer' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inventorycostlayer_tenant_idx') THEN
      CREATE INDEX inventorycostlayer_tenant_idx ON public."InventoryCostLayer" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InventoryCostLayer_tenant_fkey') THEN
    ALTER TABLE public."InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Stock & transactions
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'StockLocation' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'stocklocation_tenant_idx') THEN
      CREATE INDEX stocklocation_tenant_idx ON public."StockLocation" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StockLocation_tenant_fkey') THEN
    ALTER TABLE public."StockLocation" ADD CONSTRAINT "StockLocation_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'StockLevel' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'stocklevel_tenant_idx') THEN
      CREATE INDEX stocklevel_tenant_idx ON public."StockLevel" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StockLevel_tenant_fkey') THEN
    ALTER TABLE public."StockLevel" ADD CONSTRAINT "StockLevel_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'InventoryTransaction' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inventorytransaction_tenant_idx') THEN
      CREATE INDEX inventorytransaction_tenant_idx ON public."InventoryTransaction" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InventoryTransaction_tenant_fkey') THEN
    ALTER TABLE public."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'InventoryTransactionLine' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inventorytransactionline_tenant_idx') THEN
      CREATE INDEX inventorytransactionline_tenant_idx ON public."InventoryTransactionLine" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InventoryTransactionLine_tenant_fkey') THEN
    ALTER TABLE public."InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Tax & codes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TaxCode' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'taxcode_tenant_idx') THEN
      CREATE INDEX taxcode_tenant_idx ON public."TaxCode" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaxCode_tenant_fkey') THEN
    ALTER TABLE public."TaxCode" ADD CONSTRAINT "TaxCode_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE SET NULL NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'LineTax' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'linetax_tenant_idx') THEN
      CREATE INDEX linetax_tenant_idx ON public."LineTax" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LineTax_tenant_fkey') THEN
    ALTER TABLE public."LineTax" ADD CONSTRAINT "LineTax_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE NOT VALID;
  END IF;

  -- TaxCodeAccount: ensure tenant FK
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaxCodeAccount_tenant_fkey') THEN
    ALTER TABLE public."TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- TaxRate: add tenant index and tenant fk
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TaxRate' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'taxrate_tenant_idx') THEN
      CREATE INDEX taxrate_tenant_idx ON public."TaxRate" ("tenantId");
    END IF;
    IF (SELECT a.atttypid::regtype::text FROM pg_attribute a JOIN pg_class c ON a.attrelid = c.oid WHERE c.relname = 'TaxRate' AND a.attname = 'tenantId') = (SELECT a2.atttypid::regtype::text FROM pg_attribute a2 JOIN pg_class c2 ON a2.attrelid = c2.oid WHERE c2.relname = 'Tenant' AND a2.attname = 'id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TaxRate_tenant_fkey') THEN
        ALTER TABLE public."TaxRate" ADD CONSTRAINT "TaxRate_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE SET NULL NOT VALID;
      END IF;
    END IF;
  END IF;

  -- Documents & payments
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Invoice' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'invoice_tenant_idx') THEN
      CREATE INDEX invoice_tenant_idx ON public."Invoice" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Invoice') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_tenant_fkey') THEN
      ALTER TABLE public."Invoice" ADD CONSTRAINT "Invoice_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  -- Missing FK/indexes for system/operational tables
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TenantBillingInvoice' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantbillinginvoice_tenant_idx') THEN
      CREATE INDEX tenantbillinginvoice_tenant_idx ON public."TenantBillingInvoice" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TenantBillingInvoice_tenant_fkey') THEN
    ALTER TABLE public."TenantBillingInvoice" ADD CONSTRAINT "TenantBillingInvoice_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TenantBillingUsage' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantbillingusage_tenant_idx') THEN
      CREATE INDEX tenantbillingusage_tenant_idx ON public."TenantBillingUsage" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TenantBillingUsage_tenant_fkey') THEN
    ALTER TABLE public."TenantBillingUsage" ADD CONSTRAINT "TenantBillingUsage_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'DsrExportRequest' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'dsrexportrequest_tenant_idx') THEN
      CREATE INDEX dsrexportrequest_tenant_idx ON public."DsrExportRequest" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DsrExportRequest_tenant_fkey') THEN
    ALTER TABLE public."DsrExportRequest" ADD CONSTRAINT "DsrExportRequest_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'ConsentRecord' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'consentrecord_tenant_idx') THEN
      CREATE INDEX consentrecord_tenant_idx ON public."ConsentRecord" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsentRecord_tenant_fkey') THEN
    ALTER TABLE public."ConsentRecord" ADD CONSTRAINT "ConsentRecord_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'IdempotencyKey' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idempotencykey_tenant_idx') THEN
      CREATE INDEX idempotencykey_tenant_idx ON public."IdempotencyKey" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'IdempotencyKey_tenant_fkey') THEN
    ALTER TABLE public."IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'OutboxEvent' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'outboxevent_tenant_idx') THEN
      CREATE INDEX outboxevent_tenant_idx ON public."OutboxEvent" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OutboxEvent_tenant_fkey') THEN
    ALTER TABLE public."OutboxEvent" ADD CONSTRAINT "OutboxEvent_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE SET NULL NOT VALID;
  END IF;

  -- Search indexing tables tenant fk
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'SearchIndexingQueue') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SearchIndexingQueue_tenant_fkey') THEN
      ALTER TABLE public."SearchIndexingQueue" ADD CONSTRAINT "SearchIndexingQueue_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'SearchIndexedDoc') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SearchIndexedDoc_tenant_fkey') THEN
      ALTER TABLE public."SearchIndexedDoc" ADD CONSTRAINT "SearchIndexedDoc_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'ApiRateLimit' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'apiratelimit_tenant_idx') THEN
      CREATE INDEX apiratelimit_tenant_idx ON public."ApiRateLimit" ("tenantId");
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApiRateLimit_tenant_fkey') THEN
    ALTER TABLE public."ApiRateLimit" ADD CONSTRAINT "ApiRateLimit_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
  END IF;

  -- Budget tenant fk (index handled in phase15-budgets.sql)
  IF (SELECT a.atttypid::regtype::text FROM pg_attribute a JOIN pg_class c ON a.attrelid = c.oid WHERE c.relname = 'Budget' AND a.attname = 'tenantId') = (SELECT a2.atttypid::regtype::text FROM pg_attribute a2 JOIN pg_class c2 ON a2.attrelid = c2.oid WHERE c2.relname = 'Tenant' AND a2.attname = 'id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_tenant_fkey') THEN
      ALTER TABLE public."Budget" ADD CONSTRAINT "Budget_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  -- Fixed asset tables tenant fk
  IF (SELECT a.atttypid::regtype::text FROM pg_attribute a JOIN pg_class c ON a.attrelid = c.oid WHERE c.relname = 'FixedAsset' AND a.attname = 'tenantId') = (SELECT a2.atttypid::regtype::text FROM pg_attribute a2 JOIN pg_class c2 ON a2.attrelid = c2.oid WHERE c2.relname = 'Tenant' AND a2.attname = 'id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FixedAsset_tenant_fkey') THEN
      ALTER TABLE public."FixedAsset" ADD CONSTRAINT "FixedAsset_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;
  IF (SELECT a.atttypid::regtype::text FROM pg_attribute a JOIN pg_class c ON a.attrelid = c.oid WHERE c.relname = 'FixedAssetCategory' AND a.attname = 'tenantId') = (SELECT a2.atttypid::regtype::text FROM pg_attribute a2 JOIN pg_class c2 ON a2.attrelid = c2.oid WHERE c2.relname = 'Tenant' AND a2.attname = 'id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FixedAssetCategory_tenant_fkey') THEN
      ALTER TABLE public."FixedAssetCategory" ADD CONSTRAINT "FixedAssetCategory_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  -- Payroll tables
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Employee' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'employee_tenant_idx') THEN
      CREATE INDEX employee_tenant_idx ON public."Employee" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Employee') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Employee_tenant_fkey') THEN
      ALTER TABLE public."Employee" ADD CONSTRAINT "Employee_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PaySchedule' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payschedule_tenant_idx') THEN
      CREATE INDEX payschedule_tenant_idx ON public."PaySchedule" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaySchedule_tenant_fkey') THEN
      ALTER TABLE public."PaySchedule" ADD CONSTRAINT "PaySchedule_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PayrollRun' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payrollrun_tenant_idx') THEN
      CREATE INDEX payrollrun_tenant_idx ON public."PayrollRun" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRun') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PayrollRun_tenant_fkey') THEN
      ALTER TABLE public."PayrollRun" ADD CONSTRAINT "PayrollRun_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PayrollRunEmployee' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payrollrunemployee_tenant_idx') THEN
      CREATE INDEX payrollrunemployee_tenant_idx ON public."PayrollRunEmployee" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRunEmployee') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PayrollRunEmployee_tenant_fkey') THEN
      ALTER TABLE public."PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Paycheck' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paycheck_tenant_idx') THEN
      CREATE INDEX paycheck_tenant_idx ON public."Paycheck" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Paycheck') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Paycheck_tenant_fkey') THEN
      ALTER TABLE public."Paycheck" ADD CONSTRAINT "Paycheck_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;


  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'PaymentReceived' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymentreceived_tenant_idx') THEN
      CREATE INDEX paymentreceived_tenant_idx ON public."PaymentReceived" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaymentReceived') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentReceived_tenant_fkey') THEN
      ALTER TABLE public."PaymentReceived" ADD CONSTRAINT "PaymentReceived_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  -- Bank & transactions
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'BankAccount' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'bankaccount_tenant_idx') THEN
      CREATE INDEX bankaccount_tenant_idx ON public."BankAccount" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'BankAccount') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BankAccount_tenant_fkey') THEN
      ALTER TABLE public."BankAccount" ADD CONSTRAINT "BankAccount_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;
    END IF;
  END IF;

  -- Misc operational tables
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'AuditLog' AND column_name = 'tenantId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'auditlog_tenant_idx') THEN
      CREATE INDEX auditlog_tenant_idx ON public."AuditLog" ("tenantId");
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'AuditLog') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_tenant_fkey') THEN
      ALTER TABLE public."AuditLog" ADD CONSTRAINT "AuditLog_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE SET NULL NOT VALID;
    END IF;
  END IF;

END $$;
