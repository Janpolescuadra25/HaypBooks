# HaypBooks Frontend–Backend Integration Audit

**Date:** April 10, 2026  
**Auditor:** GitHub Copilot (automated)  
**Method:** Full file-by-file inspection of every `page.tsx` under `Frontend/src/app/`, cross-referenced against all Backend controllers.

---

## Legend

| Status | Meaning |
|--------|---------|
| **COMPLETE** | Real API calls via `apiClient` or `useCrud`/service hooks, full data rendering, forms, mutations |
| **PARTIAL** | `PageDocumentation` stub — describes intended UI/UX with detailed component specs, but no real API integration or live UI |
| **STUB** | `ComingSoon` component — placeholder only, scheduled for Q2 2026 |

---

## Backend API Modules Inventory

All controllers verified under `Backend/src/`:

| Module | Controller File | Key Endpoints |
|--------|----------------|---------------|
| Auth | `auth/auth.controller.ts` | login, refresh, logout, me |
| Accounting | `accounting/accounting.controller.ts` | accounts CRUD, journal entries, trial balance, periods, GL |
| AR | `ar/ar.controller.ts` | customers, quotes, invoices, payments, aging report |
| AP | `ap/ap.controller.ts` | vendors, bills, bill-payments, purchase-orders, aging report |
| Sales | `sales/sales.controller.ts` | customers, invoices, payments |
| Expenses | `expenses/expenses.controller.ts` | vendors, bills, bill-payments |
| Banking | `banking/banking.controller.ts` | bank accounts, transactions, reconciliations, deposits, smart-rules, feed-connections, checks, credit cards |
| Reporting | `reporting/reporting.controller.ts` | P&L, balance sheet, cash flow, trial balance, budgets, dashboards, ESG |
| General Ledger | `general-ledger/general-ledger.controller.ts` | ledger entries, summary, account-list |
| Inventory | `inventory/inventory.controller.ts` | items, locations, transactions, assets, depreciation, disposal, bin-locations, physical-counts, reorder-rules |
| Payroll | `payroll/payroll.controller.ts` | employees, runs, paychecks, salary structures, benefit plans, deductions, leave, government contributions, shift schedules, allowances |
| Tax | `tax/tax.controller.ts` | codes, rates, VAT returns, withholding, BIR forms, alphalist, percentage tax, calendar, income tax, deferred tax, year-end, remittances, e-filing |
| Projects | `projects/projects.controller.ts` | projects CRUD, milestones, budgets, tasks, time-entries, expenses, profitability, retainers, resource-plans |
| Time | `time/time.controller.ts` | time entries, timesheets, timer, billable, utilization |
| Tasks | `tasks/tasks.controller.ts` | tasks CRUD, comments |
| Contacts | `contacts/contacts.controller.ts` | customers, vendors (shared contact store) |
| Organization | `organization/organization.controller.ts` | legal entities, consolidation, intercompany, departments, locations, filing calendar |
| Financial Services | `financial-services/financial-services.controller.ts` | loans, credit lines, investments, forecasts, cash runway, credit score |
| Integrations | `integrations/integrations.controller.ts` | AI insights, audit logs, API keys, bank-feed connections |
| Onboarding | `onboarding/onboarding.controller.ts` | onboarding progress, steps |
| Owner | `owner/owner.controller.ts` | owner-level aggregation |
| Companies | `companies/company.controller.ts` | company CRUD |
| Users | `users/users.controller.ts` | user profile, workspace users |
| Practice Hub | `practice-hub/practice-hub.controller.ts` | practice management |

---

## 1. Home Dashboard Module

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/home/dashboard` | **COMPLETE** | `onboardingService.getProgress()`, `/api/users/me` | ✅ Yes | Renders `OwnerDashboard` component; redirects to setup if onboarding incomplete |
| `/home/business-health` | **STUB** | None | ✅ Partial (reporting KPIs exist) | ComingSoon — Q2 2026 |
| `/home/cash-position` | **STUB** | None | ✅ Yes (banking cash-position endpoint) | ComingSoon — Q2 2026 |
| `/home/performance` | **STUB** | None | ✅ Partial (reporting KPIs exist) | ComingSoon — Q2 2026 |
| `/home/setup-center` | **STUB** | None | ✅ Yes (onboarding controller) | ComingSoon — Q2 2026 |
| `/home/notifications` | **STUB** | None | ❌ No dedicated controller | ComingSoon — Q2 2026 |
| `/home/help` | **STUB** | None | ❌ No backend | ComingSoon — Q2 2026 |
| `/home/shortcuts` | **STUB** | None | ❌ No backend | ComingSoon — Q2 2026 |

---

## 2. Accounting Module

### 2a. Core Accounting

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accounting/core-accounting/chart-of-accounts` | **COMPLETE** | `GET/POST /companies/:id/accounting/accounts`, `DELETE`, `PUT`, `seed-default`, `coa-templates` | ✅ Yes | Full tree-view CRUD, search, filters, audit trail integration |
| `/accounting/core-accounting/chart-of-accounts/[id]/audit-log` | **STUB** | None | ✅ Yes (`accounts/audit-log` endpoint exists) | ComingSoon — Q2 2026 |
| `/accounting/core-accounting/chart-of-accounts/audit-log` | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |
| `/accounting/core-accounting/general-ledger` | **COMPLETE** | `GET /companies/:id/general-ledger` | ✅ Yes | Delegates to `GeneralLedgerPage` component with real API |
| `/accounting/core-accounting/journal-entries` | **COMPLETE** | `GET/POST /companies/:id/accounting/journal-entries`, `POST/post`, `POST/void`, `DELETE` | ✅ Yes | Full list, create, post, void, delete |
| `/accounting/core-accounting/journal-entries/new` | **COMPLETE** | `POST /companies/:id/accounting/journal-entries` | ✅ Yes | Full journal entry creation form |
| `/accounting/core-accounting/journal-entries/[id]` | **COMPLETE** | `GET /journal-entries/:jeId` | ✅ Yes | Detail view |
| `/accounting/core-accounting/journal-entries/[id]/activity` | **COMPLETE** | `GET /journal-entries/:jeId/activity` | ✅ Yes | Activity/audit log view |
| `/accounting/core-accounting/journal-entries/audit-log` | **STUB** | None | ✅ Yes (`journal-entries/audit-log` endpoint) | ComingSoon — Q2 2026 |
| `/accounting/core-accounting/trial-balance` | **COMPLETE** | `GET /companies/:id/accounting/trial-balance` | ✅ Yes | Delegates to `TrialBalancePage` with real API |
| `/accounting/core-accounting/accounts-receivable` | **STUB** | None | ✅ Yes (AR controller) | ComingSoon — routing via AR module |
| `/accounting/core-accounting/accounts-payable` | **STUB** | None | ✅ Yes (AP controller) | ComingSoon — routing via AP module |

