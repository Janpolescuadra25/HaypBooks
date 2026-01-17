-- Rollback Script for TenantId_old Cleanup
-- Use this if you need to restore the tenantId_old columns and constraints
-- Generated: 2026-01-17

-- ============================================================================
-- PART 1: RESTORE SAFE COLUMNS (no constraints)
-- ============================================================================

-- Add back tenantId_old columns to tables that had no constraints
ALTER TABLE "AccountBalance" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "SearchIndexingQueue" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "SearchIndexedDoc" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "ApiRateLimit" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "DsrExportRequest" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "ConsentRecord" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "IdempotencyKey" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "OutboxEvent" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "FixedAssetCategory" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "LineTax" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "OpeningBalance" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TaxCodeAccount" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TenantBillingUsage" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TenantBillingInvoice" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;

-- ============================================================================
-- PART 2: RESTORE CONSTRAINED COLUMNS
-- ============================================================================

-- Add back tenantId_old columns to tables with foreign key constraints
ALTER TABLE "Approval" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "AccountSubType" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "AccountingPeriod" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BankReconciliation" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BankAccount" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BankReconciliationLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BillLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BillPayment" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BillPaymentApplication" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "BudgetLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "ContactAddress" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "ContactCustomField" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "CustomerCredit" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "CustomerCreditLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "CustomerCreditApplication" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "FinancialStatementSnapshot" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "EventLog" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "FixedAsset" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "FixedAssetDepreciation" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "InventoryCostLayer" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "InventoryTransaction" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "InventoryTransactionLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "InvoiceLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "InvoicePaymentApplication" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "JournalEntryLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PaySchedule" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Paycheck" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PayrollRun" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PaycheckLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PaycheckTax" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PaymentReceived" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PayrollRunEmployee" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Reversal" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Revaluation" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "RecurringInvoice" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "PurchaseOrderLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "StockLevel" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "StockLocation" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TaxRate" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TaxCode" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TaxCodeRate" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TenantInvite" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TimesheetApproval" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TenantUser" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "Timesheet" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "TimeEntry" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "VendorCredit" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "VendorCreditLine" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;
ALTER TABLE "VendorPaymentMethod" ADD COLUMN IF NOT EXISTS "tenantId_old" UUID;

-- ============================================================================
-- PART 3: RESTORE FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Note: These are examples. Adjust based on your actual constraint names and references

-- Approval constraints
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Account constraints
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- AccountSubType constraints
ALTER TABLE "AccountSubType" ADD CONSTRAINT "AccountSubType_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- AccountingPeriod constraints
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BankReconciliation constraints
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Attachment constraints
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BankAccount constraints
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- AuditLog constraints
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BankReconciliationLine constraints
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BankTransaction constraints
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Bill constraints
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Budget constraints
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BillLine constraints
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BillPayment constraints
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- BillPaymentApplication constraints
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Company constraints
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenantId_fkey" 
    FOREIGN KEY ("tenantId_old") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Continue for all other tables...
-- (Add remaining FK constraints as needed)

-- ============================================================================
-- PART 4: RESTORE TENANTUSER PRIMARY KEY (if needed)
-- ============================================================================
-- ⚠️ ONLY RUN THIS IF TenantUser primary key was dropped
-- This assumes the original primary key was (tenantId_old, userId)

-- DROP existing primary key first if it changed
-- ALTER TABLE "TenantUser" DROP CONSTRAINT IF EXISTS "TenantUser_pkey";

-- Restore composite primary key with tenantId_old
-- ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_pkey" 
--     PRIMARY KEY ("tenantId_old", "userId");

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check restored columns
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'tenantId_old' 
  AND table_schema = 'public'
ORDER BY table_name;

-- Check restored constraints
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints 
WHERE constraint_name LIKE '%tenantId%' 
  AND table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. This rollback script adds columns back but does NOT restore data
-- 2. If you need data, restore from your pg_dump backup
-- 3. Some constraint names may differ - check your schema
-- 4. Test in a non-production environment first
-- 5. The TenantUser primary key restoration is commented out - be careful!
