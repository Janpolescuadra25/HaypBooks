# HAYPBOOKS — Business Owner Hub
## Complete Navigation Reference

> Auto-extracted from `src/components/owner/ownerNavConfig.ts`  
> Last updated: March 2026  
> Legend: `[E]` = Enterprise only · `[PH]` = Philippines only · `[US]` = US only

---

## Navigation Format
```
Primary Module
  └─ Secondary Sub-Module
       └─ Tertiary Page (route path)
```

---

## 1. HOME
- Dashboard `/home/dashboard`
- Business Health `/home/business-health`
- Performance `/home/performance`
- Cash Position `/home/cash-position`
- Shortcuts `/home/shortcuts`
- Setup Center `/home/setup-center`
- Notifications Inbox `/home/notifications`
- Help & Support `/home/help`

---

## 2. TASKS & APPROVALS

### My Work
- My Tasks `/tasks-approvals/my-work/my-tasks`
- My Approvals `/tasks-approvals/my-work/my-approvals`
- My Exceptions `/tasks-approvals/my-work/my-exceptions`
- Overdue Items `/tasks-approvals/my-work/overdue-items`
- Notifications `/tasks-approvals/my-work/notifications`
- Calendar `/tasks-approvals/my-work/calendar`

### Management
- Team Tasks `/tasks-approvals/management/team-tasks`
- Delegated Tasks `/tasks-approvals/management/delegated-tasks`
- Approval Queue `/tasks-approvals/management/approval-queue`
- Approval History `/tasks-approvals/management/approval-history`
- Task Templates `/tasks-approvals/management/task-templates`

### History
- Completed Tasks `/tasks-approvals/history/completed-tasks`
- Approval History `/tasks-approvals/history/approval-history`

### Exceptions
- Exception Queue `/tasks-approvals/exceptions/exception-queue`
- By Type `/tasks-approvals/exceptions/by-type`
- Resolution Log `/tasks-approvals/exceptions/resolution-log`

### Follow-ups
- Scheduled Follow-ups `/tasks-approvals/follow-ups/scheduled`
- Overdue Follow-ups `/tasks-approvals/follow-ups/overdue`
- Completed `/tasks-approvals/follow-ups/completed`

---

## 3. ORGANIZATION

### Entity Structure (Legal)
- Legal Entities `/organization/entity-structure/legal-entities`
- Intercompany Transactions `/organization/entity-structure/intercompany`
- Consolidation `/organization/entity-structure/consolidation`

### Operational Structure
- Locations & Divisions `/organization/operational-structure/locations-divisions`
- Departments `/organization/operational-structure/departments`
- Classes & Tags `/organization/operational-structure/classes-tags`
- Org Chart `/organization/operational-structure/org-chart`

### Governance
- Filing Calendar `/organization/governance/filing-calendar`
- Document Storage `/organization/governance/document-storage`

---

## 4. ACCOUNTING

### Core Accounting
- Chart of Accounts `/accounting/core-accounting/chart-of-accounts`
- Journal Entries `/accounting/core-accounting/journal-entries`
- General Ledger `/accounting/core-accounting/general-ledger`
- Trial Balance `/accounting/core-accounting/trial-balance`

### Fixed Assets
#### Asset Management
- Asset Register `/accounting/fixed-assets/asset-management/asset-register`
- New Asset Entry `/accounting/fixed-assets/asset-management/new-asset`
- Asset Categories `/accounting/fixed-assets/asset-management/asset-categories`
- Asset Locations `/accounting/fixed-assets/asset-management/asset-locations`

#### Depreciation
- Depreciation Schedules `/accounting/fixed-assets/depreciation/schedules`
- Depreciation Runs `/accounting/fixed-assets/depreciation/runs`
- Depreciation Reports `/accounting/fixed-assets/depreciation/reports`

#### Asset Lifecycle
- Asset Disposals `/accounting/fixed-assets/lifecycle/disposals`
- Asset Impairments `/accounting/fixed-assets/lifecycle/impairments`
- Asset Revaluations `/accounting/fixed-assets/lifecycle/revaluations`
- Asset Maintenance `/accounting/fixed-assets/lifecycle/maintenance`
- Transfers `[E]` `/accounting/fixed-assets/lifecycle/transfers`