### 2b. Fixed Assets

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accounting/fixed-assets/asset-management/asset-register` | **STUB** | None | ✅ Yes (inventory assets endpoints) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/asset-management/asset-categories` | **STUB** | None | ✅ Yes (`GET/POST asset-categories`) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/asset-management/asset-locations` | **STUB** | None | ✅ Yes (inventory locations) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/asset-management/new-asset` | **STUB** | None | ✅ Yes (`POST assets`) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/depreciation` | **STUB** | None | ✅ Yes (`POST /assets/:id/depreciate`) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/depreciation/schedules` | **STUB** | None | ✅ Yes (`GET assets/:id/schedule`) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/depreciation/runs` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/depreciation/reports` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/asset-disposal` | **STUB** | None | ✅ Yes (`POST /assets/:id/dispose`) | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/asset-register` | **STUB** | None | ✅ Yes | ComingSoon — duplicate route |
| `/accounting/fixed-assets/asset-revaluation` | **STUB** | None | ❌ No revaluation endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/disposals` | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/transfers` | **STUB** | None | ❌ Not found | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/lifecycle/disposals` | **STUB** | None | ✅ Partial | ComingSoon — duplicate of disposals |
| `/accounting/fixed-assets/lifecycle/impairments` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/lifecycle/maintenance` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/lifecycle/revaluations` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/lifecycle/transfers` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/insurance/asset-insurance` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/insurance/coverage-tracking` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/insurance/premium-management` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/reports/asset-valuation` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/reports/depreciation-summary` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/reports/fixed-asset-schedule` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/fixed-assets/reports/gain-loss-disposal` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 2c. Period Close

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accounting/period-close/close-checklist` | **STUB** | None | ✅ Yes (`POST periods/:periodId/close`) | ComingSoon — Q2 2026 |
| `/accounting/period-close/lock-period` | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |
| `/accounting/period-close/lock-periods` | **STUB** | None | ✅ Yes | ComingSoon — duplicate route |
| `/accounting/period-close/adjustments` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/accounting/period-close/journal-post` | **STUB** | None | ✅ Yes (`POST journal-entries/:jeId/post`) | ComingSoon — Q2 2026 |
| `/accounting/period-close/reconciliations` | **STUB** | None | ✅ Yes (banking reconciliations) | ComingSoon — Q2 2026 |
| `/accounting/period-close/sign-offs` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/period-close/close-archive` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/period-close/period-reports` | **STUB** | None | ✅ Partial (reporting module) | ComingSoon — Q2 2026 |
| `/accounting/period-close/multi-currency-revaluation` | **STUB** | None | ✅ Yes (`GET period-close/multi-currency-revaluation`) | ComingSoon — Q2 2026 |
| `/accounting/close-workflow` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |

### 2d. Allocations

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accounting/allocations/allocation-runs` | **STUB** | None | ❌ No allocation endpoint | ComingSoon — Q2 2026 |
| `/accounting/allocations/allocation-rules` | **STUB** | None | ❌ No allocation endpoint | ComingSoon — Q2 2026 |
| `/accounting/allocations/allocation-history` | **STUB** | None | ❌ No allocation endpoint | ComingSoon — Q2 2026 |
| `/accounting/allocations/run-allocations` | **STUB** | None | ❌ No allocation endpoint | ComingSoon — Q2 2026 |

### 2e. Planning / Budgets

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accounting/planning/budgets` | **STUB** | None | ✅ Yes (`GET/POST /reporting/budgets`) | ComingSoon — Q2 2026 |
| `/accounting/planning/budget-vs-actual` | **STUB** | None | ✅ Yes (`GET budgets/:id/vs-actual`) | ComingSoon — Q2 2026 |
| `/accounting/planning/forecasts` | **STUB** | None | ❌ No forecast endpoint in accounting | ComingSoon — Q2 2026 |
| `/accounting/planning/scenario-planning` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 2f. Revaluations

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accounting/revaluations/currency-revaluation` | **STUB** | None | ✅ Partial (period-close revaluation endpoint) | ComingSoon — Q2 2026 |
| `/accounting/revaluations/fx-revaluation` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/accounting/revaluations/revaluation-history` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accounting/revaluations/revaluation-schedule` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

---

## 3. Sales Module

