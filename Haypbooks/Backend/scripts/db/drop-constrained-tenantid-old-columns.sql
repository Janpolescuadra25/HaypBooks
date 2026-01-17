-- DANGEROUS: tenantId_old column drops with FK constraints
-- Generated: 2026-01-16
-- ⚠️ DO NOT RUN WITHOUT BACKUP AND TESTING ⚠️
-- These tables have foreign key constraints on tenantId_old
-- Must drop constraints before dropping columns

-- Step 1: Drop foreign key constraints on tenantId_old
-- (Add constraint drop statements here after manual review of each FK)

-- Example pattern:
-- ALTER TABLE "TableName" DROP CONSTRAINT IF EXISTS "constraint_name";

-- Approval table
ALTER TABLE "Approval" DROP CONSTRAINT IF EXISTS "Approval_tenantId_fkey";

-- Account table
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_tenantId_fkey";

-- AccountSubType table
ALTER TABLE "AccountSubType" DROP CONSTRAINT IF EXISTS "AccountSubType_tenantId_fkey";

-- AccountingPeriod table
ALTER TABLE "AccountingPeriod" DROP CONSTRAINT IF EXISTS "AccountingPeriod_tenantId_fkey";

-- BankReconciliation table
ALTER TABLE "BankReconciliation" DROP CONSTRAINT IF EXISTS "BankReconciliation_tenantId_fkey";

-- Attachment table
ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_tenantId_fkey";

-- BankAccount table
ALTER TABLE "BankAccount" DROP CONSTRAINT IF EXISTS "BankAccount_tenantId_fkey";

-- AuditLog table
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_tenantId_fkey";

-- BankReconciliationLine table
ALTER TABLE "BankReconciliationLine" DROP CONSTRAINT IF EXISTS "BankReconciliationLine_tenantId_fkey";

-- BankTransaction table
ALTER TABLE "BankTransaction" DROP CONSTRAINT IF EXISTS "BankTransaction_tenantId_fkey";

-- Bill table
ALTER TABLE "Bill" DROP CONSTRAINT IF EXISTS "Bill_tenantId_fkey";

-- Budget table
ALTER TABLE "Budget" DROP CONSTRAINT IF EXISTS "Budget_tenantId_fkey";

-- BillLine table
ALTER TABLE "BillLine" DROP CONSTRAINT IF EXISTS "BillLine_tenantId_fkey";

-- BillPayment table
ALTER TABLE "BillPayment" DROP CONSTRAINT IF EXISTS "BillPayment_tenantId_fkey";

-- BillPaymentApplication table
ALTER TABLE "BillPaymentApplication" DROP CONSTRAINT IF EXISTS "BillPaymentApplication_tenantId_fkey";

-- Company table
ALTER TABLE "Company" DROP CONSTRAINT IF EXISTS "Company_tenantId_fkey";

-- BudgetLine table
ALTER TABLE "BudgetLine" DROP CONSTRAINT IF EXISTS "BudgetLine_tenantId_fkey";

-- ContactAddress table
ALTER TABLE "ContactAddress" DROP CONSTRAINT IF EXISTS "ContactAddress_tenantId_fkey";

-- ContactCustomField table
ALTER TABLE "ContactCustomField" DROP CONSTRAINT IF EXISTS "ContactCustomField_tenantId_fkey";

-- Contact table
ALTER TABLE "Contact" DROP CONSTRAINT IF EXISTS "Contact_tenantId_fkey";

-- CustomerCredit table
ALTER TABLE "CustomerCredit" DROP CONSTRAINT IF EXISTS "CustomerCredit_tenantId_fkey";

-- CustomerCreditLine table
ALTER TABLE "CustomerCreditLine" DROP CONSTRAINT IF EXISTS "CustomerCreditLine_tenantId_fkey";

-- CustomerCreditApplication table
ALTER TABLE "CustomerCreditApplication" DROP CONSTRAINT IF EXISTS "CustomerCreditApplication_tenantId_fkey";

-- FinancialStatementSnapshot table
ALTER TABLE "FinancialStatementSnapshot" DROP CONSTRAINT IF EXISTS "FinancialStatementSnapshot_tenantId_fkey";