#### Insurance
- Asset Insurance `/accounting/fixed-assets/insurance/asset-insurance`
- Coverage Tracking `/accounting/fixed-assets/insurance/coverage-tracking`
- Premium Management `/accounting/fixed-assets/insurance/premium-management`

#### FA Reports
- Fixed Asset Schedule `/accounting/fixed-assets/reports/fixed-asset-schedule`
- Depreciation Summary `/accounting/fixed-assets/reports/depreciation-summary`
- Asset Valuation `/accounting/fixed-assets/reports/asset-valuation`
- Gain / Loss on Disposal `/accounting/fixed-assets/reports/gain-loss-disposal`

### Planning
- Budgets `/accounting/planning/budgets`
- Budget vs Actual `[E]` `/accounting/planning/budget-vs-actual`

### Period Close
- Close Checklist `/accounting/period-close/close-checklist`
- Reconciliations `/accounting/period-close/reconciliations`
- Adjustments `/accounting/period-close/adjustments`
- Multi-Currency Revaluation `[E]` `/accounting/period-close/multi-currency-revaluation`
- Lock Period `/accounting/period-close/lock-period`
- Sign-Offs `/accounting/period-close/sign-offs`
- Close Archive `/accounting/period-close/close-archive`

### Allocations
- Allocation Rules `/accounting/allocations/allocation-rules`
- Allocation Runs `/accounting/allocations/allocation-runs`
- Allocation History `/accounting/allocations/allocation-history`

### Revaluations
- Currency Revaluation `/accounting/revaluations/currency-revaluation`
- Revaluation Schedule `/accounting/revaluations/revaluation-schedule`
- Revaluation History `/accounting/revaluations/revaluation-history`

---

## 5. BANKING & CASH

### Bank Connections
- Connected Banks `/banking-cash/bank-connections/connected-banks`

### Transactions
- Bank Transactions `/banking-cash/transactions/bank-transactions`
- App Transactions `/banking-cash/transactions/app-transactions`
- Transaction Rules `/banking-cash/transactions/transaction-rules`
- Recurring Transactions `/banking-cash/transactions/recurring-transactions`

### Reconciliation
- Reconcile `/banking-cash/reconciliation/reconcile`
- Reconciliation History `/banking-cash/reconciliation/history`
- Statement Archive `/banking-cash/reconciliation/statement-archive`
- Reconciliation Reports `/banking-cash/reconciliation/reports`

### Cash Accounts
- Bank Accounts `/banking-cash/cash-accounts/bank-accounts`
- Petty Cash `/banking-cash/cash-accounts/petty-cash`
- Clearing Accounts `/banking-cash/cash-accounts/clearing-accounts`

### Deposits
- Undeposited Funds `/banking-cash/deposits/undeposited-funds`
- Bank Deposits `/banking-cash/deposits/bank-deposits`
- Deposit Slips `/banking-cash/deposits/deposit-slips`

### Bank Feeds
- Feed Connections `/banking-cash/bank-feeds/feed-connections`
- Import Rules `/banking-cash/bank-feeds/import-rules`
- Feed Status `/banking-cash/bank-feeds/feed-status`

### Credit Cards
- Credit Card Accounts `/banking-cash/credit-cards/credit-card-accounts`
- Card Transactions `/banking-cash/credit-cards/card-transactions`
- Card Statements `/banking-cash/credit-cards/card-statements`

### Checks
- Check Register `/banking-cash/checks/check-register`
- Check Printing `/banking-cash/checks/check-printing`
- Stop Payments `/banking-cash/checks/stop-payments`

### Cash Management
- Cash Position `/banking-cash/cash-management/cash-position`
- Short-Term Forecast `/banking-cash/cash-management/short-term-forecast`
- Cash Flow Projection `[E]` `/banking-cash/cash-management/cash-flow-projection`

### Treasury `[E]`
- Intercompany Transfers `/banking-cash/treasury/intercompany-transfers`
- Internal Loans `/banking-cash/treasury/internal-loans`
- Credit Lines `/banking-cash/treasury/credit-lines`
- Payment Approvals `/banking-cash/treasury/payment-approvals`

---

## 6. SALES

### Customers
- Customers `/sales/customers/customers`
- Customer Groups `/sales/customers/customer-groups`
- Customer Documents `/sales/customers/customer-documents`
- Price Lists `[E]` `/sales/customers/price-lists`
- Customer Portal `/sales/customers/customer-portal`

