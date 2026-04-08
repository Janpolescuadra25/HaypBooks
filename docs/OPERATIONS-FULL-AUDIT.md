# Operations Full Audit — 92 Tabs Across 6 Sections

Audit date: 2026-04-09  
Config source: `src/config/operations-navigation.ts`  
Route base: `src/app/(owner)/` + catch-all pages

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ EXACT | `(owner)` route file exists at the **exact** config URL |
| ⚡ CATCH-ALL | Served via top-level `[[...slug]]` catch-all page (working now) |
| ⚠️ MISMATCH | A page file exists but the `(owner)` URL differs from config path |
| ❌ MISSING | No route exists for this tab at all |

---

## Executive Summary

| Status | Count | % |
|--------|-------|---|
| ✅ EXACT match | 68 | 74% |
| ⚡ CATCH-ALL functional | 11 | 12% |
| ⚠️ PATH MISMATCH (page exists, wrong URL) | 9 | 10% |
| ❌ GENUINELY MISSING | 4 | 4% |
| **TOTAL** | **92** | **100%** |

**Only 4 tabs need to be created from scratch.** 9 tabs need their (owner) route file moved/renamed to match the config URL.

---

## Section 1 — Cash & Banking (16 tabs)

> Config base: `/banking-cash/`

| # | Tab | Config Path | Status | Notes |
|---|-----|-------------|--------|-------|
| a1 | Bank Transactions | `/banking-cash/transactions/bank-transactions` | ✅ EXACT | Full CRUD page + BankTransactionsPage component |
| a2 | Deposits | `/banking-cash/transactions/deposits` | ❌ MISSING | No route exists |
| b1 | Reconciliation Hub | `/banking-cash/reconciliation/reconciliation-hub` | ❌ MISSING | No route exists |
| b2 | Reconcile | `/banking-cash/reconciliation/reconcile` | ✅ EXACT | Full reconciliation UI |
| b3 | History | `/banking-cash/reconciliation/history` | ✅ EXACT | |
| b4 | Statement Archive | `/banking-cash/reconciliation/statement-archive` | ✅ EXACT | |
| c1 | Bank Accounts | `/banking-cash/accounts/bank-accounts` | ✅ EXACT | BankAccountsCrudPage component |
| c2 | Credit Cards | `/banking-cash/accounts/credit-cards` | ✅ EXACT | CreditCardsCrudPage component |
| c3 | Petty Cash | `/banking-cash/accounts/petty-cash` | ✅ EXACT | |
| c4 | Clearing Accounts | `/banking-cash/accounts/clearing-accounts` | ❌ MISSING | No route exists |
| d1 | Transaction Rules | `/banking-cash/management/transaction-rules` | ⚠️ MISMATCH | File at `transactions/transaction-rules` |
| d2 | Recurring Transactions | `/banking-cash/management/recurring-transactions` | ⚠️ MISMATCH | File at `transactions/recurring-transactions` |
| d3 | App Transactions | `/banking-cash/transactions/app-transactions` | ✅ EXACT | |
| e1 | Cash Position | `/banking-cash/cash-management/cash-position` | ✅ EXACT | |
| e2 | Cash Flow Projection | `/banking-cash/cash-management/cash-flow-projection` | ✅ EXACT | |
| e3 | Short-Term Forecast | `/banking-cash/cash-management/short-term-forecast` | ✅ EXACT | |

**Section score:** 11 exact · 2 mismatch · 3 missing

---

## Section 2 — Sales / Order-to-Cash (20 tabs)

> Config base: `/sales/`

