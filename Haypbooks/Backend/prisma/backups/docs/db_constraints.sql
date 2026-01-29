-- Database-level check constraints for scope rules
-- Apply manually in a migration (Prisma doesn't support CHECK constraints directly).

-- 1) Subscription: exactly one owner (company OR practice)
ALTER TABLE "Subscription"
  ADD CONSTRAINT subscription_owner_xor
  CHECK (
    ("companyId" IS NOT NULL AND "practiceId" IS NULL)
    OR ("companyId" IS NULL AND "practiceId" IS NOT NULL)
  );

-- 2) OnboardingStep: exactly one owner (company OR practice)
ALTER TABLE "OnboardingStep"
  ADD CONSTRAINT onboardingstep_owner_xor
  CHECK (
    ("companyId" IS NOT NULL AND "practiceId" IS NULL)
    OR ("companyId" IS NULL AND "practiceId" IS NOT NULL)
  );

-- 3) AuditLog: tenant-scoped with optional company/practice (not both)
ALTER TABLE "AuditLog"
  ADD CONSTRAINT auditlog_scope_xor
  CHECK (
    NOT ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL)
  );

-- 4) Task: workspace-scoped with optional company/practice (not both)
ALTER TABLE "Task"
  ADD CONSTRAINT task_scope_xor
  CHECK (
    NOT ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL)
  );

-- 5) RefundApproval: exactly one of customerRefundId or vendorRefundId
ALTER TABLE "RefundApproval"
  ADD CONSTRAINT refundapproval_target_xor
  CHECK (
    ("customerRefundId" IS NOT NULL AND "vendorRefundId" IS NULL)
    OR ("customerRefundId" IS NULL AND "vendorRefundId" IS NOT NULL)
  );

-- 6) WriteOff: exactly one of invoiceId or billId
ALTER TABLE "WriteOff"
  ADD CONSTRAINT writeoff_source_xor
  CHECK (
    ("invoiceId" IS NOT NULL AND "billId" IS NULL)
    OR ("invoiceId" IS NULL AND "billId" IS NOT NULL)
  );

-- 7) AccountingPeriod: startDate must be <= endDate
ALTER TABLE "AccountingPeriod"
  ADD CONSTRAINT accountingperiod_date_order
  CHECK ("startDate" <= "endDate");

-- 8) PostingLock: startDate must be <= endDate
ALTER TABLE "PostingLock"
  ADD CONSTRAINT postinglock_date_order
  CHECK ("startDate" <= "endDate");

-- 9) ApprovalThreshold: minAmount <= maxAmount when both are set
ALTER TABLE "ApprovalThreshold"
  ADD CONSTRAINT approvalthreshold_min_max
  CHECK (
    "minAmount" IS NULL
    OR "maxAmount" IS NULL
    OR "minAmount" <= "maxAmount"
  );

-- 10) SalesTaxReturn: period start <= end
ALTER TABLE "SalesTaxReturn"
  ADD CONSTRAINT salestaxreturn_date_order
  CHECK ("periodStart" <= "periodEnd");

-- 11) FixedAssetSchedule: startDate <= endDate
ALTER TABLE "FixedAssetSchedule"
  ADD CONSTRAINT fixedassetschedule_date_order
  CHECK ("startDate" <= "endDate");

-- 12) DepreciationJournal: periodStart <= periodEnd
ALTER TABLE "DepreciationJournal"
  ADD CONSTRAINT depreciationjournal_date_order
  CHECK ("periodStart" <= "periodEnd");

-- 13) AccrualSchedule: startDate <= endDate
ALTER TABLE "AccrualSchedule"
  ADD CONSTRAINT accrualschedule_date_order
  CHECK ("startDate" <= "endDate");

-- 14) AccrualEntry: periodStart <= periodEnd
ALTER TABLE "AccrualEntry"
  ADD CONSTRAINT accrualentry_date_order
  CHECK ("periodStart" <= "periodEnd");

-- 15) DunningStep: non-negative day offset
ALTER TABLE "DunningStep"
  ADD CONSTRAINT dunningstep_day_offset_nonnegative
  CHECK ("dayOffset" >= 0);

-- 16) InventoryReserve: non-negative amount
ALTER TABLE "InventoryReserve"
  ADD CONSTRAINT inventoryreserve_amount_nonnegative
  CHECK ("amount" >= 0);

-- 17) COGSRecognition: non-negative quantity and totalCost
ALTER TABLE "COGSRecognition"
  ADD CONSTRAINT cogsrecognition_quantity_nonnegative
  CHECK ("quantity" >= 0);