### Sales Operations
- Products & Services `/sales/sales-operations/products-services`
- Quotes & Estimates `/sales/sales-operations/quotes-estimates`
- Sales Orders `/sales/sales-operations/sales-orders`

### Billing
- Invoices `/sales/billing/invoices`
- Recurring Invoices `/sales/billing/recurring-invoices`
- Credit Notes `/sales/billing/credit-notes`
- Payment Links `/sales/billing/payment-links`
- Customer Statements `/sales/billing/customer-statements`

### Collections
- Customer Payments `/sales/collections/customer-payments`
- A/R Aging `/sales/collections/ar-aging`
- A/R Aging with Collections Alerts `/sales/collections/ar-aging-alerts`
- Write-Offs `/sales/collections/write-offs`
- Collections Center `/sales/collections/collections-center`
- Dunning Management `[E]` `/sales/collections/dunning-management`

### Refunds
- Refund List `/sales/refunds/refund-list`
- Process Refund `/sales/refunds/process-refund`
- Refund History `/sales/refunds/refund-history`

### Revenue Management
- Revenue Recognition `/sales/revenue-management/revenue-recognition`
- Deferred Revenue `/sales/revenue-management/deferred-revenue`
- Contract Revenue `[E]` `/sales/revenue-management/contract-revenue`
- Subscription Billing `[E]` `/sales/revenue-management/subscription-billing`

### Sales Insights
- Sales Performance `/sales/sales-insights/sales-performance`
- Revenue Trends `/sales/sales-insights/revenue-trends`
- Customer Profitability `/sales/sales-insights/customer-profitability`

---

## 7. EXPENSES

### Vendors
- Vendors `/expenses/vendors/vendors`
- Vendor Documents `/expenses/vendors/vendor-documents`
- Contractor Management `/expenses/vendors/contractor-management`
- 1099 Management `/expenses/vendors/1099-management`

### Purchasing
- Purchase Requests `/expenses/purchasing/purchase-requests`
- Purchase Orders `/expenses/purchasing/purchase-orders`
- Approval Workflows `/expenses/purchasing/approval-workflows`
- Bill Approval Hierarchies `/expenses/purchasing/bill-approval-hierarchies`
- Budget Checks `[E]` `/expenses/purchasing/budget-checks`
- RFQ (Request for Quote) `/expenses/purchasing/rfq`

### Expense Capture
- Expenses `/expenses/expense-capture/expenses`
- Receipts `/expenses/expense-capture/receipts`
- Mileage `/expenses/expense-capture/mileage`
- Per Diem `/expenses/expense-capture/per-diem`
- Employee Reimbursements `/expenses/expense-capture/employee-reimbursements`
- Company Card Activity `/expenses/expense-capture/company-card-activity`

### Payables
- Bills `/expenses/payables/bills`
- Recurring Bills `/expenses/payables/recurring-bills`
- Bill Payments `/expenses/payables/bill-payments`
- A/P Aging `/expenses/payables/ap-aging`
- Payment Runs `/expenses/payables/payment-runs`
- Vendor Credits `/expenses/payables/vendor-credits`

### Company Cards
- Card Management `/expenses/company-cards/card-management`
- Card Transactions `/expenses/company-cards/card-transactions`
- Card Statements `/expenses/company-cards/card-statements`

### Checks
- Print Checks `/expenses/checks/print-checks`
- Check Register `/expenses/checks/check-register`

### Expense Insights
- Spend Analysis `/expenses/expense-insights/spend-analysis`
- Vendor Spend `/expenses/expense-insights/vendor-spend`
- Cost Allocation `/expenses/expense-insights/cost-allocation`

---

## 8. INVENTORY

### Setup
- Inventory Items `/inventory/setup/inventory-items`
- Categories `/inventory/setup/categories`
- Units of Measure `/inventory/setup/units-of-measure`
- Bundles / Assemblies `[E]` `/inventory/setup/bundles-assemblies`

### Receiving
- Purchase Orders `/inventory/receiving/purchase-orders`
- Item Receipts `/inventory/receiving/item-receipts`
- Vendor Returns `/inventory/receiving/vendor-returns`
- Landed Costs `[E]` `/inventory/receiving/landed-costs`

### Stock Operations
- Stock Movements `/inventory/stock-operations/stock-movements`
- Inventory Adjustments `/inventory/stock-operations/inventory-adjustments`
- Cycle Counts `/inventory/stock-operations/cycle-counts`
- Physical Counts `/inventory/stock-operations/physical-counts`
- Transfers `[E]` `/inventory/stock-operations/transfers`