### 3a. Billing

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/billing/invoices` | **COMPLETE** | `GET/POST /companies/:id/sales/invoices`, `PUT`, `void` | ✅ Yes | Full invoices page with list, detail, status management |
| `/sales/billing/invoices/new` | **COMPLETE** | `POST /companies/:id/sales/invoices`, `GET customers`, `GET accounts` | ✅ Yes | Full invoice creation form with line items, tax, customer lookup |
| `/sales/billing/credit-notes` | **COMPLETE** | `GET /companies/:id/ar/credit-notes` (AR module) | ✅ Yes | Lists credit notes with issue/void actions |
| `/sales/billing/recurring-invoices` | **COMPLETE** | `GET /companies/:id/ar/recurring` | ✅ Yes | Recurring templates list with activate/deactivate |
| `/sales/billing/customer-statements` | **STUB** | None | ✅ Partial (reporting) | ComingSoon — Q2 2026 |
| `/sales/billing/payment-links` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 3b. Customers

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/customers/customers` | **COMPLETE** | `GET/POST/PUT/DELETE /companies/:id/sales/customers` | ✅ Yes | Full CRUD via `useCrud` hook; paginated list, create/edit/delete modals |
| `/sales/customers/customer-list` | **STUB** | None | ✅ Yes | ComingSoon — duplicate route of `customers/customers` |
| `/sales/customers/credit-terms` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/customers/customer-groups` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/customers/customer-documents` | **STUB** | None | ✅ Partial (attachments controller) | ComingSoon — Q2 2026 |
| `/sales/customers/customer-portal` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/customers/price-lists` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 3c. Collections / AR

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/collections/ar-aging` | **COMPLETE** | `GET /companies/:id/ar/reports/aging` | ✅ Yes | AR aging buckets with per-customer breakdown |
| `/sales/collections/collections-center` | **COMPLETE** | `GET /companies/:id/ar/collections` | ✅ Yes | Collections cases list |
| `/sales/collections/dunning-management` | **COMPLETE** | `GET /companies/:id/ar/dunning-rules` | ✅ Yes | Dunning rules CRUD |
| `/sales/collections/customer-payments` | **COMPLETE** | `GET /companies/:id/ar/payments` | ✅ Yes | Customer payment receipts list |
| `/sales/collections/write-offs` | **COMPLETE** | `GET /companies/:id/ar/write-offs` | ✅ Yes | Write-off list with void/approve |
| `/sales/collections/aging-report` | **STUB** | None | ✅ Yes | ComingSoon — duplicate of ar-aging |
| `/sales/collections/ar-aging-alerts` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 3d. Refunds

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/refunds/refund-list` | **STUB** | None | ✅ Yes (`GET ar/refunds`) | ComingSoon — Q2 2026 |
| `/sales/refunds/process-refund` | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |
| `/sales/refunds/refund-history` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |

### 3e. Estimates / Quotes

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/estimates/estimate-list` | **STUB** | None | ✅ Yes (`GET ar/quotes`) | ComingSoon — Q2 2026 |
| `/sales/estimates/estimate-settings` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 3f. Revenue Management

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/revenue-management/revenue-recognition` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/revenue-management/deferred-revenue` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/revenue-management/subscription-billing` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/revenue-management/contract-revenue` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 3g. Sales Operations / Insights / Settings

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/sales/sales-operations/products-services` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/sales-operations/sales-orders` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/sales-operations/quotes-estimates` | **STUB** | None | ✅ Yes (ar/quotes) | ComingSoon — Q2 2026 |
| `/sales/sales-insights/customer-profitability` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/sales-insights/revenue-trends` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/sales-insights/sales-performance` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/sales-settings/invoice-settings` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/sales/sales-settings/product-catalog` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

---

## 4. Expenses Module

### 4a. Payables (AP)

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/expenses/payables/bills` | **COMPLETE** | `GET/POST /companies/:id/expenses/bills`, status updates | ✅ Yes | Full bills list with approve/void/detail |
| `/expenses/payables/ap-aging` | **COMPLETE** | `GET /companies/:id/ap/reports/aging` | ✅ Yes | AP aging by vendor, bucket breakdown |
| `/expenses/payables/bill-payments` | **COMPLETE** | `GET/POST /companies/:id/expenses/bill-payments` | ✅ Yes | Payment records list with void |
| `/expenses/payables/recurring-bills` | **STUB** | None | ❌ No recurring bills endpoint | ComingSoon — Q2 2026 |
| `/expenses/payables/payment-runs` | **STUB** | None | ❌ No payment runs endpoint | ComingSoon — Q2 2026 |

### 4b. Vendors

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/expenses/vendors/vendors` | **COMPLETE** | `GET/POST/PUT/DELETE /companies/:id/expenses/vendors` | ✅ Yes | Full CRUD via `useCrud`; modal forms, list, delete |
| `/expenses/vendors/vendor-list` | **STUB** | None | ✅ Yes | ComingSoon — duplicate of vendors/vendors |
| `/expenses/vendors/1099-management` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/vendors/contractor-management` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/vendors/vendor-documents` | **STUB** | None | ✅ Partial (attachments) | ComingSoon — Q2 2026 |
| `/expenses/vendors/vendor-portal` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 4c. Expense Capture

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/expenses/expense-capture/expenses` | **STUB** | None | ❌ No personal expenses endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-capture/receipts` | **PARTIAL** | None (PageDocumentation) | ❌ No OCR/receipts endpoint | Describes OCR inbox UI; backend not built |
| `/expenses/expense-capture/employee-reimbursements` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-capture/mileage` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-capture/company-card-activity` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 4d. Purchase Orders

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/expenses/purchase-orders/po-list` | **PARTIAL** | None (PageDocumentation) | ✅ Yes (`GET/POST ap/purchase-orders`) | Detailed UI spec documented; backend exists but UI not wired |
| `/expenses/purchase-orders/po-approval` | **STUB** | None | ✅ Yes (`PATCH ap/purchase-orders/:id/status`) | ComingSoon — Q2 2026 |
| `/expenses/purchase-orders/po-receiving` | **STUB** | None | ✅ Yes (`POST ap/purchase-orders/:id/convert`) | ComingSoon — Q2 2026 |