-- Employee table
ALTER TABLE "Employee" DROP CONSTRAINT IF EXISTS "Employee_tenantId_fkey";

-- EventLog table
ALTER TABLE "EventLog" DROP CONSTRAINT IF EXISTS "EventLog_tenantId_fkey";

-- FixedAsset table
ALTER TABLE "FixedAsset" DROP CONSTRAINT IF EXISTS "FixedAsset_tenantId_fkey";

-- FixedAssetDepreciation table
ALTER TABLE "FixedAssetDepreciation" DROP CONSTRAINT IF EXISTS "FixedAssetDepreciation_tenantId_fkey";

-- InventoryCostLayer table
ALTER TABLE "InventoryCostLayer" DROP CONSTRAINT IF EXISTS "InventoryCostLayer_tenantId_fkey";

-- InventoryTransaction table
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT IF EXISTS "InventoryTransaction_tenantId_fkey";

-- InventoryTransactionLine table
ALTER TABLE "InventoryTransactionLine" DROP CONSTRAINT IF EXISTS "InventoryTransactionLine_tenantId_fkey";

-- Invoice table
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_tenantId_fkey";

-- Item table
ALTER TABLE "Item" DROP CONSTRAINT IF EXISTS "Item_tenantId_fkey";

-- InvoiceLine table
ALTER TABLE "InvoiceLine" DROP CONSTRAINT IF EXISTS "InvoiceLine_tenantId_fkey";

-- InvoicePaymentApplication table
ALTER TABLE "InvoicePaymentApplication" DROP CONSTRAINT IF EXISTS "InvoicePaymentApplication_tenantId_fkey";

-- JournalEntry table
ALTER TABLE "JournalEntry" DROP CONSTRAINT IF EXISTS "JournalEntry_tenantId_fkey";

-- JournalEntryLine table
ALTER TABLE "JournalEntryLine" DROP CONSTRAINT IF EXISTS "JournalEntryLine_tenantId_fkey";

-- PaySchedule table
ALTER TABLE "PaySchedule" DROP CONSTRAINT IF EXISTS "PaySchedule_tenantId_fkey";

-- Paycheck table
ALTER TABLE "Paycheck" DROP CONSTRAINT IF EXISTS "Paycheck_tenantId_fkey";

-- PayrollRun table
ALTER TABLE "PayrollRun" DROP CONSTRAINT IF EXISTS "PayrollRun_tenantId_fkey";

-- PaycheckLine table
ALTER TABLE "PaycheckLine" DROP CONSTRAINT IF EXISTS "PaycheckLine_tenantId_fkey";

-- PaycheckTax table
ALTER TABLE "PaycheckTax" DROP CONSTRAINT IF EXISTS "PaycheckTax_tenantId_fkey";

-- PaymentReceived table
ALTER TABLE "PaymentReceived" DROP CONSTRAINT IF EXISTS "PaymentReceived_tenantId_fkey";

-- PayrollRunEmployee table
ALTER TABLE "PayrollRunEmployee" DROP CONSTRAINT IF EXISTS "PayrollRunEmployee_tenantId_fkey";

-- PurchaseOrder table
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT IF EXISTS "PurchaseOrder_tenantId_fkey";

-- Reversal table
ALTER TABLE "Reversal" DROP CONSTRAINT IF EXISTS "Reversal_tenantId_fkey";

-- Revaluation table
ALTER TABLE "Revaluation" DROP CONSTRAINT IF EXISTS "Revaluation_tenantId_fkey";

-- RecurringInvoice table
ALTER TABLE "RecurringInvoice" DROP CONSTRAINT IF EXISTS "RecurringInvoice_tenantId_fkey";

-- PurchaseOrderLine table
ALTER TABLE "PurchaseOrderLine" DROP CONSTRAINT IF EXISTS "PurchaseOrderLine_tenantId_fkey";

-- StockLevel table
ALTER TABLE "StockLevel" DROP CONSTRAINT IF EXISTS "StockLevel_tenantId_fkey";

-- Role table
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_tenantId_fkey";