### Warehousing `[E]`
- Warehouses `/inventory/warehousing/warehouses`
- Bin Locations `/inventory/warehousing/bin-locations`
- Stock Zones `/inventory/warehousing/stock-zones`

### Control
- Reorder Points `/inventory/control/reorder-points`
- Safety Stock `/inventory/control/safety-stock`
- Backorders `/inventory/control/backorders`
- Lot / Serial Tracking `[E]` `/inventory/control/lot-serial-tracking`

### Valuation
- Inventory Valuation `/inventory/valuation/inventory-valuation`
- Cost Adjustments `/inventory/valuation/cost-adjustments`
- Write-Downs `/inventory/valuation/write-downs`
- COGS Analysis `/inventory/valuation/cogs-analysis`

### Inventory Insights
- Stock Aging `/inventory/inventory-insights/stock-aging`
- Turnover `/inventory/inventory-insights/turnover`
- Overstock Analysis `/inventory/inventory-insights/overstock-analysis`

---

## 9. PROJECTS

### Project Setup
- Projects `/projects/project-setup/projects`
- Project Templates `/projects/project-setup/project-templates`
- Milestones `/projects/project-setup/milestones`
- Budgets `/projects/project-setup/budgets`
- Contracts `/projects/project-setup/contracts`

### Planning
- Project Tasks `/projects/planning/project-tasks`
- Schedule `/projects/planning/schedule`
- Resource Planning `[E]` `/projects/planning/resource-planning`
- Capacity Planning `[E]` `/projects/planning/capacity-planning`

### Tracking
- Project Time `/projects/tracking/project-time`
- Project Expenses `/projects/tracking/project-expenses`
- Materials Usage `/projects/tracking/materials-usage`
- Subcontractor Costs `/projects/tracking/subcontractor-costs`
- Billable Review `/projects/tracking/billable-review`

### Billing
- Project Billing `/projects/billing/project-billing`
- Progress Billing `/projects/billing/progress-billing`
- Milestone Billing `/projects/billing/milestone-billing`
- Change Orders `/projects/billing/change-orders`
- Retainers `/projects/billing/retainers`
- Work in Progress (WIP) `/projects/billing/work-in-progress`

### Financials
- Project Profitability `/projects/financials/project-profitability`
- Budget vs Actual `/projects/financials/budget-vs-actual`
- Margin Analysis `/projects/financials/margin-analysis`
- Cost Breakdown `/projects/financials/cost-breakdown`

### Insights
- Project Dashboard `/projects/insights/project-dashboard`
- Resource Utilization `/projects/insights/resource-utilization`
- Completion Forecast `/projects/insights/completion-forecast`

---

## 10. TIME

### Entry
- Time Entries `/time/entry/time-entries`
- Timesheets `/time/entry/timesheets`
- Timer `/time/entry/timer`

### Review
- Billable Time Review `/time/review/billable-time-review`
- Time Approvals `[E]` `/time/review/time-approvals`

### Analysis
- Time by Project `/time/analysis/time-by-project`
- Time by Customer `/time/analysis/time-by-customer`
- Time by Employee `/time/analysis/time-by-employee`
- Time by Task `/time/analysis/time-by-task`
- Utilization Report `/time/analysis/utilization-report`
- Productivity `/time/analysis/productivity`

### Setup
- Time Types `/time/setup/time-types`
- Time Rules `/time/setup/time-rules`
- Timesheet Templates `/time/setup/timesheet-templates`

---

## 11. PAYROLL & WORKFORCE

### Workforce
- Employees `/payroll-workforce/workforce/employees`
- Employment Contracts `/payroll-workforce/workforce/employment-contracts`
- Job Positions `/payroll-workforce/workforce/job-positions`
- Employee Documents `/payroll-workforce/workforce/employee-documents`
- Contractor Management `/payroll-workforce/workforce/contractor-management`
- Recruiting `[E]` `/payroll-workforce/workforce/recruiting`

### Time & Leave
- Leave Requests `/payroll-workforce/time-leave/leave-requests`
- Leave Balances `/payroll-workforce/time-leave/leave-balances`
- Holiday Calendar `/payroll-workforce/time-leave/holiday-calendar`
- Overtime Rules `/payroll-workforce/time-leave/overtime-rules`
- Shift Scheduling `[E]` `/payroll-workforce/time-leave/shift-scheduling`