| # | Tab | Config Path | Status | Notes |
|---|-----|-------------|--------|-------|
| a1 | Customers | `/sales/customers/customers` | ✅ EXACT | CustomersCrudPage component |
| a2 | Customer Groups | `/sales/customers/customer-groups` | ✅ EXACT | |
| a3 | Price Lists | `/sales/customers/price-lists` | ✅ EXACT | PriceListsPage component |
| a4 | Customer Portal | `/sales/customers/customer-portal` | ✅ EXACT | |
| b1 | Products & Services | `/sales/sales/products-services` | ⚡ CATCH-ALL | `sales/[[...slug]]` → ProductsServicesPage; (owner) file at `sales-operations/` |
| b2 | Quotes | `/sales/sales/quotes` | ⚡ CATCH-ALL | `sales/[[...slug]]` → QuotesEstimatesPage; (owner) at `sales-operations/` |
| b3 | Sales Orders | `/sales/sales/sales-orders` | ⚡ CATCH-ALL | `sales/[[...slug]]` → SalesOrdersPage; (owner) at `sales-operations/` |
| c1 | Invoices | `/sales/billing/invoices` | ✅ EXACT | InvoicesPage component |
| c2 | Recurring Invoices | `/sales/billing/recurring-invoices` | ✅ EXACT | RecurringInvoicesPage component |
| c3 | Subscriptions | `/sales/billing/subscriptions` | ⚡ CATCH-ALL | `sales/[[...slug]]` → SubscriptionsPage |
| c4 | Payment Links | `/sales/billing/payment-links` | ✅ EXACT | PaymentLinksPage component |
| d1 | Customer Payments | `/sales/collections/customer-payments` | ✅ EXACT | PaymentsPage component |
| d2 | A/R Aging | `/sales/collections/ar-aging` | ✅ EXACT | |
| d3 | Collections Center | `/sales/collections/collections-center` | ✅ EXACT | |
| d4 | Dunning | `/sales/collections/dunning` | ⚠️ MISMATCH | (owner) file at `collections/dunning-management`; no catch-all case |
| d5 | Write-Offs | `/sales/collections/write-offs` | ✅ EXACT | WriteOffsPage component |
| d6 | Refunds | `/sales/collections/refunds` | ⚡ CATCH-ALL | `sales/[[...slug]]` → RefundsPage |
| e1 | Credit Notes | `/sales/revenue/credit-notes` | ⚠️ MISMATCH | (owner) file at `billing/credit-notes`; no catch-all case |
| e2 | Revenue Recognition | `/sales/revenue/revenue-recognition` | ⚡ CATCH-ALL | `sales/[[...slug]]` → RevenueRecognitionPage |
| e3 | Deferred Revenue | `/sales/revenue/deferred-revenue` | ⚡ CATCH-ALL | `sales/[[...slug]]` → DeferredRevenuePage |

**Section score:** 11 exact · 7 catch-all · 2 mismatch · 0 missing

---

## Section 3 — Expenses / Procure-to-Pay (16 tabs)

> Config base: `/expenses/`

| # | Tab | Config Path | Status | Notes |
|---|-----|-------------|--------|-------|
| a1 | Vendors | `/expenses/vendors/vendors` | ✅ EXACT | VendorsPage component |
| a2 | Purchase Requests | `/expenses/vendors/purchase-requests` | ⚠️ MISMATCH | (owner) at `purchasing/purchase-requests` |
| a3 | Purchase Orders | `/expenses/vendors/purchase-orders` | ⚡ CATCH-ALL | `expenses/[[...slug]]` → PurchaseOrdersPage |
| a4 | RFQ | `/expenses/vendors/rfq` | ❌ MISSING | No route or component exists |
| a5 | Approvals | `/expenses/vendors/approvals` | ⚠️ MISMATCH | (owner) at `purchasing/approval-workflows` |
| b1 | Bills | `/expenses/payables/bills` | ✅ EXACT | BillsPage component |
| b2 | Recurring Bills | `/expenses/payables/recurring-bills` | ✅ EXACT | |
| b3 | Bill Payments | `/expenses/payables/bill-payments` | ✅ EXACT | BillPaymentsPage component |
| b4 | Payment Runs | `/expenses/payables/payment-runs` | ✅ EXACT | |
| b5 | Vendor Credits | `/expenses/payables/vendor-credits` | ⚡ CATCH-ALL | `expenses/[[...slug]]` → VendorCreditsPage |
| b6 | A/P Aging | `/expenses/payables/ap-aging` | ✅ EXACT | ApAgingPage component |
| c1 | Expenses | `/expenses/expense-capture/expenses` | ✅ EXACT | ExpenseCapturePage component |
| c2 | Receipts | `/expenses/expense-capture/receipts` | ✅ EXACT | |
| c3 | Mileage | `/expenses/expense-capture/mileage` | ✅ EXACT | |
| c4 | Per Diem | `/expenses/expense-capture/per-diem` | ⚡ CATCH-ALL | `expenses/[[...slug]]` → ExpenseCapturePage(per-diem) |
| c5 | Reimbursements | `/expenses/expense-capture/reimbursements` | ⚡ CATCH-ALL | `expenses/[[...slug]]` → ExpenseCapturePage(reimbursements) |