-- StockLocation table
ALTER TABLE "StockLocation" DROP CONSTRAINT IF EXISTS "StockLocation_tenantId_fkey";

-- Task table (multiple FKs)
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_tenantId_assigneeId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_tenantId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "fk_task_assignee";

-- TaxRate table
ALTER TABLE "TaxRate" DROP CONSTRAINT IF EXISTS "TaxRate_tenantId_fkey";

-- TaxCode table
ALTER TABLE "TaxCode" DROP CONSTRAINT IF EXISTS "TaxCode_tenantId_fkey";

-- TaxCodeRate table
ALTER TABLE "TaxCodeRate" DROP CONSTRAINT IF EXISTS "TaxCodeRate_tenantId_fkey";

-- TenantInvite table
ALTER TABLE "TenantInvite" DROP CONSTRAINT IF EXISTS "TenantInvite_tenantId_fkey";

-- TimesheetApproval table
ALTER TABLE "TimesheetApproval" DROP CONSTRAINT IF EXISTS "TimesheetApproval_tenantId_fkey";

-- TenantUser table (has PRIMARY KEY on tenantId_old!)
-- ⚠️ VERY DANGEROUS - This has a composite primary key including tenantId_old
-- ALTER TABLE "TenantUser" DROP CONSTRAINT IF EXISTS "TenantUser_pkey";
-- ALTER TABLE "TenantUser" DROP CONSTRAINT IF EXISTS "TenantUser_tenantId_fkey";

-- Timesheet table
ALTER TABLE "Timesheet" DROP CONSTRAINT IF EXISTS "Timesheet_tenantId_fkey";

-- TimeEntry table
ALTER TABLE "TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_tenantId_fkey";

-- VendorCredit table
ALTER TABLE "VendorCredit" DROP CONSTRAINT IF EXISTS "VendorCredit_tenantId_fkey";

-- VendorCreditLine table
ALTER TABLE "VendorCreditLine" DROP CONSTRAINT IF EXISTS "VendorCreditLine_tenantId_fkey";

-- VendorPaymentMethod table
ALTER TABLE "VendorPaymentMethod" DROP CONSTRAINT IF EXISTS "VendorPaymentMethod_tenantId_fkey";


-- Step 2: Drop the tenantId_old columns
-- (Only run after Step 1 succeeds and app is tested)
/*
ALTER TABLE "Approval" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "AccountSubType" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "AccountingPeriod" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BankReconciliation" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Attachment" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BankAccount" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BankReconciliationLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BankTransaction" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Budget" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BillLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BillPayment" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BillPaymentApplication" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "BudgetLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "ContactAddress" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "ContactCustomField" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Contact" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "CustomerCredit" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "CustomerCreditLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "CustomerCreditApplication" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "FinancialStatementSnapshot" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Employee" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "EventLog" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "FixedAsset" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "FixedAssetDepreciation" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "InventoryCostLayer" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "InventoryTransaction" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "InventoryTransactionLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Item" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "InvoiceLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "InvoicePaymentApplication" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "JournalEntry" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "JournalEntryLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PaySchedule" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Paycheck" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PayrollRun" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PaycheckLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PaycheckTax" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PaymentReceived" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PayrollRunEmployee" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PurchaseOrder" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Reversal" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Revaluation" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "RecurringInvoice" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "PurchaseOrderLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "StockLevel" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Role" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "StockLocation" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TaxRate" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TaxCode" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TaxCodeRate" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TenantInvite" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TimesheetApproval" DROP COLUMN IF EXISTS "tenantId_old";
-- ALTER TABLE "TenantUser" DROP COLUMN IF EXISTS "tenantId_old"; -- CAREFUL: Part of primary key!
ALTER TABLE "Timesheet" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "TimeEntry" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "VendorCredit" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "VendorCreditLine" DROP COLUMN IF EXISTS "tenantId_old";
ALTER TABLE "VendorPaymentMethod" DROP COLUMN IF EXISTS "tenantId_old";
*/

-- Step 3: Verification
-- SELECT table_name FROM information_schema.columns 
-- WHERE column_name = 'tenantId_old' AND table_schema = 'public';