### Payroll Processing
- Payroll Runs `/payroll-workforce/payroll-processing/payroll-runs`
- Off-Cycle Payroll `/payroll-workforce/payroll-processing/off-cycle-payroll`
- Payroll Adjustments `/payroll-workforce/payroll-processing/payroll-adjustments`
- Bonuses & Commissions `/payroll-workforce/payroll-processing/bonuses-commissions`
- Final Pay `/payroll-workforce/payroll-processing/final-pay`
- Payroll Approvals `/payroll-workforce/payroll-processing/payroll-approvals`
- Payroll History `/payroll-workforce/payroll-processing/payroll-history`

### Compensation
- Salary Structures `/payroll-workforce/compensation/salary-structures`
- Allowances `/payroll-workforce/compensation/allowances`
- Deductions `/payroll-workforce/compensation/deductions`
- Loans `/payroll-workforce/compensation/loans`
- Benefit Plans `[E]` `/payroll-workforce/compensation/benefit-plans`

### Payroll Taxes & Statutory
- Tax Withholding `/payroll-workforce/payroll-taxes/tax-withholding`
- Government Contributions `/payroll-workforce/payroll-taxes/government-contributions`
- Remittance Tracking `/payroll-workforce/payroll-taxes/remittance-tracking`
- Payroll Reports `/payroll-workforce/payroll-taxes/payroll-reports`

---

## 12. TAXES

### Tax Center
- Tax Dashboard `/taxes/tax-center/tax-dashboard`
- Tax Liabilities `/taxes/tax-center/tax-liabilities`
- Filing & Payments `/taxes/tax-center/filing-payments`
- Tax Calendar `/taxes/tax-center/tax-calendar`

### Tax Setup
- Tax Agencies `/taxes/tax-setup/tax-agencies`
- Tax Types `/taxes/tax-setup/tax-types`
- Tax Rates `/taxes/tax-setup/tax-rates`
- Tax Codes `/taxes/tax-setup/tax-codes`
- Jurisdictions `[E]` `/taxes/tax-setup/jurisdictions`
- Withholding Setup `/taxes/tax-setup/withholding-setup`
- Exemptions & Rules `/taxes/tax-setup/exemptions-rules`

### Tax Studio `[E]`
- Country Templates `/taxes/tax-studio/country-templates`
- Rule Engine `/taxes/tax-studio/rule-engine`
- Tax Profiles `/taxes/tax-studio/tax-profiles`
- Advanced Configuration `/taxes/tax-studio/advanced-configuration`

### Sales & Output Tax `[PH]`
- VAT / Sales Tax `/taxes/sales-output-tax/vat-sales-tax`
- Zero-Rated & Exempt Sales `/taxes/sales-output-tax/zero-rated-exempt`
- Output Tax Ledger `/taxes/sales-output-tax/output-tax-ledger`

### Purchase & Input Tax `[PH]`
- Input VAT `/taxes/purchase-input-tax/input-vat`
- Expanded Withholding `/taxes/purchase-input-tax/expanded-withholding`
- Creditable Withholding `/taxes/purchase-input-tax/creditable-withholding`
- Tax Reconciliation `/taxes/purchase-input-tax/tax-reconciliation`

### Tax Reporting `[PH]`
- Tax Summary `/taxes/tax-reporting/tax-summary`
- VAT Payable `/taxes/tax-reporting/vat-payable`
- Withholding Report `/taxes/tax-reporting/withholding-report`
- Tax Liability Report `/taxes/tax-reporting/tax-liability-report`
- Audit Trail by Tax Code `/taxes/tax-reporting/audit-trail-tax-code`

### Filing & Payments `[PH]`
- Tax Returns `/taxes/filing-payments/tax-returns`
- Filing History `/taxes/filing-payments/filing-history`
- Tax Payments `/taxes/filing-payments/tax-payments`
- Remittance Tracking `/taxes/filing-payments/remittance-tracking`
- E-Filing `[E]` `/taxes/filing-payments/e-filing`

### Corporate Tax `[PH][E]`
- Income Tax `/taxes/corporate-tax/income-tax`
- Deferred Tax `/taxes/corporate-tax/deferred-tax`
- Transfer Pricing `/taxes/corporate-tax/transfer-pricing`
- Multi-Jurisdiction Tax `/taxes/corporate-tax/multi-jurisdiction-tax`
- Tax Risk & Optimization `/taxes/corporate-tax/tax-risk-optimization`