### 4e. Bills (duplicate routes)

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/expenses/bills/bill-list` | **STUB** | None | ✅ Yes | ComingSoon — duplicate of payables/bills |
| `/expenses/bills/recurring-bills` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/bills/vendor-credit-notes` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 4f. Expense Reports / Insights / Settings / Purchasing

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/expenses/expense-reports/my-expenses` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-reports/expense-approval` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-reports/corporate-cards` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-reports/mileage` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-insights/spend-analysis` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-insights/vendor-spend` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-insights/cost-allocation` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/expense-settings/expense-policy` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/expenses/purchasing/*` (5 pages) | **STUB** | None | ✅ Partial (AP module) | ComingSoon — Q2 2026 |
| `/expenses/aging` | **STUB** | None | ✅ Yes (ap/reports/aging) | ComingSoon — Q2 2026 |

---

## 5. Banking & Cash Module

### 5a. Accounts

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/banking-cash/accounts/bank-accounts` | **COMPLETE** | `GET/POST/PUT/DELETE /companies/:id/banking/accounts` | ✅ Yes | Full CRUD via `useCrud`; supports Checking/Savings/CreditCard/Cash |
| `/banking-cash/accounts/credit-cards` | **STUB** | None | ✅ Yes (`GET banking/credit-cards`) | ComingSoon — Q2 2026 |
| `/banking-cash/accounts/petty-cash` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |

### 5b. Transactions

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/banking-cash/transactions/bank-transactions` | **STUB** | None | ✅ Yes (`GET banking/accounts/:id/transactions`) | ComingSoon — Q2 2026; backend fully built |
| `/banking-cash/transactions/transaction-rules` | **STUB** | None | ✅ Yes (`GET/POST banking/smart-rules`) | ComingSoon — Q2 2026 |
| `/banking-cash/transactions/recurring-transactions` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/transactions/app-transactions` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 5c. Reconciliation

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/banking-cash/reconciliation/reconcile` | **STUB** | None | ✅ Yes (full reconciliation API: match, auto-match, discrepancies, adjustments, complete) | ComingSoon — Q2 2026; backend is the most complete of any unbuilt module |
| `/banking-cash/reconciliation/history` | **STUB** | None | ✅ Yes (`GET banking/accounts/:id/reconciliations`) | ComingSoon — Q2 2026 |
| `/banking-cash/reconciliation/reconciliation-reports` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/banking-cash/reconciliation/statement-archive` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/reconciliation/reports` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |

### 5d. Bank Feeds & Connections

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/banking-cash/bank-connections/connected-banks` | **STUB** | None | ✅ Yes (`GET banking/feed-connections`) | ComingSoon — Q2 2026 |
| `/banking-cash/bank-connections/statement-import` | **STUB** | None | ✅ Yes (`POST banking/accounts/:id/transactions/import`) | ComingSoon — Q2 2026 |
| `/banking-cash/bank-connections/sync-logs` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/bank-feeds/feed-connections` | **STUB** | None | ✅ Yes | ComingSoon — duplicate route |
| `/banking-cash/bank-feeds/matching-rules` | **STUB** | None | ✅ Yes (smart-rules) | ComingSoon — Q2 2026 |
| `/banking-cash/bank-feeds/feed-status` | **STUB** | None | ✅ Yes (`GET banking/feed-status`) | ComingSoon — Q2 2026 |
| `/banking-cash/bank-feeds/import-rules` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/banking-cash/bank-feeds/feed-history` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

### 5e. Deposits, Payments, Cash Management, Checks, Credit Facilities, Treasury

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/banking-cash/deposits/bank-deposits` | **STUB** | None | ✅ Yes (`GET/POST banking/deposits`) | ComingSoon — Q2 2026 |
| `/banking-cash/deposits/deposit-list` | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |
| `/banking-cash/deposits/deposit-slips` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/banking-cash/deposits/undeposited-funds` | **STUB** | None | ✅ Yes (`GET banking/undeposited-funds`) | ComingSoon — Q2 2026 |
| `/banking-cash/payments/vendor-payments` | **STUB** | None | ✅ Partial (expenses/bill-payments) | ComingSoon — Q2 2026 |
| `/banking-cash/payments/batch-payments` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/payments/payment-runs` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/cash-management/cash-position` | **STUB** | None | ✅ Yes (`GET banking/cash-position`) | ComingSoon — Q2 2026 |
| `/banking-cash/cash-management/cash-flow-projection` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/cash-management/short-term-forecast` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/banking-cash/checks/check-register` | **STUB** | None | ✅ Yes (`GET banking/checks`) | ComingSoon — Q2 2026 |
| `/banking-cash/checks/check-printing` | **STUB** | None | ✅ Yes (`POST banking/checks`) | ComingSoon — Q2 2026 |
| `/banking-cash/checks/stop-payments` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/banking-cash/credit-cards/credit-card-accounts` | **STUB** | None | ✅ Yes (banking/credit-cards) | ComingSoon — Q2 2026 |
| `/banking-cash/credit-cards/card-transactions` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/banking-cash/credit-cards/card-statements` | **STUB** | None | ✅ Yes (`GET banking/credit-cards/:id/statements`) | ComingSoon — Q2 2026 |
| `/banking-cash/credit-cards/credit-cards-list` | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |
| `/banking-cash/credit-facilities/credit-lines` | **STUB** | None | ✅ Yes (`GET financial-services/credit-lines`) | ComingSoon — Q2 2026 |
| `/banking-cash/treasury/*` (7 pages) | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/banking-cash/cash-accounts/*` (4 pages) | **STUB** | None | ✅ Partial | ComingSoon — duplicate routes |

---

## 6. Payroll & Workforce Module

> **All pages in this module are STUB (ComingSoon — Q2 2026).**  
> Backend controller is fully implemented (`payroll.controller.ts`).

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/payroll-workforce/payroll-processing/*` | 7 pages | ✅ Yes (runs, process, post, void, bonuses, final-pay, off-cycle, adjustments, approvals, history) | ComingSoon — Q2 2026 |
| `/payroll-workforce/employees/*` | 2 pages | ✅ Yes (employees CRUD) | ComingSoon — Q2 2026 |
| `/payroll-workforce/compensation/*` | 7 pages | ✅ Yes (salary-structures, benefit-plans, deductions, allowances, loans) | ComingSoon — Q2 2026 |
| `/payroll-workforce/payroll-taxes/*` | 4 pages | ✅ Yes (government-contributions) | ComingSoon — Q2 2026 |
| `/payroll-workforce/time-leave/*` | 5 pages | ✅ Yes (leave-requests, leave-balances, shift-schedules) | ComingSoon — Q2 2026 |
| `/payroll-workforce/leaves/*` | 3 pages | ✅ Yes | ComingSoon — duplicate routes |
| `/payroll-workforce/compliance/*` | 2 pages | ✅ Partial | ComingSoon — Q2 2026 |
| `/payroll-workforce/workforce/*` | 6 pages | ✅ Partial | ComingSoon — Q2 2026 |
| `/payroll-workforce/payroll/*` | 3 pages | ✅ Yes | ComingSoon — duplicate routes |

**Payroll Total: ~39 pages — all STUB**

---

## 7. Taxes Module

> **All pages in this module are STUB (ComingSoon — Q2 2026).**  
> Tax controller covers most sub-modules.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/taxes/tax-center/*` | 4 pages | ✅ Yes (summary, liability, calendar) | ComingSoon — Q2 2026 |
| `/taxes/vat/*` | 3 pages | ✅ Yes (vat-returns, output-tax-ledger) | ComingSoon — Q2 2026 |
| `/taxes/filing-payments/*` | 5 pages | ✅ Yes (e-filing, filing-history, remittances, payments, tax-returns) | ComingSoon — Q2 2026 |
| `/taxes/corporate-tax/*` | 4 pages | ✅ Yes (income-tax, deferred-tax, multi-jurisdiction, transfer-pricing) | ComingSoon — Q2 2026 |
| `/taxes/purchase-input-tax/*` | 4 pages | ✅ Yes (input-vat, creditable-withholding, expanded-withholding, reconciliation) | ComingSoon — Q2 2026 |
| `/taxes/sales-output-tax/*` | 3 pages | ✅ Yes (output-tax-ledger, vat-sales-tax, zero-rated-exempt) | ComingSoon — Q2 2026 |
| `/taxes/withholding-tax/*` | 2 pages | ✅ Yes (withholding) | ComingSoon — Q2 2026 |
| `/taxes/tax-setup/*` | 7 pages | ✅ Yes (codes, rates, agencies, jurisdictions, exemptions, withholding-setup) | ComingSoon — Q2 2026 |
| `/taxes/tax-reporting/*` | 5 pages | ✅ Yes (audit-trail, liability-report, summary) | ComingSoon — Q2 2026 |
| `/taxes/tax-studio/*` | 4 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/taxes/income-tax/*` | 2 pages | ✅ Yes (income-tax) | ComingSoon — Q2 2026 |
| `/taxes/year-end/*` | 3 pages | ✅ Yes (year-end endpoints) | ComingSoon — Q2 2026 |
| `/taxes/tax-calendar/*` | 1 page | ✅ Yes (calendar endpoint) | ComingSoon — Q2 2026 |
| `/taxes/us-*` (4 pages) | 4 pages | ❌ No US-specific endpoints | ComingSoon — Q2 2026 |

**Taxes Total: ~51 pages — all STUB**

---

## 8. Philippine Tax Module

> **All pages in this module are STUB (ComingSoon — Q2 2026).**  
> Most BIR-specific endpoints exist in the Tax controller.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/philippine-tax/bir-forms/*` | 10 pages (Form 1601C, 1601CQ, 1601EQ, 1604C, 1604CF, 1702RT, 2307, 2316, 2550M, 2550Q) | ✅ Yes (`GET/POST tax/bir-forms`, `GET tax/bir-forms/:formType`) | ComingSoon — Q2 2026 |
| `/philippine-tax/vat/*` | 5 pages | ✅ Yes (vat-returns, vat-ledger, percentage-tax, zero-rated-exempt) | ComingSoon — Q2 2026 |
| `/philippine-tax/withholding/*` | 6 pages | ✅ Yes (withholding, form-2307) | ComingSoon — Q2 2026 |
| `/philippine-tax/payroll-taxes/*` | 4 pages (SSS, PhilHealth, Pag-IBIG, 13th month) | ✅ Yes (government-contributions in payroll) | ComingSoon — Q2 2026 |
| `/philippine-tax/reports/alphalist` | 1 page | ✅ Yes (`GET/POST tax/alphalist`) | ComingSoon — Q2 2026 |
| `/philippine-tax/compliance/*` | 3 pages | ✅ Partial | ComingSoon — Q2 2026 |
| `/philippine-tax/tax-calendar/*` | 3 pages | ✅ Yes (calendar) | ComingSoon — Q2 2026 |
| `/philippine-tax/local-taxes/*` | 5 pages | ❌ No local tax endpoints | ComingSoon — Q2 2026 |

**Philippine Tax Total: ~37 pages — all STUB**

---

## 9. Inventory Module

> **All pages in this module are STUB (ComingSoon — Q2 2026).**  
> Inventory controller is moderately complete.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/inventory/items/*` | 2 pages (item-list, item-categories) | ✅ Yes (items CRUD, asset-categories) | ComingSoon — Q2 2026 |
| `/inventory/setup/*` | 4 pages | ✅ Yes (items, categories, units-of-measure) | ComingSoon — Q2 2026 |
| `/inventory/stock-operations/*` | 5 pages | ✅ Partial (transactions, physical-counts) | ComingSoon — Q2 2026 |
| `/inventory/stock/*` | 3 pages | ✅ Yes (stock, reorder-rules) | ComingSoon — Q2 2026 |
| `/inventory/warehouses/*` | 3 pages | ✅ Yes (locations, bin-locations) | ComingSoon — Q2 2026 |
| `/inventory/warehousing/*` | 3 pages | ✅ Yes | ComingSoon — duplicate routes |
| `/inventory/receiving/*` | 4 pages | ✅ Partial (AP purchase-orders) | ComingSoon — Q2 2026 |
| `/inventory/costing/*` | 3 pages | ❌ No costing endpoint | ComingSoon — Q2 2026 |
| `/inventory/valuation/*` | 4 pages | ❌ No valuation endpoint | ComingSoon — Q2 2026 |
| `/inventory/control/*` | 4 pages | ✅ Partial (reorder-rules, lot-serial, backorders) | ComingSoon — Q2 2026 |
| `/inventory/inventory-insights/*` | 3 pages | ❌ No insights endpoints | ComingSoon — Q2 2026 |
| `/inventory/reports/*` | 2 pages | ❌ No inventory reports endpoint | ComingSoon — Q2 2026 |

**Inventory Total: ~40 pages — all STUB**

---

## 10. Reports Module

### 10a. Financial Statements (Reporting Center)

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/reporting/reports-center/financial-statements/profit-and-loss` | **COMPLETE** | `GET /companies/:id/reporting/profit-and-loss` | ✅ Yes | Date-range selector, full P&L breakdown |
| `/reporting/reports-center/financial-statements/balance-sheet` | **COMPLETE** | `GET /companies/:id/reporting/balance-sheet` | ✅ Yes | Assets/Liabilities/Equity breakdown, balance check |
| `/reporting/reports-center/financial-statements/cash-flow-statement` | **COMPLETE** | `GET /companies/:id/reporting/cash-flow` | ✅ Yes | Operating/Investing/Financing sections |
| `/reporting/reports-center/financial-statements` (index) | **STUB** | None | ✅ Yes | ComingSoon — index/hub page |

### 10b. Accountant Reports

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/reporting/reports-center/accountant-reports/trial-balance` | **COMPLETE** | `GET /companies/:id/accounting/trial-balance` + `GET /reporting/trial-balance` | ✅ Yes | Full trial balance with debit/credit columns, balance check |
| `/reporting/reports-center/accountant-reports/general-ledger` | **COMPLETE** | `GET /companies/:id/general-ledger` | ✅ Yes | Delegates to GeneralLedgerPage |
| `/reporting/reports-center/accountant-reports` (index) | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |

### 10c. Expense & Sales Reports

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/reporting/reports-center/expense-reports/ap-aging` | **COMPLETE** | `GET /companies/:id/ap/reports/aging` | ✅ Yes | Vendor-level AP aging breakdown |
| `/reporting/reports-center/sales-reports/ar-aging` | **COMPLETE** | `GET /companies/:id/ar/reports/aging` | ✅ Yes | Customer-level AR aging breakdown |
| `/reporting/reports-center/expense-reports` (index) | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/reporting/reports-center/sales-reports` (index) | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/reporting/reports-center/banking-reports` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/reporting/reports-center/inventory-reports` | **STUB** | None | ❌ No inventory reports | ComingSoon — Q2 2026 |
| `/reporting/reports-center/payroll-reports` | **STUB** | None | ❌ No payroll reports endpoint | ComingSoon — Q2 2026 |
| `/reporting/reports-center/project-reports` | **STUB** | None | ✅ Yes (projects/profitability) | ComingSoon — Q2 2026 |
| `/reporting/reports-center/tax-reports` | **STUB** | None | ✅ Yes (tax endpoints) | ComingSoon — Q2 2026 |
| `/reporting/reports-center` (index) | **STUB** | None | ✅ Yes | ComingSoon — Q2 2026 |

### 10d. Other Reporting

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/reporting/standard-reports` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/reporting/custom-reports` | **STUB** | None | ✅ Partial (reporting/dashboards) | ComingSoon — Q2 2026 |
| `/reporting/custom-reports/report-builder` | **STUB** | None | ❌ No report-builder endpoint | ComingSoon — Q2 2026 |
| `/reporting/custom-reports/scheduled-reports` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/reporting/analytics/analytics-dashboards` | **STUB** | None | ✅ Yes (`GET reporting/dashboards`) | ComingSoon — Q2 2026 |
| `/reporting/financial-statements` | **STUB** | None | ✅ Yes | ComingSoon — top-level duplicate |
| `/reporting/performance-center` | **STUB** | None | ✅ Partial | ComingSoon — Q2 2026 |
| `/reporting/esg-reporting` | **STUB** | None | ✅ Yes (`GET reporting/esg`) | ComingSoon — Q2 2026 |
| `/reporting/saved-views` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

---

## 11. Projects Module

> **All pages in this module are STUB (ComingSoon — Q2 2026).**  
> Projects controller is fully implemented.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/projects/project-setup/*` | 5 pages (projects, budgets, milestones, contracts, templates) | ✅ Yes (projects CRUD, milestones, budget) | ComingSoon — Q2 2026 |
| `/projects/projects/*` | 2 pages | ✅ Yes | ComingSoon — duplicate routes |
| `/projects/billing/*` | 6 pages | ✅ Partial (retainers, WIP) | ComingSoon — Q2 2026 |
| `/projects/budgets/*` | 2 pages | ✅ Yes (budget endpoints) | ComingSoon — Q2 2026 |
| `/projects/financials/*` | 4 pages | ✅ Yes (profitability, WIP) | ComingSoon — Q2 2026 |
| `/projects/planning/*` | 4 pages | ✅ Yes (tasks, resource-plans) | ComingSoon — Q2 2026 |
| `/projects/tasks/*` | 2 pages | ✅ Yes (`GET/POST :projectId/tasks`) | ComingSoon — Q2 2026 |
| `/projects/time-billing/*` | 3 pages | ✅ Yes (time-entries, billable) | ComingSoon — Q2 2026 |
| `/projects/tracking/*` | 5 pages | ✅ Yes (expenses, time-entries) | ComingSoon — Q2 2026 |
| `/projects/insights/*` | 3 pages | ✅ Partial (profitability) | ComingSoon — Q2 2026 |
| `/projects/reports/*` | 2 pages | ✅ Yes (profitability) | ComingSoon — Q2 2026 |

**Projects Total: ~38 pages — all STUB**

---

## 12. Time Module

> **All pages in this module are STUB (ComingSoon — Q2 2026).**  
> Time controller is fully implemented.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/time/entry/*` | 3 pages (entries, timer, timesheets) | ✅ Yes (entries, timesheets, timer start/stop) | ComingSoon — Q2 2026 |
| `/time/timesheets/*` | 3 pages | ✅ Yes (timesheets CRUD, approve, reject) | ComingSoon — duplicate routes |
| `/time/review/*` | 2 pages | ✅ Yes (timesheets/approve) | ComingSoon — Q2 2026 |
| `/time/analysis/*` | 3 pages | ✅ Yes (billable, utilization) | ComingSoon — Q2 2026 |
| `/time/reports/*` | 1 page | ✅ Partial | ComingSoon — Q2 2026 |

**Time Total: ~12 pages — all STUB**

---

## 13. Organization Module

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/organization/entity-structure/legal-entities` | **STUB** | None | ✅ Yes (`GET/POST/PUT/DELETE organization/legal-entities`) | ComingSoon — Q2 2026 |
| `/organization/entity-structure/consolidation` | **STUB** | None | ✅ Yes (`GET/POST organization/consolidation`) | ComingSoon — Q2 2026 |
| `/organization/entity-structure/intercompany` | **STUB** | None | ✅ Yes (`GET/POST organization/intercompany`) | ComingSoon — Q2 2026 |
| `/organization/operational-structure/departments` | **STUB** | None | ✅ Yes (`GET/POST/PUT/DELETE organization/departments`) | ComingSoon — Q2 2026 |
| `/organization/operational-structure/locations-divisions` | **STUB** | None | ✅ Yes (`GET/POST/PUT/DELETE organization/locations`) | ComingSoon — Q2 2026 |
| `/organization/operational-structure/classes-tags` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/organization/operational-structure/org-chart` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/organization/governance/filing-calendar` | **STUB** | None | ✅ Yes (`GET/POST organization/filing-calendar`) | ComingSoon — Q2 2026 |
| `/organization/governance/document-storage` | **STUB** | None | ✅ Partial (attachments) | ComingSoon — Q2 2026 |

---

## 14. Accountant Workspace Module

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/accountant-workspace/my-accountant` | **STUB** | None | ✅ Yes (practice-hub controller) | ComingSoon — Q2 2026 |
| `/accountant-workspace/reconciliation-hub` | **STUB** | None | ✅ Partial (banking reconciliations) | ComingSoon — Q2 2026 |
| `/accountant-workspace/books-review` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accountant-workspace/adjusting-entries` | **STUB** | None | ✅ Partial (journal entries) | ComingSoon — Q2 2026 |
| `/accountant-workspace/client-requests` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/accountant-workspace/live-experts` | **STUB** | None | ❌ No endpoint | ComingSoon — Q2 2026 |

---

## 15. Tasks & Approvals Module

> **All pages are STUB (ComingSoon — Q2 2026).**  
> Tasks controller has basic CRUD (`GET/POST /tasks`, `PATCH :id`, `POST :id/comments`).

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/tasks-approvals/my-work/*` | 6 pages | ✅ Partial (tasks CRUD) | ComingSoon — Q2 2026 |
| `/tasks-approvals/management/*` | 5 pages | ✅ Partial | ComingSoon — Q2 2026 |
| `/tasks-approvals/exceptions/*` | 3 pages | ❌ No exceptions endpoint | ComingSoon — Q2 2026 |
| `/tasks-approvals/follow-ups/*` | 3 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/tasks-approvals/history/*` | 2 pages | ❌ No endpoint | ComingSoon — Q2 2026 |

---

## 16. AI Analytics Module

> **All pages are STUB (ComingSoon — Q2 2026).**  
> Limited backend: integrations controller has `ai/insights` endpoints.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/ai-analytics/insights/*` | 4 pages | ✅ Partial (`integrations/ai/insights`) | ComingSoon — Q2 2026 |
| `/ai-analytics/agents/*` | 4 pages | ❌ No agent backend | ComingSoon — Q2 2026 |
| `/ai-analytics/predictions/*` | 5 pages | ❌ No predictions backend | ComingSoon — Q2 2026 |
| `/ai-analytics/chat/*` | 2 pages | ❌ No chat backend | ComingSoon — Q2 2026 |
| `/ai-analytics/intelligence/*` | 1 page | ❌ No backend | ComingSoon — Q2 2026 |
| `/ai-analytics/governance/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/ai-analytics/reports/*` | 2 pages | ❌ No backend | ComingSoon — Q2 2026 |

---

## 17. Automation Module

> **All pages are STUB (ComingSoon — Q2 2026).**  
> No dedicated automation controller.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/automation/workflow-engine/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/automation/scheduled-jobs/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/automation/scheduling/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/automation/approvals-governance/*` | 4 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/automation/ai-intelligence/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/automation/monitoring/*` | 4 pages | ❌ No backend | ComingSoon — Q2 2026 |

---

## 18. Compliance Module

> **All pages are STUB (ComingSoon — Q2 2026).**  
> No dedicated compliance controller.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/compliance/controls/*` | 4 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/compliance/data-privacy/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/compliance/monitoring/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/compliance/reporting/*` | 5 pages | ❌ No backend | ComingSoon — Q2 2026 |

---

## 19. Apps & Integrations Module

> **All pages are STUB (ComingSoon — Q2 2026).**  
> Integrations controller covers API keys and audit logs.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/apps-integrations/api/*` | 2 pages | ✅ Yes (`GET/POST/DELETE integrations/api-keys`) | ComingSoon — Q2 2026 |
| `/apps-integrations/developer-tools/*` | 4 pages | ✅ Partial (api-keys, audit-logs) | ComingSoon — Q2 2026 |
| `/apps-integrations/data-tools/*` | 4 pages | ❌ No import/export endpoints | ComingSoon — Q2 2026 |
| `/apps-integrations/connected-apps/*` | 2 pages | ❌ No marketplace/app endpoints | ComingSoon — Q2 2026 |
| `/apps-integrations/discover/*` | 3 pages | ❌ No backend | ComingSoon — Q2 2026 |
| `/apps-integrations/my-integrations/*` | 3 pages | ✅ Partial (bank-feed connections) | ComingSoon — Q2 2026 |
| `/apps-integrations/data-sync/*` | 1 page | ❌ No backend | ComingSoon — Q2 2026 |
| `/apps-integrations/imports/*` | 1 page | ✅ Partial (transactions import) | ComingSoon — Q2 2026 |

---

## 20. Financial Services Module

> **All pages are STUB (ComingSoon — Q2 2026).**  
> Financial Services controller provides read-only data endpoints.

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/financial-services/banking/*` | 2 pages | ✅ Yes (`financial-services/checking-account`, `savings-accounts`) | ComingSoon — Q2 2026 |
| `/financial-services/capital-credit/*` | 3 pages | ✅ Yes (`loans`, `credit-lines`, `merchant-services`) | ComingSoon — Q2 2026 |
| `/financial-services/credit-facilities/*` | 2 pages | ✅ Yes (`credit-lines`, loans) | ComingSoon — Q2 2026 |
| `/financial-services/financial-ratios/*` | 2 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/financial-services/insights/*` | 2 pages | ✅ Yes (`cash-runway`, `credit-score`) | ComingSoon — Q2 2026 |
| `/financial-services/insurance/*` | 1 page | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/financial-services/investments/*` | 1 page | ✅ Yes (`investments`) | ComingSoon — Q2 2026 |

---

## 21. Settings Module

> **All pages are STUB (ComingSoon — Q2 2026).**  

| Route Group | Page Count | Backend Exists? | Notes |
|---|---|---|---|
| `/settings/company-profile/*` | 3 pages | ✅ Yes (companies controller) | ComingSoon — Q2 2026 |
| `/settings/company/*` | 3 pages | ✅ Yes | ComingSoon — duplicate routes |
| `/settings/users-security/*` | 5 pages | ✅ Yes (users controller) | ComingSoon — Q2 2026 |
| `/settings/users/*` | 2 pages | ✅ Yes | ComingSoon — duplicate routes |
| `/settings/accounting-preferences/*` | 4 pages | ✅ Partial | ComingSoon — Q2 2026 |
| `/settings/accounting-settings/*` | 2 pages | ✅ Partial | ComingSoon — Q2 2026 |
| `/settings/notifications/*` | 3 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/settings/security/*` | 3 pages | ✅ Partial (auth) | ComingSoon — Q2 2026 |
| `/settings/customization/*` | 4 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/settings/data-privacy/*` | 4 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/settings/data/*` | 2 pages | ❌ No endpoint | ComingSoon — duplicate |
| `/settings/entity-management/*` | 3 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/settings/account-billing/*` | 3 pages | ❌ No endpoint | ComingSoon — Q2 2026 |
| `/settings/billing/*` | 2 pages | ❌ No endpoint | ComingSoon — duplicate |
| `/settings/coa-templates` | **STUB** | None | ✅ Yes (`GET accounting/coa-templates`) | ComingSoon — Q2 2026 |

---

## 22. Public Pages / Auth / Onboarding

| Route Path | Status | API Endpoints Used | Backend Exists? | Notes |
|---|---|---|---|---|
| `/(public)/login` | **COMPLETE** | `POST /auth/login` | ✅ Yes | Full email/password login with JWT |
| `/(public)/signup` | **COMPLETE** | `POST /auth/signup` (onboarding) | ✅ Yes | Registration form |
| `/(public)/forgot-password` | **COMPLETE** | `POST /auth/forgot-password` | ✅ Yes | Password reset request |
| `/(public)/reset-password` | **COMPLETE** | `POST /auth/reset-password` | ✅ Yes | Token-based password reset |
| `/(public)/verify-otp` | **COMPLETE** | `POST /auth/verify-otp` or verification service | ✅ Yes | OTP verification |
| `/(public)/landing` | **COMPLETE** | None (static/marketing) | N/A | Static marketing page |
| `/(public)/pricing` | **COMPLETE** | None (static) | N/A | Static page |
| `/(public)/features` | **COMPLETE** | None (static) | N/A | Static page |
| `/(public)/learn-and-support` | **COMPLETE** | None (static) | N/A | Static page |
| `/onboarding` | **COMPLETE** | `onboardingService` full flow | ✅ Yes | Owner/accountant/practice onboarding |
| `/onboarding/business` | **COMPLETE** | `POST /onboarding/complete` | ✅ Yes | Business setup step |
| `/onboarding/welcome` | **COMPLETE** | Static | N/A | Welcome screen |
| `/onboarding/accountant` | **COMPLETE** | Onboarding service | ✅ Yes | Accountant-specific flow |
| `/dashboard` | **COMPLETE** | `/api/users/me` proxy | ✅ Yes | Root dashboard redirect |
| `/hub` | **COMPLETE** | Practice hub service | ✅ Yes | Accountant hub selection |
| `/companies` | **COMPLETE** | Companies controller | ✅ Yes | Company switcher |
| `/verification` | **COMPLETE** | `verificationService` | ✅ Yes | Email verification |
| `/accept-invite` | **COMPLETE** | Invite flow | ✅ Yes | Team invite acceptance |
| `/get-started/*` | **COMPLETE** | Subscription/payment flow | ✅ Partial | Plan selection & trial/subscribe |

---

## Summary

### Route Count by Status

| Status | Count | Percentage |
|--------|-------|-----------|
| **COMPLETE** | ~45 | ~8% |
| **PARTIAL** (PageDocumentation) | ~5 | ~1% |
| **STUB** (ComingSoon) | ~490 | ~91% |
| **Total** | ~540 | 100% |

> **Note:** Total count includes all `page.tsx` files under `(owner)`, `(public)`, and root routes.

---

### Modules Ready for Testing (COMPLETE)

These modules have real frontend→backend integration and can be end-to-end tested today:

1. **Authentication** — Login, signup, password reset, OTP, email verification ✅
2. **Onboarding** — Full owner/accountant/practice onboarding flows ✅
3. **Chart of Accounts** — Full CRUD, search, hierarchy, seed from templates ✅
4. **Journal Entries** — Full CRUD, post, void, activity log ✅
5. **General Ledger** — Account ledger view with date filtering ✅
6. **Trial Balance** — Live trial balance with debit/credit totals ✅
7. **Invoices (AR)** — Full invoice lifecycle: create, send, void; line items, tax ✅
8. **Credit Notes** — Create, list, void ✅
9. **Recurring Invoices** — Template management ✅
10. **Customers (CRUD)** — Full customer management ✅
11. **AR Aging** — Customer-level aging report ✅
12. **Collections** — Collections cases, dunning rules, customer payments, write-offs ✅
13. **Bills (AP)** — Full bill lifecycle: draft, approve, void ✅
14. **AP Aging** — Vendor-level aging report ✅
15. **Bill Payments** — Payment recording and void ✅
16. **Vendors (CRUD)** — Full vendor management ✅
17. **Bank Accounts (CRUD)** — Bank account management ✅
18. **P&L Report** — Live profit & loss with date range ✅
19. **Balance Sheet** — Live balance sheet ✅
20. **Cash Flow Statement** — Live cash flow with operating/investing/financing ✅
21. **AP Aging Report** (Reporting Center) — ✅
22. **AR Aging Report** (Reporting Center) — ✅
23. **Trial Balance Report** (Reporting Center) — ✅

---

### Modules Needing the Most Work

Ranked by backend readiness vs. zero frontend implementation:

| Priority | Module | Backend Readiness | Pages to Build | Rationale |
|---|---|---|---|---|
| 🔴 **1** | **Bank Reconciliation** | ✅ FULLY BUILT | ~8 pages | Backend has complete reconciliation API (match, auto-match, adjustments, complete, undo, discrepancies) — just needs frontend UI |
| 🔴 **2** | **Bank Transactions** | ✅ FULLY BUILT | ~4 pages | Transactions, splits, rules — full backend exists |
| 🔴 **3** | **Payroll Processing** | ✅ FULLY BUILT | ~7 pages | Full payroll runs, employee management — zero frontend |
| 🔴 **4** | **Tax Center / Philippine Tax** | ✅ FULLY BUILT | ~15 pages | All BIR forms, VAT, withholding have backend; core Philippine tax features |
| 🔴 **5** | **Projects** | ✅ FULLY BUILT | ~10 pages | Full project CRUD, tasks, milestones, budgets, time entries — zero frontend |
| 🟡 **6** | **Time Tracking** | ✅ FULLY BUILT | ~8 pages | Timer, timesheets, approvals — zero frontend |
| 🟡 **7** | **Purchase Orders** | ✅ YES (AP module) | ~3 pages | Backend exists via AP controller; PO-list has PageDocumentation spec ready |
| 🟡 **8** | **Fixed Assets / Depreciation** | ✅ PARTIALLY BUILT | ~12 pages | Inventory assets endpoints exist for core operations |
| 🟡 **9** | **Organization Structure** | ✅ FULLY BUILT | ~6 pages | Legal entities, departments, locations — full backend; common need |
| 🟢 **10** | **Settings** | ✅ PARTIALLY BUILT | ~10 pages | Company profile, user management — backend exists |

---

### Priority Recommendation: Build Order

**Phase 1 — Unlock core accounting workflow (1–2 sprints):**
1. **Bank Transactions UI** — connects to fully-built backend; enables reconciliation
2. **Bank Reconciliation UI** — backend is the most complete of any unbuilt module; enables month-end close
3. **Deposits & Undeposited Funds** — completes cash management

**Phase 2 — Enable full AP/AR cycle (1 sprint):**
4. **Purchase Orders** — backend exists; PageDocumentation spec is already written
5. **AR Quotes/Estimates** — backend exists
6. **Refunds** — backend exists

**Phase 3 — Payroll & HR (1–2 sprints):**
7. **Employee List + Employee Details** — foundational for payroll
8. **Payroll Runs** — process, post, void
9. **Leave Management** — requests, balances

**Phase 4 — Tax compliance (1–2 sprints):**
10. **Tax Center Dashboard** — summary + calendar
11. **BIR Forms** (2550M/2550Q first — VAT) — backend fully built
12. **Withholding Tax** — EWT / compensation withholding

**Phase 5 — Projects & Time (1 sprint):**
13. **Project List + Tasks** — backend fully built
14. **Time Entry + Timesheets** — backend fully built

**Phase 6 — Remaining (multiple sprints):**
15. Organization structure, settings, compliance, AI analytics, automation

---

*Report generated from automated inspection of ~540 `page.tsx` files and 35 backend controller files.*