**Section score:** 9 exact · 4 catch-all · 2 mismatch · 1 missing

---

## Section 4 — Inventory (20 tabs)

> Config base: `/inventory/`

| # | Tab | Config Path | Status | Notes |
|---|-----|-------------|--------|-------|
| a1 | Inventory Items | `/inventory/setup/inventory-items` | ✅ EXACT | |
| a2 | Categories | `/inventory/setup/categories` | ✅ EXACT | |
| a3 | Bundles | `/inventory/setup/bundles` | ⚠️ MISMATCH | (owner) at `setup/bundles-assemblies` |
| a4 | Units of Measure | `/inventory/setup/units-of-measure` | ✅ EXACT | |
| b1 | Item Receipts | `/inventory/stock-operations/item-receipts` | ⚠️ MISMATCH | (owner) at `receiving/item-receipts` |
| b2 | Stock Movements | `/inventory/stock-operations/stock-movements` | ✅ EXACT | |
| b3 | Adjustments | `/inventory/stock-operations/inventory-adjustments` | ✅ EXACT | |
| b4 | Transfers | `/inventory/stock-operations/transfers` | ✅ EXACT | |
| c1 | Warehouses | `/inventory/warehouses/warehouse-list` | ✅ EXACT | |
| c2 | Bin Locations | `/inventory/warehousing/bin-locations` | ✅ EXACT | |
| c3 | Zones | `/inventory/warehousing/stock-zones` | ✅ EXACT | |
| d1 | Cycle Counts | `/inventory/stock-operations/cycle-counts` | ✅ EXACT | |
| d2 | Physical Counts | `/inventory/stock-operations/physical-counts` | ✅ EXACT | |
| d3 | Lot/Serial Tracking | `/inventory/control/lot-serial-tracking` | ✅ EXACT | |
| d4 | Reorder Points | `/inventory/control/reorder-points` | ✅ EXACT | |
| d5 | Safety Stock | `/inventory/control/safety-stock` | ✅ EXACT | |
| e1 | Inventory Valuation | `/inventory/valuation/inventory-valuation` | ✅ EXACT | |
| e2 | Landed Costs | `/inventory/costing/landed-costs` | ✅ EXACT | |
| e3 | Cost Adjustments | `/inventory/costing/cost-adjustments` | ✅ EXACT | |
| e4 | Write-Downs | `/inventory/valuation/write-downs` | ✅ EXACT | |

**Section score:** 18 exact · 0 catch-all · 2 mismatch · 0 missing

---

## Section 5 — Projects (15 tabs)

> Config base: `/projects/`

