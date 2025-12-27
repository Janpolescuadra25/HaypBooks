// generate-rls-templates.js
// Generates idempotent RLS policy SQL templates for a list of tables.
// Usage: node generate-rls-templates.js > rls-policy-templates.sql

const tables = [
  'Account','AccountBalance','AccountSubType','AccountingPeriod','ApiRateLimit','Approval','Attachment','AuditLog','BankAccount','BankReconciliation','BankReconciliationLine','BankTransaction','Bill','BillLine','BillPayment','BillPaymentApplication','Budget','BudgetLine','Class','Company','ConsentRecord','Contact','ContactAddress','ContactCustomField','Customer','CustomerCredit','CustomerCreditApplication','CustomerCreditLine','DsrExportRequest','Employee','EventLog','FinancialStatementSnapshot','FixedAsset','FixedAssetCategory','FixedAssetDepreciation','IdempotencyKey','InventoryCostLayer','InventoryTransaction','InventoryTransactionLine','Invoice','InvoiceLine','InvoicePaymentApplication','Item','JournalEntry','JournalEntryLine','LineTax','Location','OpeningBalance','OutboxEvent','PaySchedule','Paycheck','PaycheckLine','PaycheckTax','PaymentReceived','PayrollRun','PayrollRunEmployee','Project','PurchaseOrder','PurchaseOrderLine','RecurringInvoice','Revaluation','Reversal','Role','SearchIndexedDoc','SearchIndexingQueue','StockLevel','StockLocation','Task','TaxCode','TaxCodeAccount','TaxCodeRate','TaxRate','TenantBillingInvoice','TenantBillingUsage','TenantInvite','TenantUser','TimeEntry','Timesheet','TimesheetApproval','Vendor','VendorCredit','VendorCreditLine','VendorPaymentMethod'
];

function template(table) {
  return `-- RLS template for table: ${table}
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='${table}' AND column_name='tenantId') THEN
    -- Enable RLS (safe guard: only if table has tenantId)
    ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;

    -- Create rls_tenant policy if missing
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
      WHERE c.relname = '${table}' AND p.polname = 'rls_tenant'
    ) THEN
      EXECUTE $$CREATE POLICY rls_tenant ON public."${table}" FOR ALL
        USING (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true))
        WITH CHECK (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true));$$;
    END IF;
  END IF;
END$$;

`;
}

// Output header and template for each table
console.log("-- Generated RLS policy templates\n-- Review carefully before applying.\n-- Set haypbooks.rls_bypass=1 during rollout to avoid enforcement while validating.\n\n");
for (const t of tables) console.log(template(t));