### Year-End `[PH]`
- Annual Tax Summary `/taxes/year-end/annual-tax-summary`
- Tax Adjustments `/taxes/year-end/tax-adjustments`
- Tax Closing Entries `/taxes/year-end/tax-closing-entries`

### US Tax `[US]`
- Sales Tax Setup `/taxes/us-sales-tax/setup`
- 1099 Reporting `/taxes/us-year-end/1099`
- W-2 / Payroll Reporting `/taxes/us-year-end/w2`
- Federal Returns `/taxes/us-federal-returns`
- State & Local Returns `/taxes/us-state-returns`

### Philippine Tax `[PH]`
#### BIR Forms
- Form 2550Q (Quarterly VAT) `/philippine-tax/bir-forms/form-2550q`
- Form 2550M (Monthly VAT) `/philippine-tax/bir-forms/form-2550m`
- Form 2307 (Creditable Tax) `/philippine-tax/bir-forms/form-2307`
- Form 2316 (Compensation) `/philippine-tax/bir-forms/form-2316`
- Form 1601CQ (Qtrly Remittance) `/philippine-tax/bir-forms/form-1601cq`
- Form 1604CF (Alphalist Annual) `/philippine-tax/bir-forms/form-1604cf`

#### Withholding Tax
- EWT 1% — General `/philippine-tax/withholding/ewt-1`
- EWT 2% — Goods/Services `/philippine-tax/withholding/ewt-2`
- EWT 5% — Officers `/philippine-tax/withholding/ewt-5`
- EWT 10% — Lease/Rental `/philippine-tax/withholding/ewt-10`
- Final Tax 1% — Gross Sales `/philippine-tax/withholding/final-1`
- Final Tax 5% — Capital Gains `/philippine-tax/withholding/final-5`

#### VAT Management
- VAT Registration `/philippine-tax/vat/vat-registration`
- VAT Ledger `/philippine-tax/vat/vat-ledger`
- VAT Transactions `/philippine-tax/vat/vat-transactions`
- VAT Returns `/philippine-tax/vat/vat-returns`
- 3% Percentage Tax `/philippine-tax/vat/percentage-tax`

#### Payroll Taxes (PH)
- SSS Contributions `/philippine-tax/payroll-taxes/sss`
- PhilHealth Contributions `/philippine-tax/payroll-taxes/philhealth`
- Pag-IBIG Contributions `/philippine-tax/payroll-taxes/pag-ibig`
- Withholding Tax on Comp. `/philippine-tax/payroll-taxes/withholding`
- 13th Month Pay `/philippine-tax/payroll-taxes/13th-month-pay`

#### Local Taxes
- Mayor's Permit `/philippine-tax/local-taxes/mayors-permit`
- Barangay Clearance `/philippine-tax/local-taxes/barangay-clearance`
- Real Property Tax `/philippine-tax/local-taxes/real-property-tax`
- Community Tax Certificate `/philippine-tax/local-taxes/community-tax`
- Business Tax `/philippine-tax/local-taxes/business-tax`

#### Tax Calendar
- Filing Deadlines `/philippine-tax/tax-calendar/filing-deadlines`
- Compliance Alerts `/philippine-tax/tax-calendar/compliance-alerts`
- Tax Obligations `/philippine-tax/tax-calendar/tax-obligations`

---

## 13. REPORTING

### Reports Center
- All Reports `/reporting/reports-center/all-reports`
- Financial Statements `/reporting/reports-center/financial-statements`
- Accountant Reports `/reporting/reports-center/accountant-reports`
- Banking Reports `/reporting/reports-center/banking-reports`
- Sales Reports `/reporting/reports-center/sales-reports`
- Expense Reports `/reporting/reports-center/expense-reports`
- Inventory Reports `/reporting/reports-center/inventory-reports`
- Project Reports `/reporting/reports-center/project-reports`
- Payroll Reports `/reporting/reports-center/payroll-reports`
- Tax Reports `/reporting/reports-center/tax-reports`

### Analytics
- Executive Dashboard `/reporting/analytics/executive-dashboard`
- KPI Dashboard `/reporting/analytics/kpi-dashboard`
- Revenue Trends `/reporting/analytics/revenue-trends`
- Forecasts `/reporting/analytics/forecasts`
- Benchmarks `/reporting/analytics/benchmarks`