| # | Tab | Config Path | Status | Notes |
|---|-----|-------------|--------|-------|
| a1 | Projects | `/projects/project-setup/projects` | ✅ EXACT | |
| a2 | Project Templates | `/projects/project-setup/project-templates` | ✅ EXACT | |
| a3 | Milestones | `/projects/project-setup/milestones` | ✅ EXACT | |
| a4 | Contracts | `/projects/project-setup/contracts` | ✅ EXACT | |
| b1 | Project Tasks | `/projects/project-setup/project-tasks` | ⚠️ MISMATCH | (owner) at `planning/project-tasks` |
| b2 | Schedule | `/projects/planning/schedule` | ✅ EXACT | |
| b3 | Resource Planning | `/projects/planning/resource-planning` | ✅ EXACT | |
| b4 | Time & Expenses | `/projects/time-billing/timesheets` | ✅ EXACT | |
| c1 | Project Billing | `/projects/billing/project-billing` | ✅ EXACT | |
| c2 | Progress Billing | `/projects/billing/progress-billing` | ✅ EXACT | |
| c3 | Milestone Billing | `/projects/billing/milestone-billing` | ✅ EXACT | |
| c4 | Change Orders | `/projects/billing/change-orders` | ✅ EXACT | |
| c5 | WIP | `/projects/billing/work-in-progress` | ✅ EXACT | |
| d1 | Project Profitability | `/projects/financials/project-profitability` | ✅ EXACT | |
| d2 | Budget vs Actual | `/projects/financials/budget-vs-actual` | ✅ EXACT | |

**Section score:** 14 exact · 0 catch-all · 1 mismatch · 0 missing

---

## Section 6 — Time (5 tabs)

> Config base: `/time/`

| # | Tab | Config Path | Status | Notes |
|---|-----|-------------|--------|-------|
| a1 | Time Entries | `/time/entry/time-entries` | ✅ EXACT | |
| a2 | Timesheets | `/time/entry/timesheets` | ✅ EXACT | |
| a3 | Timer | `/time/entry/timer` | ✅ EXACT | |
| b1 | Billable Time Review | `/time/review/billable-time-review` | ✅ EXACT | |
| b2 | Time Approvals | `/time/review/time-approvals` | ✅ EXACT | |

**Section score:** 5 exact · 0 catch-all · 0 mismatch · 0 missing

---

## Path Mismatches — Action Required

These pages exist but are at a **different URL** than `operations-navigation.ts` specifies.  
**Fix:** Create a new `(owner)` route file at the correct path that re-exports the same component, or rename the existing file.

| Tab | Current (owner) path | Target config path | Recommended fix |
|-----|----------------------|--------------------|-----------------|
| Transaction Rules | `banking-cash/transactions/transaction-rules` | `banking-cash/management/transaction-rules` | Add (owner) route at target path |
| Recurring Transactions | `banking-cash/transactions/recurring-transactions` | `banking-cash/management/recurring-transactions` | Add (owner) route at target path |
| Dunning | `sales/collections/dunning-management` | `sales/collections/dunning` | Rename directory OR add (owner) route at `dunning` |
| Credit Notes | `sales/billing/credit-notes` | `sales/revenue/credit-notes` | Add (owner) route at `revenue/credit-notes` |
| Purchase Requests | `expenses/purchasing/purchase-requests` | `expenses/vendors/purchase-requests` | Add (owner) route at `vendors/purchase-requests` |
| Approvals | `expenses/purchasing/approval-workflows` | `expenses/vendors/approvals` | Add (owner) route at `vendors/approvals` |
| Bundles | `inventory/setup/bundles-assemblies` | `inventory/setup/bundles` | Rename directory OR add (owner) route at `bundles` |
| Item Receipts | `inventory/receiving/item-receipts` | `inventory/stock-operations/item-receipts` | Add (owner) route at correct path |
| Project Tasks | `projects/planning/project-tasks` | `projects/project-setup/project-tasks` | Add (owner) route at `project-setup/project-tasks` |

---

## Missing Pages — Must Create

| Tab | Config Path | Priority | Suggested component |
|-----|-------------|----------|---------------------|
| Deposits | `/banking-cash/transactions/deposits` | HIGH | `DepositsCrudPage` (already exists in components/owner!) |
| Reconciliation Hub | `/banking-cash/reconciliation/reconciliation-hub` | MEDIUM | New `ReconciliationHubPage` component |
| Clearing Accounts | `/banking-cash/accounts/clearing-accounts` | LOW | New `ClearingAccountsPage` component |
| RFQ | `/expenses/vendors/rfq` | LOW | New `RFQPage` component |