ALTER TABLE "COGSRecognition"
  ADD CONSTRAINT cogsrecognition_totalcost_nonnegative
  CHECK ("totalCost" >= 0);

-- 18) PayrollAccrual: periodStart <= periodEnd
ALTER TABLE "PayrollAccrual"
  ADD CONSTRAINT payrollaccrual_date_order
  CHECK ("periodStart" <= "periodEnd");

-- 19) IntercompanyTransaction: fromCompanyId != toCompanyId and amount >= 0
ALTER TABLE "IntercompanyTransaction"
  ADD CONSTRAINT intercompany_distinct_companies
  CHECK ("fromCompanyId" <> "toCompanyId");

ALTER TABLE "IntercompanyTransaction"
  ADD CONSTRAINT intercompany_amount_nonnegative
  CHECK ("amount" >= 0);

-- 20) ContractorPayment: amount >= 0 and taxYear reasonable
ALTER TABLE "ContractorPayment"
  ADD CONSTRAINT contractorpayment_amount_nonnegative
  CHECK ("amount" >= 0);

ALTER TABLE "ContractorPayment"
  ADD CONSTRAINT contractorpayment_taxyear_min
  CHECK ("taxYear" >= 2000);

-- 21) Form1099: taxYear reasonable and totalAmount >= 0
ALTER TABLE "Form1099"
  ADD CONSTRAINT form1099_taxyear_min
  CHECK ("taxYear" >= 2000);

ALTER TABLE "Form1099"
  ADD CONSTRAINT form1099_totalamount_nonnegative
  CHECK ("totalAmount" >= 0);

-- 22) Form1099Box: amount >= 0
ALTER TABLE "Form1099Box"
  ADD CONSTRAINT form1099box_amount_nonnegative
  CHECK ("amount" >= 0);

-- 23) ProductionRun: quantity >= 0 and costs >= 0 when present
ALTER TABLE "ProductionRun"
  ADD CONSTRAINT productionrun_quantity_nonnegative
  CHECK ("quantity" >= 0);

ALTER TABLE "ProductionRun"
  ADD CONSTRAINT productionrun_standardcost_nonnegative
  CHECK ("standardCost" IS NULL OR "standardCost" >= 0);

ALTER TABLE "ProductionRun"
  ADD CONSTRAINT productionrun_actualcost_nonnegative
  CHECK ("actualCost" IS NULL OR "actualCost" >= 0);

-- 24) YearEndClose: fiscalYear reasonable
ALTER TABLE "YearEndClose"
  ADD CONSTRAINT yearendclose_fiscalyear_min
  CHECK ("fiscalYear" >= 2000);

-- 25) CurrencyRevaluationEntry: exchangeRate must be positive
ALTER TABLE "CurrencyRevaluationEntry"
  ADD CONSTRAINT currencyreval_exchange_rate_positive
  CHECK ("exchangeRate" > 0);

-- 26) UndepositedFundsBatch: totalAmount >= 0
ALTER TABLE "UndepositedFundsBatch"
  ADD CONSTRAINT undepositedfunds_total_nonnegative
  CHECK ("totalAmount" >= 0);

-- 27) DocumentSequence: nextNumber >= 1
ALTER TABLE "DocumentSequence"
  ADD CONSTRAINT documentsequence_nextnumber_min
  CHECK ("nextNumber" >= 1);

-- =====================
-- Tax & Payroll Check Constraints
-- =====================

-- TaxRate: rate between 0 and 1 (percent expressed as decimal, e.g., 0.12)
ALTER TABLE "TaxRate"
  ADD CONSTRAINT taxrate_rate_range
  CHECK (rate >= 0 AND rate <= 1);

-- WithholdingTaxDeduction: rate between 0 and 1
ALTER TABLE "WithholdingTaxDeduction"
  ADD CONSTRAINT withhold_rate_range
  CHECK (rate >= 0 AND rate <= 1);

-- PercentageTax: rate between 0 and 1
ALTER TABLE "PercentageTax"
  ADD CONSTRAINT percentage_tax_rate_range
  CHECK (rate >= 0 AND rate <= 1);

-- PhilippinePayrollDeduction: period must be YYYY-MM
ALTER TABLE "PhilippinePayrollDeduction"
  ADD CONSTRAINT phil_payroll_period_format
  CHECK (period ~ '^[0-9]{4}-[0-9]{2}$');

-- RecurringSchedule: nextScheduledAt should be >= lastExecutedAt when lastExecutedAt is set
ALTER TABLE "RecurringSchedule"
  ADD CONSTRAINT recurring_schedule_next_after_last
  CHECK ("lastExecutedAt" IS NULL OR "nextScheduledAt" >= "lastExecutedAt");