### Custom Reports
- Report Builder `/reporting/custom-reports/report-builder`
- Saved Reports `/reporting/custom-reports/saved-reports`
- Report Templates `/reporting/custom-reports/report-templates`
- Scheduled Reports `/reporting/custom-reports/scheduled-reports`

### Performance Center
- Business Performance `/reporting/performance-center/business-performance`
- Saved Views `/reporting/performance-center/saved-views`
- ESG Reporting `[E]` `/reporting/performance-center/esg-reporting`

---

## 14. COMPLIANCE `[E]`

### Controls
- Internal Controls `/compliance/controls/internal-controls`
- Control Testing `/compliance/controls/control-testing`
- Policy Management `/compliance/controls/policy-management`

### Monitoring
- Issue Tracking `/compliance/monitoring/issue-tracking`
- Fraud Detection Rules `/compliance/monitoring/fraud-detection-rules`
- Audit Log Analysis `/compliance/monitoring/audit-log-analysis`

### Reporting
- SOX Compliance `/compliance/reporting/sox-compliance`
- Compliance Reports `/compliance/reporting/compliance-reports`
- Attestations `/compliance/reporting/attestations`

---

## 15. AUTOMATION

### Workflow Engine
- Workflow Builder `/automation/workflow-engine/workflow-builder`
- Smart Rules `/automation/workflow-engine/smart-rules`
- Email Notifications `/automation/workflow-engine/email-notifications`

### Approvals & Governance
- Approval Matrices `/automation/approvals-governance/approval-matrices`
- Approval Chains `/automation/approvals-governance/approval-chains`
- Delegation Rules `/automation/approvals-governance/delegation-rules`

### AI & Intelligence
- AI Bookkeeping `/automation/ai-intelligence/ai-bookkeeping`
- Smart Matching `/automation/ai-intelligence/smart-matching`
- Document Recognition `/automation/ai-intelligence/document-recognition`

### Scheduling
- Scheduled Reports `/automation/scheduling/scheduled-reports`
- Batch Processing `/automation/scheduling/batch-processing`
- Recurring Templates Hub `/automation/scheduling/recurring-templates-hub`

### Monitoring
- Automation Logs `/automation/monitoring/automation-logs`
- Error Queue `/automation/monitoring/error-queue`

---

## 16. MY ACCOUNTANT

### Accountant Management
- My Accountants `/accountant-workspace/my-accountant`
- Access Control `/accountant-workspace/access-control`
- Invitations `/accountant-workspace/invitations`

### Document Exchange
- Request Documents `/accountant-workspace/documents/request`
- Send Documents `/accountant-workspace/documents/send`
- Received Documents `/accountant-workspace/documents/received`
- Sent Documents `/accountant-workspace/documents/sent`
- Document Archive `/accountant-workspace/documents/archive`

### Communication
- Accountant Chat `/accountant-workspace/chat`
- Shared Notes `/accountant-workspace/shared-notes`
- Client Requests `/accountant-workspace/client-requests`

### Tasks & Requests
- Pending Tasks `/accountant-workspace/tasks/pending`
- Completed Tasks `/accountant-workspace/tasks/completed`
- Information Requests `/accountant-workspace/tasks/information-requests`

### Collaboration
- Shared Reports `/accountant-workspace/collaboration/shared-reports`
- Review Comments `/accountant-workspace/collaboration/review-comments`
- Approval Requests `/accountant-workspace/collaboration/approval-requests`
- Work Papers `/accountant-workspace/collaboration/work-papers`

### Scheduling
- Appointments `/accountant-workspace/scheduling/appointments`
- Deadlines `/accountant-workspace/scheduling/deadlines`
- Reminders `/accountant-workspace/scheduling/reminders`

### Books & Review
- Books Review `/accountant-workspace/books-review`
- Adjusting Entries `/accountant-workspace/adjusting-entries`
- Reconciliation Hub `/accountant-workspace/reconciliation-hub`
- Live Experts `/accountant-workspace/live-experts`

---

## 17. APPS & INTEGRATIONS

### Discover
- App Marketplace `/apps-integrations/discover/app-marketplace`
- Featured Apps `/apps-integrations/discover/featured-apps`
- Suggested Integrations `/apps-integrations/discover/suggested-integrations`

### My Integrations
- Connected Apps `/apps-integrations/my-integrations/connected-apps`
- Connection Health `/apps-integrations/my-integrations/connection-health`
- Integration Logs `/apps-integrations/my-integrations/integration-logs`

### Developer Tools `[E]`
- API Keys `/apps-integrations/developer-tools/api-keys`
- Webhooks `/apps-integrations/developer-tools/webhooks`
- Developer Sandbox `/apps-integrations/developer-tools/developer-sandbox`
- API Documentation `/apps-integrations/developer-tools/api-documentation`

### Data Tools
- Import Data `/apps-integrations/data-tools/import-data`
- Export Data `/apps-integrations/data-tools/export-data`
- Import History `/apps-integrations/data-tools/import-history`
- Data Sync Status `/apps-integrations/data-tools/data-sync-status`

---

## 18. AI & ANALYTICS

### Insights
- Insights Dashboard `/ai-analytics/insights/insights-dashboard`
- Cash Flow Alerts `/ai-analytics/insights/cash-flow-alerts`
- Tax Optimization `/ai-analytics/insights/tax-optimization`
- Anomaly Detection `/ai-analytics/insights/anomaly-detection`

### Predictions
- Revenue Forecast `/ai-analytics/predictions/revenue-forecast`
- Cash Flow Forecast `/ai-analytics/predictions/cash-flow-forecast`
- Expense Predictions `/ai-analytics/predictions/expense-predictions`
- Payment Predictions `/ai-analytics/predictions/payment-predictions`

### AI Agents
- Tax Optimizer Agent `/ai-analytics/agents/tax-optimizer`
- Cash Flow Manager `/ai-analytics/agents/cash-flow-manager`
- Fraud Detector `/ai-analytics/agents/fraud-detector`
- Collections Agent `/ai-analytics/agents/collections-agent`

### Chat Assistant
- AI Chat `/ai-analytics/chat/ai-chat`
- Query History `/ai-analytics/chat/query-history`

### Governance
- AI Rules `/ai-analytics/governance/ai-rules`
- AI Audit Logs `/ai-analytics/governance/audit-logs`
- Model Performance `/ai-analytics/governance/model-performance`

---

## 19. SETTINGS

### Account & Billing
- Subscription & Plans `/settings/account-billing/subscription-plans`
- Billing History `/settings/account-billing/billing-history`
- Payment Methods `/settings/account-billing/payment-methods`

### Company Profile
- Company Details `/settings/company-profile/company-details`
- Fiscal Year Setup `/settings/company-profile/fiscal-year-setup`
- Operating Hours `/settings/company-profile/operating-hours`

### Entity Management `[E]`
- Entity Defaults `/settings/entity-management/entity-defaults`
- Base Currency `/settings/entity-management/base-currency`
- Numbering Sequences `/settings/entity-management/numbering-sequences`

### Users & Security
- User Management `/settings/users-security/user-management`
- Roles & Permissions `/settings/users-security/roles-permissions`
- Teams & Groups `/settings/users-security/teams-groups`
- Login History `/settings/users-security/login-history`
- Two-Factor Auth (2FA) `/settings/users-security/two-factor-auth`

### Accounting Preferences
- Default Accounts `/settings/accounting-preferences/default-accounts`
- Closing Date Protection `/settings/accounting-preferences/closing-date-protection`
- Currency Settings `/settings/accounting-preferences/currency-settings`

### Customization
- Custom Fields `/settings/customization/custom-fields`
- Custom Lists `/settings/customization/custom-lists`
- Transaction Tags `/settings/customization/transaction-tags`
- PDF Templates `/settings/customization/pdf-templates`

### Notifications
- System Alerts `/settings/notifications/system-alerts`
- Email Digest Settings `/settings/notifications/email-digest-settings`

### Data & Privacy
- Audit Log `/settings/data-privacy/audit-log`
- Data Export `/settings/data-privacy/data-export`
- Data Backup `/settings/data-privacy/data-backup`
- Trash / Deleted Records `/settings/data-privacy/trash-deleted-records`

### Localization
- Language `/settings/localization/language`
- Date & Number Formats `/settings/localization/formats`
- Regional Settings `/settings/localization/regional`
- Time Zone `/settings/localization/timezone`

---

*Source of truth: `Haypbooks/Frontend/src/components/owner/ownerNavConfig.ts`*
