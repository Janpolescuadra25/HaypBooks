# Haypbooks Owner Hub System Map

Generated: 2026-04-16T17:24:29.620Z

## Executive Snapshot

- Owner pages scanned: 235
- Components scanned: 187
- Backend modules scanned: 30
- Backend endpoint handlers discovered: 618
- Prisma models scanned: 484
- Frontend endpoint patterns discovered: 159
- Page status: 8 real, 170 stub/placeholder
- Component status: 15 real, 35 stub/placeholder

## 1) Every Page & Route (`Frontend/src/app/(owner)/`)

| Route | PageFile | Renders | APIEndpoints | Status |
| --- | --- | --- | --- | --- |
| /accountant-workspace/client-requests | Haypbooks/Frontend/src/app/(owner)/accountant-workspace/client-requests/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/allocations/allocation-history | Haypbooks/Frontend/src/app/(owner)/accounting/allocations/allocation-history/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/allocations/allocation-rules | Haypbooks/Frontend/src/app/(owner)/accounting/allocations/allocation-rules/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/allocations/allocation-runs | Haypbooks/Frontend/src/app/(owner)/accounting/allocations/allocation-runs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/close-workflow | Haypbooks/Frontend/src/app/(owner)/accounting/close-workflow/page.tsx | Haypbooks/Frontend/src/components/accounting/AccountingPeriodsPage.tsx | /companies/:param/accounting/periods<br>/companies/:param/accounting/periods/:param/close<br>/companies/:param/accounting/periods/:param/reopen | partial |
| /accounting/core-accounting/chart-of-accounts | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/chart-of-accounts/page.tsx | (inline/none) | /companies/:param/accounting/accounts<br>/companies/:param/accounting/accounts/:param | partial |
| /accounting/core-accounting/chart-of-accounts/[id]/audit-log | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/chart-of-accounts/[id]/audit-log/page.tsx | Haypbooks/Frontend/src/components/shared/FullAuditLog.tsx | /companies/:param/accounting/accounts/audit-log | stub/placeholder |
| /accounting/core-accounting/chart-of-accounts/audit-log | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/chart-of-accounts/audit-log/page.tsx | Haypbooks/Frontend/src/components/shared/FullAuditLog.tsx | /companies/:param/accounting/accounts/audit-log | stub/placeholder |
| /accounting/core-accounting/general-ledger | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/general-ledger/page.tsx | Haypbooks/Frontend/src/components/accounting/GeneralLedgerPage.tsx | /companies/:param/accounting/accounts<br>/companies/:param/general-ledger | partial |
| /accounting/core-accounting/journal-entries | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/journal-entries/page.tsx | Haypbooks/Frontend/src/components/accounting/JournalEntriesPage.tsx | /companies/:param/accounting/journal-entries<br>/companies/:param/accounting/journal-entries/:param<br>/companies/:param/accounting/journal-entries/:param/post<br>/companies/:param/accounting/journal-entries/:param/void | partial |
| /accounting/core-accounting/journal-entries/[id] | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/journal-entries/[id]/page.tsx | Haypbooks/Frontend/src/components/accounting/AccountSelect.tsx | /companies/:param/accounting/accounts<br>/companies/:param/accounting/journal-entries/:param<br>/companies/:param/accounting/journal-entries/:param/post<br>/companies/:param/accounting/journal-entries/:param/void | stub/placeholder |
| /accounting/core-accounting/journal-entries/[id]/activity | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/journal-entries/[id]/activity/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /accounting/core-accounting/journal-entries/audit-log | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/journal-entries/audit-log/page.tsx | Haypbooks/Frontend/src/components/shared/FullAuditLog.tsx | /companies/:param/accounting/journal-entries/audit-log | stub/placeholder |
| /accounting/core-accounting/journal-entries/new | Haypbooks/Frontend/src/app/(owner)/accounting/core-accounting/journal-entries/new/page.tsx | Haypbooks/Frontend/src/components/accounting/AccountSelect.tsx | /companies/:param/accounting/accounts<br>/companies/:param/accounting/journal-entries<br>/companies/:param/contacts/customers | stub/placeholder |
| /accounting/fixed-assets/asset-lifecycle | Haypbooks/Frontend/src/app/(owner)/accounting/fixed-assets/asset-lifecycle/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/fixed-assets/asset-management | Haypbooks/Frontend/src/app/(owner)/accounting/fixed-assets/asset-management/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/fixed-assets/depreciation | Haypbooks/Frontend/src/app/(owner)/accounting/fixed-assets/depreciation/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/fixed-assets/insurance | Haypbooks/Frontend/src/app/(owner)/accounting/fixed-assets/insurance/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/period-close/close-archive | Haypbooks/Frontend/src/app/(owner)/accounting/period-close/close-archive/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/period-close/lock-period | Haypbooks/Frontend/src/app/(owner)/accounting/period-close/lock-period/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/period-close/multi-currency-revaluation | Haypbooks/Frontend/src/app/(owner)/accounting/period-close/multi-currency-revaluation/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /accounting/period-close/sign-offs | Haypbooks/Frontend/src/app/(owner)/accounting/period-close/sign-offs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/api/api-keys | Haypbooks/Frontend/src/app/(owner)/apps-integrations/api/api-keys/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/api/webhooks | Haypbooks/Frontend/src/app/(owner)/apps-integrations/api/webhooks/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/connected-apps/installed-apps | Haypbooks/Frontend/src/app/(owner)/apps-integrations/connected-apps/installed-apps/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/data-tools/export-data | Haypbooks/Frontend/src/app/(owner)/apps-integrations/data-tools/export-data/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/developer-tools/developer-sandbox | Haypbooks/Frontend/src/app/(owner)/apps-integrations/developer-tools/developer-sandbox/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/discover/app-marketplace | Haypbooks/Frontend/src/app/(owner)/apps-integrations/discover/app-marketplace/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/imports/import-data | Haypbooks/Frontend/src/app/(owner)/apps-integrations/imports/import-data/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /apps-integrations/my-integrations/integration-logs | Haypbooks/Frontend/src/app/(owner)/apps-integrations/my-integrations/integration-logs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /automation/ai-intelligence/ai-bookkeeping | Haypbooks/Frontend/src/app/(owner)/automation/ai-intelligence/ai-bookkeeping/page.tsx | Haypbooks/Frontend/src/components/owner/PageDocumentation.tsx | (none detected) | stub/placeholder |
| /automation/ai-intelligence/smart-matching | Haypbooks/Frontend/src/app/(owner)/automation/ai-intelligence/smart-matching/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /automation/monitoring/automation-logs | Haypbooks/Frontend/src/app/(owner)/automation/monitoring/automation-logs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /automation/monitoring/error-queue | Haypbooks/Frontend/src/app/(owner)/automation/monitoring/error-queue/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /automation/workflow-engine/smart-rules | Haypbooks/Frontend/src/app/(owner)/automation/workflow-engine/smart-rules/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /automation/workflow-engine/workflow-builder | Haypbooks/Frontend/src/app/(owner)/automation/workflow-engine/workflow-builder/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /banking-cash/bank-rules | Haypbooks/Frontend/src/app/(owner)/banking-cash/bank-rules/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /banking-cash/bank-rules/csv-upload | Haypbooks/Frontend/src/app/(owner)/banking-cash/bank-rules/csv-upload/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /banking-cash/bank-rules/rule-templates | Haypbooks/Frontend/src/app/(owner)/banking-cash/bank-rules/rule-templates/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /banking-cash/bank-rules/rules | Haypbooks/Frontend/src/app/(owner)/banking-cash/bank-rules/rules/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /banking-cash/reconciliation | Haypbooks/Frontend/src/app/(owner)/banking-cash/reconciliation/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /banking-cash/reconciliation/history | Haypbooks/Frontend/src/app/(owner)/banking-cash/reconciliation/history/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /banking-cash/reconciliation/reconcile | Haypbooks/Frontend/src/app/(owner)/banking-cash/reconciliation/reconcile/page.tsx | Haypbooks/Frontend/src/components/banking/BankReconciliationPage.tsx | (none detected) | stub/placeholder |
| /banking-cash/reconciliation/statements | Haypbooks/Frontend/src/app/(owner)/banking-cash/reconciliation/statements/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /banking-cash/transactions | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/page.tsx | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/ImportWizardModal.tsx | /companies/:param/accounts<br>/companies/:param/banking/accounts<br>/companies/:param/banking/accounts/:param/transactions<br>/companies/:param/banking/accounts/:param/transactions/:param<br>/companies/:param/banking/accounts/:param/transactions/batch-categorize<br>/companies/:param/customers<br>/companies/:param/employees<br>/companies/:param/vendors | partial |
| /banking-cash/transactions/activity | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/activity/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /banking-cash/transactions/deposits | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/deposits/page.tsx | Haypbooks/Frontend/src/components/banking/BankDepositsPage.tsx | /companies/:param/banking/accounts<br>/companies/:param/banking/deposits<br>/companies/:param/banking/deposits/:param<br>/companies/:param/banking/deposits/:param/post<br>/companies/:param/banking/deposits/:param/void<br>/companies/:param/banking/undeposited-funds | partial |
| /banking-cash/transactions/match | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/match/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /banking-cash/transactions/register | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/register/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /banking-cash/transactions/rules | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/rules/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /banking-cash/transactions/split | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/split/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /banking-cash/transactions/transfer | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/transfer/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /banking-cash/transactions/undeposited-funds | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/undeposited-funds/page.tsx | Haypbooks/Frontend/src/components/banking/UndepositedFundsPage.tsx | /companies/:param/banking/undeposited-funds | partial |
| /banking-cash/transactions/view-record | Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/view-record/page.tsx | (inline/none) | (none detected) | stub/placeholder |
| /compliance/controls/control-testing | Haypbooks/Frontend/src/app/(owner)/compliance/controls/control-testing/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /compliance/controls/internal-controls | Haypbooks/Frontend/src/app/(owner)/compliance/controls/internal-controls/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /compliance/controls/policy-management | Haypbooks/Frontend/src/app/(owner)/compliance/controls/policy-management/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /compliance/monitoring/audit-log-analysis | Haypbooks/Frontend/src/app/(owner)/compliance/monitoring/audit-log-analysis/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /compliance/monitoring/fraud-detection-rules | Haypbooks/Frontend/src/app/(owner)/compliance/monitoring/fraud-detection-rules/page.tsx | Haypbooks/Frontend/src/components/owner/PageDocumentation.tsx | (none detected) | stub/placeholder |
| /compliance/monitoring/issue-tracking | Haypbooks/Frontend/src/app/(owner)/compliance/monitoring/issue-tracking/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /expenses/expense-capture | Haypbooks/Frontend/src/app/(owner)/expenses/expense-capture/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /expenses/expense-capture/expenses | Haypbooks/Frontend/src/app/(owner)/expenses/expense-capture/expenses/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /expenses/expense-capture/mileage | Haypbooks/Frontend/src/app/(owner)/expenses/expense-capture/mileage/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /expenses/expense-capture/per-diem | Haypbooks/Frontend/src/app/(owner)/expenses/expense-capture/per-diem/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /expenses/expense-capture/receipts | Haypbooks/Frontend/src/app/(owner)/expenses/expense-capture/receipts/page.tsx | Haypbooks/Frontend/src/components/owner/PageDocumentation.tsx | (none detected) | stub/placeholder |
| /expenses/expense-capture/reimbursements | Haypbooks/Frontend/src/app/(owner)/expenses/expense-capture/reimbursements/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /expenses/payables | Haypbooks/Frontend/src/app/(owner)/expenses/payables/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /expenses/payables/bill-payments | Haypbooks/Frontend/src/app/(owner)/expenses/payables/bill-payments/page.tsx | Haypbooks/Frontend/src/components/expenses/BillPaymentsPage.tsx | /companies/:param/ap/bill-payments<br>/companies/:param/bill-payments<br>/companies/:param/bill-payments/:param/void<br>/companies/:param/bills | partial |
| /expenses/payables/bills | Haypbooks/Frontend/src/app/(owner)/expenses/payables/bills/page.tsx | Haypbooks/Frontend/src/components/expenses/BillsPage.tsx | /companies/:param/ap/bills<br>/companies/:param/ap/bills/:param/activity<br>/companies/:param/bills<br>/companies/:param/bills/:param/approve<br>/companies/:param/bills/:param/void<br>/companies/:param/vendors | partial |
| /expenses/payables/payment-runs | Haypbooks/Frontend/src/app/(owner)/expenses/payables/payment-runs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /expenses/payables/recurring-bills | Haypbooks/Frontend/src/app/(owner)/expenses/payables/recurring-bills/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /expenses/payables/vendor-credits | Haypbooks/Frontend/src/app/(owner)/expenses/payables/vendor-credits/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /expenses/purchasing | Haypbooks/Frontend/src/app/(owner)/expenses/purchasing/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /expenses/purchasing/approvals | Haypbooks/Frontend/src/app/(owner)/expenses/purchasing/approvals/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /expenses/purchasing/orders | Haypbooks/Frontend/src/app/(owner)/expenses/purchasing/orders/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /expenses/purchasing/purchase-requests | Haypbooks/Frontend/src/app/(owner)/expenses/purchasing/purchase-requests/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /expenses/purchasing/rfq | Haypbooks/Frontend/src/app/(owner)/expenses/purchasing/rfq/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /expenses/purchasing/vendors | Haypbooks/Frontend/src/app/(owner)/expenses/purchasing/vendors/page.tsx | Haypbooks/Frontend/src/components/owner/VendorsCrudPage.tsx | /companies/:param/contacts/vendors | partial |
| /home/business-health | Haypbooks/Frontend/src/app/(owner)/home/business-health/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /home/dashboard | Haypbooks/Frontend/src/app/(owner)/home/dashboard/page.tsx | Haypbooks/Frontend/src/components/owner/OwnerDashboard.tsx | /api/owner/cash-position<br>/api/owner/financial-summary | real |
| /home/notifications | Haypbooks/Frontend/src/app/(owner)/home/notifications/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /home/performance | Haypbooks/Frontend/src/app/(owner)/home/performance/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /home/setup-center | Haypbooks/Frontend/src/app/(owner)/home/setup-center/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /home/shortcuts | Haypbooks/Frontend/src/app/(owner)/home/shortcuts/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/control | Haypbooks/Frontend/src/app/(owner)/inventory/control/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /inventory/control/cycle-counts | Haypbooks/Frontend/src/app/(owner)/inventory/control/cycle-counts/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/control/lot-serial-tracking | Haypbooks/Frontend/src/app/(owner)/inventory/control/lot-serial-tracking/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/control/physical-counts | Haypbooks/Frontend/src/app/(owner)/inventory/control/physical-counts/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/control/reorder-points | Haypbooks/Frontend/src/app/(owner)/inventory/control/reorder-points/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/items | Haypbooks/Frontend/src/app/(owner)/inventory/items/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /inventory/items/bundles | Haypbooks/Frontend/src/app/(owner)/inventory/items/bundles/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/items/categories | Haypbooks/Frontend/src/app/(owner)/inventory/items/categories/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/items/item-list | Haypbooks/Frontend/src/app/(owner)/inventory/items/item-list/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/items/units | Haypbooks/Frontend/src/app/(owner)/inventory/items/units/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/stock-operations | Haypbooks/Frontend/src/app/(owner)/inventory/stock-operations/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /inventory/stock-operations/adjustments | Haypbooks/Frontend/src/app/(owner)/inventory/stock-operations/adjustments/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/stock-operations/item-receipts | Haypbooks/Frontend/src/app/(owner)/inventory/stock-operations/item-receipts/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/stock-operations/stock-movements | Haypbooks/Frontend/src/app/(owner)/inventory/stock-operations/stock-movements/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/stock-operations/transfers | Haypbooks/Frontend/src/app/(owner)/inventory/stock-operations/transfers/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/valuation | Haypbooks/Frontend/src/app/(owner)/inventory/valuation/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /inventory/valuation/cost-adjustments | Haypbooks/Frontend/src/app/(owner)/inventory/valuation/cost-adjustments/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/valuation/inventory-valuation | Haypbooks/Frontend/src/app/(owner)/inventory/valuation/inventory-valuation/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/valuation/landed-costs | Haypbooks/Frontend/src/app/(owner)/inventory/valuation/landed-costs/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /inventory/valuation/write-downs | Haypbooks/Frontend/src/app/(owner)/inventory/valuation/write-downs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/warehouses | Haypbooks/Frontend/src/app/(owner)/inventory/warehouses/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /inventory/warehouses/bin-locations | Haypbooks/Frontend/src/app/(owner)/inventory/warehouses/bin-locations/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/warehouses/warehouse-list | Haypbooks/Frontend/src/app/(owner)/inventory/warehouses/warehouse-list/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /inventory/warehouses/zones | Haypbooks/Frontend/src/app/(owner)/inventory/warehouses/zones/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /organization/entity-structure/consolidation | Haypbooks/Frontend/src/app/(owner)/organization/entity-structure/consolidation/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /organization/entity-structure/intercompany | Haypbooks/Frontend/src/app/(owner)/organization/entity-structure/intercompany/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /organization/entity-structure/legal-entities | Haypbooks/Frontend/src/app/(owner)/organization/entity-structure/legal-entities/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /organization/operational-structure/locations-divisions | Haypbooks/Frontend/src/app/(owner)/organization/operational-structure/locations-divisions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/compensation/allowances | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/compensation/allowances/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/compensation/benefit-plans | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/compensation/benefit-plans/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/compensation/deductions | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/compensation/deductions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/compensation/loans | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/compensation/loans/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/compensation/salary-structures | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/compensation/salary-structures/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-processing/bonuses-commissions | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-processing/bonuses-commissions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-processing/final-pay | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-processing/final-pay/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-adjustments | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-processing/payroll-adjustments/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-approvals | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-processing/payroll-approvals/page.tsx | Haypbooks/Frontend/src/components/owner/PageDocumentation.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-history | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-processing/payroll-history/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-runs | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-processing/payroll-runs/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-taxes/government-contributions | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-taxes/government-contributions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-taxes/remittance-tracking | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-taxes/remittance-tracking/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/payroll-taxes/tax-withholding | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/payroll-taxes/tax-withholding/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/time-leave/holiday-calendar | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/time-leave/holiday-calendar/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/time-leave/leave-balances | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/time-leave/leave-balances/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/time-leave/leave-requests | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/time-leave/leave-requests/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/time-leave/shift-scheduling | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/time-leave/shift-scheduling/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/workforce/employee-documents | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/workforce/employee-documents/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/workforce/employees | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/workforce/employees/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /payroll-workforce/workforce/job-positions | Haypbooks/Frontend/src/app/(owner)/payroll-workforce/workforce/job-positions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/billing | Haypbooks/Frontend/src/app/(owner)/projects/billing/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /projects/billing/change-orders | Haypbooks/Frontend/src/app/(owner)/projects/billing/change-orders/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/billing/progress-billing | Haypbooks/Frontend/src/app/(owner)/projects/billing/progress-billing/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/billing/project-billing | Haypbooks/Frontend/src/app/(owner)/projects/billing/project-billing/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/billing/wip | Haypbooks/Frontend/src/app/(owner)/projects/billing/wip/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /projects/financials | Haypbooks/Frontend/src/app/(owner)/projects/financials/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /projects/financials/budget-vs-actual | Haypbooks/Frontend/src/app/(owner)/projects/financials/budget-vs-actual/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/financials/profitability | Haypbooks/Frontend/src/app/(owner)/projects/financials/profitability/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /projects/project-setup | Haypbooks/Frontend/src/app/(owner)/projects/project-setup/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /projects/project-setup/contracts | Haypbooks/Frontend/src/app/(owner)/projects/project-setup/contracts/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/project-setup/milestones | Haypbooks/Frontend/src/app/(owner)/projects/project-setup/milestones/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/project-setup/projects | Haypbooks/Frontend/src/app/(owner)/projects/project-setup/projects/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/project-setup/templates | Haypbooks/Frontend/src/app/(owner)/projects/project-setup/templates/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /projects/tasks | Haypbooks/Frontend/src/app/(owner)/projects/tasks/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /projects/tasks/resource-planning | Haypbooks/Frontend/src/app/(owner)/projects/tasks/resource-planning/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /projects/tasks/schedule | Haypbooks/Frontend/src/app/(owner)/projects/tasks/schedule/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /projects/tasks/task-list | Haypbooks/Frontend/src/app/(owner)/projects/tasks/task-list/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /projects/tasks/time-expenses | Haypbooks/Frontend/src/app/(owner)/projects/tasks/time-expenses/page.tsx | Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | (none detected) | stub/placeholder |
| /reporting/analytics/analytics-dashboards | Haypbooks/Frontend/src/app/(owner)/reporting/analytics/analytics-dashboards/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/custom-reports | Haypbooks/Frontend/src/app/(owner)/reporting/custom-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/custom-reports/report-builder | Haypbooks/Frontend/src/app/(owner)/reporting/custom-reports/report-builder/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/custom-reports/scheduled-reports | Haypbooks/Frontend/src/app/(owner)/reporting/custom-reports/scheduled-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/accountant-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/accountant-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/accountant-reports/general-ledger | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/accountant-reports/general-ledger/page.tsx | Haypbooks/Frontend/src/components/accounting/GeneralLedgerPage.tsx | /companies/:param/accounting/accounts<br>/companies/:param/general-ledger | partial |
| /reporting/reports-center/accountant-reports/trial-balance | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/accountant-reports/trial-balance/page.tsx | (inline/none) | /companies/:param/reports/trial-balance | real |
| /reporting/reports-center/banking-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/banking-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/expense-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/expense-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/financial-statements | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/financial-statements/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/financial-statements/balance-sheet | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/financial-statements/balance-sheet/page.tsx | (inline/none) | /companies/:param/reports/balance-sheet | real |
| /reporting/reports-center/financial-statements/cash-flow-statement | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/financial-statements/cash-flow-statement/page.tsx | (inline/none) | /companies/:param/reports/cash-flow | real |
| /reporting/reports-center/financial-statements/profit-and-loss | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/financial-statements/profit-and-loss/page.tsx | (inline/none) | /companies/:param/reports/profit-and-loss | real |
| /reporting/reports-center/inventory-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/inventory-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/payroll-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/payroll-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/project-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/project-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /reporting/reports-center/sales-reports | Haypbooks/Frontend/src/app/(owner)/reporting/reports-center/sales-reports/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /sales/billing | Haypbooks/Frontend/src/app/(owner)/sales/billing/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /sales/billing/invoices | Haypbooks/Frontend/src/app/(owner)/sales/billing/invoices/page.tsx | Haypbooks/Frontend/src/components/sales/InvoicesPage.tsx | /companies/:param/ar/invoices<br>/companies/:param/ar/invoices/:param/:param<br>/companies/:param/ar/invoices/:param/send<br>/companies/:param/ar/invoices/:param/void | partial |
| /sales/billing/invoices/new | Haypbooks/Frontend/src/app/(owner)/sales/billing/invoices/new/page.tsx | Haypbooks/Frontend/src/components/sales/InvoiceCreatePage.tsx | /api/companies/:param/settings<br>/companies/:param/ar/customers<br>/companies/:param/ar/invoices<br>/companies/:param/ar/invoices/:param/send<br>/companies/:param/inventory/items | partial |
| /sales/billing/payment-links | Haypbooks/Frontend/src/app/(owner)/sales/billing/payment-links/page.tsx | Haypbooks/Frontend/src/components/sales/PaymentLinksPage.tsx | /companies/:param/integrations/audit-logs<br>/companies/:param/payment-links | partial |
| /sales/billing/recurring | Haypbooks/Frontend/src/app/(owner)/sales/billing/recurring/page.tsx | Haypbooks/Frontend/src/components/sales/RecurringInvoicesPage.tsx | /companies/:param/ar/customers<br>/companies/:param/ar/recurring-invoices<br>/companies/:param/ar/recurring-invoices/:param<br>/companies/:param/ar/recurring-invoices/:param/generate<br>/companies/:param/ar/recurring-invoices/batch/delete | partial |
| /sales/collections | Haypbooks/Frontend/src/app/(owner)/sales/collections/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /sales/collections/aging | Haypbooks/Frontend/src/app/(owner)/sales/collections/aging/page.tsx | Haypbooks/Frontend/src/components/sales/ArAgingPage.tsx | /companies/:param/ar/customers/:param/activity<br>/companies/:param/ar/reports/aging | partial |
| /sales/collections/center | Haypbooks/Frontend/src/app/(owner)/sales/collections/center/page.tsx | Haypbooks/Frontend/src/components/sales/CollectionsCenterPage.tsx | /companies/:param/ar/collections<br>/companies/:param/ar/collections/:param<br>/companies/:param/ar/collections/batch/delete<br>/companies/:param/ar/collections/batch/status<br>/companies/:param/ar/collections/export<br>/companies/:param/integrations/audit-logs | partial |
| /sales/collections/dunning | Haypbooks/Frontend/src/app/(owner)/sales/collections/dunning/page.tsx | Haypbooks/Frontend/src/components/sales/DunningManagementPage.tsx | /companies/:param/ar/dunning/:param/activity<br>/companies/:param/ar/dunning/:param/level<br>/companies/:param/ar/dunning/batch/send<br>/companies/:param/ar/dunning/send<br>/companies/:param/invoices | partial |
| /sales/collections/payments | Haypbooks/Frontend/src/app/(owner)/sales/collections/payments/page.tsx | Haypbooks/Frontend/src/components/sales/CustomerPaymentsPage.tsx | /companies/:param/ar/customers<br>/companies/:param/ar/invoices<br>/companies/:param/ar/payments<br>/companies/:param/ar/payments/:param<br>/companies/:param/ar/payments/:param/activity<br>/companies/:param/ar/payments/:param/void<br>/companies/:param/banking/accounts | partial |
| /sales/collections/refunds | Haypbooks/Frontend/src/app/(owner)/sales/collections/refunds/page.tsx | Haypbooks/Frontend/src/components/sales/RefundsPage.tsx | /companies/:param/ar/customers<br>/companies/:param/ar/refunds<br>/companies/:param/ar/refunds/:param/activity<br>/companies/:param/ar/refunds/:param/process<br>/companies/:param/ar/refunds/batch/delete | partial |
| /sales/collections/write-offs | Haypbooks/Frontend/src/app/(owner)/sales/collections/write-offs/page.tsx | Haypbooks/Frontend/src/components/sales/WriteOffsPage.tsx | /companies/:param/ar/write-offs<br>/companies/:param/ar/write-offs/:param<br>/companies/:param/ar/write-offs/:param/activity<br>/companies/:param/ar/write-offs/:param/approve<br>/companies/:param/ar/write-offs/:param/reverse<br>/companies/:param/ar/write-offs/batch/delete | partial |
| /sales/customers | Haypbooks/Frontend/src/app/(owner)/sales/customers/page.tsx | Haypbooks/Frontend/src/components/sales/CustomersPage.tsx | /companies/:param/ar/customer-groups<br>/companies/:param/ar/customers<br>/companies/:param/ar/customers/:param<br>/companies/:param/ar/customers/:param/activity<br>/companies/:param/ar/customers/batch/delete<br>/companies/:param/ar/customers/batch/status<br>/companies/:param/ar/customers/export<br>/companies/:param/ar/payment-terms | partial |
| /sales/customers/[id] | Haypbooks/Frontend/src/app/(owner)/sales/customers/[id]/page.tsx | Haypbooks/Frontend/src/components/sales/CustomerDetailPage.tsx | /companies/:param/ar/customers/:param<br>/companies/:param/ar/customers/:param/activity<br>/companies/:param/ar/payment-terms | partial |
| /sales/customers/activity | Haypbooks/Frontend/src/app/(owner)/sales/customers/activity/page.tsx | Haypbooks/Frontend/src/components/sales/CustomerActivityPage.tsx | /companies/:param/ar/customers/activity | partial |
| /sales/customers/groups | Haypbooks/Frontend/src/app/(owner)/sales/customers/groups/page.tsx | Haypbooks/Frontend/src/components/sales/CustomerGroupsPage.tsx | /companies/:param/ar/customer-groups<br>/companies/:param/ar/customer-groups/:param<br>/companies/:param/ar/customer-groups/batch/delete<br>/companies/:param/ar/customer-groups/export<br>/companies/:param/integrations/audit-logs | partial |
| /sales/customers/groups/[id] | Haypbooks/Frontend/src/app/(owner)/sales/customers/groups/[id]/page.tsx | Haypbooks/Frontend/src/components/sales/CustomerGroupDetailPage.tsx | /companies/:param/ar/customer-groups/:param<br>/companies/:param/ar/customer-groups/:param/members<br>/companies/:param/ar/customers | partial |
| /sales/customers/portal | Haypbooks/Frontend/src/app/(owner)/sales/customers/portal/page.tsx | Haypbooks/Frontend/src/components/sales/CustomerPortalPage.tsx | /companies/:param/customers | partial |
| /sales/revenue | Haypbooks/Frontend/src/app/(owner)/sales/revenue/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /sales/revenue/credit-notes | Haypbooks/Frontend/src/app/(owner)/sales/revenue/credit-notes/page.tsx | Haypbooks/Frontend/src/components/sales/CreditNotesPage.tsx | /companies/:param/ar/credit-notes<br>/companies/:param/ar/credit-notes/:param/activity<br>/companies/:param/ar/credit-notes/:param/apply<br>/companies/:param/ar/credit-notes/:param/void<br>/companies/:param/ar/credit-notes/batch/delete<br>/companies/:param/ar/credit-notes/export<br>/companies/:param/ar/customers<br>/companies/:param/ar/invoices | partial |
| /sales/revenue/deferred | Haypbooks/Frontend/src/app/(owner)/sales/revenue/deferred/page.tsx | Haypbooks/Frontend/src/components/sales/DeferredRevenuePage.tsx | /companies/:param/deferred-revenue<br>/companies/:param/deferred-revenue/:param/activity<br>/companies/:param/deferred-revenue/:param/recognize | partial |
| /sales/revenue/recognition | Haypbooks/Frontend/src/app/(owner)/sales/revenue/recognition/page.tsx | Haypbooks/Frontend/src/components/sales/RevenueRecognitionPage.tsx | /companies/:param/revenue-recognition<br>/companies/:param/revenue-recognition/:param/activity<br>/companies/:param/revenue-recognition/:param/recognize | partial |
| /sales/sales | Haypbooks/Frontend/src/app/(owner)/sales/sales/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /sales/sales/orders | Haypbooks/Frontend/src/app/(owner)/sales/sales/orders/page.tsx | Haypbooks/Frontend/src/components/sales/SalesOrdersPage.tsx | /companies/:param/ar/customers<br>/companies/:param/ar/sales-orders<br>/companies/:param/ar/sales-orders/:param<br>/companies/:param/ar/sales-orders/:param/activity<br>/companies/:param/ar/sales-orders/:param/convert<br>/companies/:param/ar/sales-orders/batch/delete | partial |
| /sales/sales/pipeline | Haypbooks/Frontend/src/app/(owner)/sales/sales/pipeline/page.tsx | (inline/none) | /companies/:param/integrations/audit-logs<br>/companies/:param/invoices<br>/companies/:param/quotes | real |
| /sales/sales/products-services | Haypbooks/Frontend/src/app/(owner)/sales/sales/products-services/page.tsx | Haypbooks/Frontend/src/components/sales/ProductsServicesPage.tsx | /companies/:param/inventory/items<br>/companies/:param/inventory/items/:param | partial |
| /sales/sales/products-services/[id] | Haypbooks/Frontend/src/app/(owner)/sales/sales/products-services/[id]/page.tsx | Haypbooks/Frontend/src/components/sales/ProductDetailPage.tsx | /companies/:param/inventory/items/:param | real |
| /sales/sales/quotes | Haypbooks/Frontend/src/app/(owner)/sales/sales/quotes/page.tsx | Haypbooks/Frontend/src/components/sales/QuotesEstimatesPage.tsx | /companies/:param/ar/customers<br>/companies/:param/ar/quotes<br>/companies/:param/ar/quotes/:param<br>/companies/:param/ar/quotes/:param/activity<br>/companies/:param/ar/quotes/:param/convert<br>/companies/:param/ar/quotes/:param/status<br>/companies/:param/ar/quotes/batch/delete<br>/companies/:param/ar/quotes/batch/status<br>/companies/:param/ar/quotes/export | partial |
| /settings/accounting-preferences | Haypbooks/Frontend/src/app/(owner)/settings/accounting-preferences/page.tsx | (inline/none) | /api/companies/:param<br>/api/companies/:param/settings | real |
| /settings/company-profile/company-details | Haypbooks/Frontend/src/app/(owner)/settings/company-profile/company-details/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/company-profile/fiscal-year-setup | Haypbooks/Frontend/src/app/(owner)/settings/company-profile/fiscal-year-setup/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/customization/custom-fields | Haypbooks/Frontend/src/app/(owner)/settings/customization/custom-fields/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/data-privacy/audit-log | Haypbooks/Frontend/src/app/(owner)/settings/data-privacy/audit-log/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/data-privacy/data-backup | Haypbooks/Frontend/src/app/(owner)/settings/data-privacy/data-backup/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/entity-management/base-currency | Haypbooks/Frontend/src/app/(owner)/settings/entity-management/base-currency/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/entity-management/numbering-sequences | Haypbooks/Frontend/src/app/(owner)/settings/entity-management/numbering-sequences/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/users-security/roles-permissions | Haypbooks/Frontend/src/app/(owner)/settings/users-security/roles-permissions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/users-security/two-factor-auth | Haypbooks/Frontend/src/app/(owner)/settings/users-security/two-factor-auth/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /settings/users-security/user-management | Haypbooks/Frontend/src/app/(owner)/settings/users-security/user-management/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/management/approval-history | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/management/approval-history/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/management/approval-queue | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/management/approval-queue/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/management/delegated-tasks | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/management/delegated-tasks/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/management/task-templates | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/management/task-templates/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/management/team-tasks | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/management/team-tasks/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/my-work/calendar | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/my-work/calendar/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/my-work/my-approvals | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/my-work/my-approvals/page.tsx | Haypbooks/Frontend/src/components/owner/PageDocumentation.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/my-work/my-exceptions | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/my-work/my-exceptions/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/my-work/my-tasks | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/my-work/my-tasks/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /tasks-approvals/my-work/overdue-items | Haypbooks/Frontend/src/app/(owner)/tasks-approvals/my-work/overdue-items/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/filing-payments/e-filing | Haypbooks/Frontend/src/app/(owner)/taxes/filing-payments/e-filing/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/filing-payments/tax-returns | Haypbooks/Frontend/src/app/(owner)/taxes/filing-payments/tax-returns/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-center/filing-payments | Haypbooks/Frontend/src/app/(owner)/taxes/tax-center/filing-payments/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-center/tax-calendar | Haypbooks/Frontend/src/app/(owner)/taxes/tax-center/tax-calendar/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-center/tax-dashboard | Haypbooks/Frontend/src/app/(owner)/taxes/tax-center/tax-dashboard/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-center/tax-liabilities | Haypbooks/Frontend/src/app/(owner)/taxes/tax-center/tax-liabilities/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-reporting/tax-summary | Haypbooks/Frontend/src/app/(owner)/taxes/tax-reporting/tax-summary/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-reporting/vat-payable | Haypbooks/Frontend/src/app/(owner)/taxes/tax-reporting/vat-payable/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-setup/tax-agencies | Haypbooks/Frontend/src/app/(owner)/taxes/tax-setup/tax-agencies/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /taxes/tax-setup/tax-rates | Haypbooks/Frontend/src/app/(owner)/taxes/tax-setup/tax-rates/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /time/entry | Haypbooks/Frontend/src/app/(owner)/time/entry/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /time/entry/time-entries | Haypbooks/Frontend/src/app/(owner)/time/entry/time-entries/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /time/entry/timer | Haypbooks/Frontend/src/app/(owner)/time/entry/timer/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /time/entry/timesheets | Haypbooks/Frontend/src/app/(owner)/time/entry/timesheets/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /time/review | Haypbooks/Frontend/src/app/(owner)/time/review/page.tsx | (inline/none) | (none detected) | ui-only/unknown |
| /time/review/billable-time-review | Haypbooks/Frontend/src/app/(owner)/time/review/billable-time-review/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |
| /time/review/time-approvals | Haypbooks/Frontend/src/app/(owner)/time/review/time-approvals/page.tsx | Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | (none detected) | stub/placeholder |

## 2) Every Component (`Frontend/src/components/`)

| ComponentFile | Purpose | Uses | APIEndpoints | Status |
| --- | --- | --- | --- | --- |
| Haypbooks/Frontend/src/components/AccessDeniedCard.tsx | Access denied | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/accounting/AccountingHubPage.tsx | Accounting Hub | @/components/accounting/ChartOfAccountsPage<br>@/components/accounting/JournalEntriesPage<br>@/components/accounting/GeneralLedgerPage<br>@/components/accounting/TrialBalancePage | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/accounting/AccountingPeriodsPage.tsx | Accounting Periods | (none detected) | /companies/:param/accounting/periods<br>/companies/:param/accounting/periods/:param/close<br>/companies/:param/accounting/periods/:param/reopen | partial |
| Haypbooks/Frontend/src/components/accounting/AccountSelect.tsx | Account Select | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/accounting/ChartOfAccountsPage.tsx | Chart of Accounts | (none detected) | /companies/:param/accounting/accounts<br>/companies/:param/accounting/accounts/:param<br>/companies/:param/accounting/accounts/seed-default | partial |
| Haypbooks/Frontend/src/components/accounting/GeneralLedgerPage.tsx | General Ledger | (none detected) | /companies/:param/accounting/accounts<br>/companies/:param/general-ledger | partial |
| Haypbooks/Frontend/src/components/accounting/JournalAuditLog.tsx | Journal Audit Log | (none detected) | /companies/:param/accounting/journal-entries/:param/activity<br>/companies/:param/accounting/journal-entries/audit-log | real |
| Haypbooks/Frontend/src/components/accounting/JournalEntriesPage.tsx | Journal Entries | (none detected) | /companies/:param/accounting/journal-entries<br>/companies/:param/accounting/journal-entries/:param<br>/companies/:param/accounting/journal-entries/:param/post<br>/companies/:param/accounting/journal-entries/:param/void | partial |
| Haypbooks/Frontend/src/components/accounting/TrialBalancePage.tsx | Trial Balance | (none detected) | /companies/:param/accounting/trial-balance | partial |
| Haypbooks/Frontend/src/components/AnimatedBackground.tsx | Animated Background | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/AppShellHeader.tsx | Go to Dashboard | @/components/UserMenu<br>@/components/RoleSwitcher<br>@/components/NewMenu<br>@/components/Popover<br>@/components/CompanySwitcher<br>@/components/HubSwitcher<br>@/components/NotificationsPanel | /api/periods | partial |
| Haypbooks/Frontend/src/components/auth/AddPhoneForm.tsx | +63 Philippines | (none detected) | /api/users/phone | partial |
| Haypbooks/Frontend/src/components/auth/AuthLayout.tsx | Crystal Clear Insights | ./BackgroundEffects | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/auth/BackgroundEffects.tsx | Background Effects | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/auth/DevReauth.tsx | Dev Reauth | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/auth/EmailCodeForm.tsx | Email Code Form | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/auth/ForgotPasswordForm.tsx | Forgot Password Form | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/auth/OtpInput.tsx | Otp Input | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/auth/PhoneCodeForm.tsx | Phone Code Form | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/auth/PinEntryForm.tsx | Pin Entry Form | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/auth/PinSetupForm.tsx | Pin Setup Form | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/auth/ResetPasswordForm.tsx | Reset Password Form | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/auth/VerificationMethodCard.tsx | Verification Method Card | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/auth/VerifyOtpForm.tsx | Verify Otp Form | ./OtpInput | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/BackBar.tsx | Back Bar | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/BackButton.tsx | Back Button | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/banking/BankDepositsPage.tsx | Bank Deposits | (none detected) | /companies/:param/banking/accounts<br>/companies/:param/banking/deposits<br>/companies/:param/banking/deposits/:param<br>/companies/:param/banking/deposits/:param/post<br>/companies/:param/banking/deposits/:param/void<br>/companies/:param/banking/undeposited-funds | partial |
| Haypbooks/Frontend/src/components/banking/BankReconciliationPage.tsx | Bank Reconciliation | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/banking/BankTransactionsPage.tsx | {view === 'register' ? 'Bank Register' : 'Bank Transactions'} | (none detected) | /companies/:param/banking<br>/companies/:param/banking/accounts<br>/companies/:param/banking/accounts/:param/activity<br>/companies/:param/banking/transfers | partial |
| Haypbooks/Frontend/src/components/banking/UndepositedFundsPage.tsx | Undeposited Funds | (none detected) | /companies/:param/banking/undeposited-funds | partial |
| Haypbooks/Frontend/src/components/Breadcrumbs.tsx | Breadcrumbs | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/cards/EntityCard.tsx | Entity Card | (none detected) | /companies/new | real |
| Haypbooks/Frontend/src/components/CinematicIntro.tsx | Financial Clarity | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ColumnResizer.tsx | Column Resizer | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/CommandPalette.tsx | Command Palette | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/companies/AddCompanyModal.tsx | Add Company Modal | (none detected) | /api/companies | partial |
| Haypbooks/Frontend/src/components/companies/AddPracticeModal.tsx | Add Practice Modal | (none detected) | /api/tenants/practices | partial |
| Haypbooks/Frontend/src/components/companies/CompanyHub.tsx | Refresh companies list | @/components/cards/EntityCard<br>@/components/ToastProvider<br>./AddCompanyModal<br>./AddPracticeModal<br>./InviteAccountantModal | /api/companies<br>/api/users/me<br>/companies/:param<br>/companies/new | partial |
| Haypbooks/Frontend/src/components/companies/create/PlanSelector.tsx | Starter | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/companies/InviteAccountantModal.tsx | Invite Accountant Modal | (none detected) | /api/tenants/:param/invites<br>/api/tenants/:param/invites/:param/cancel<br>/api/tenants/invites/pending | partial |
| Haypbooks/Frontend/src/components/CompanySetup/__tests__/ProductsServicesPage.test.tsx | Products Services Page.test | ../ProductsServicesPage | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/CompanySetup/ProductsServicesPage.tsx | Products Services Page | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/CompanySwitcher.tsx | Switch company | @/components/Popover | /api/companies/:param/last-accessed<br>/api/companies/recent | real |
| Haypbooks/Frontend/src/components/DashboardBrand.tsx | Dashboard Brand | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/DashboardTopBar.tsx | Dashboard Top Bar | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/DataTable.tsx | Data Table | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/DevWebhookListener.tsx | Dev Webhook Listener | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/expenses/ApAgingPage.tsx | AP Aging Summary | (none detected) | /companies/:param/ap/reports/aging | real |
| Haypbooks/Frontend/src/components/expenses/BillPaymentsPage.tsx | Bill Payments | (none detected) | /companies/:param/ap/bill-payments<br>/companies/:param/bill-payments<br>/companies/:param/bill-payments/:param/void<br>/companies/:param/bills | partial |
| Haypbooks/Frontend/src/components/expenses/BillsPage.tsx | Bills | (none detected) | /companies/:param/ap/bills<br>/companies/:param/ap/bills/:param/activity<br>/companies/:param/bills<br>/companies/:param/bills/:param/approve<br>/companies/:param/bills/:param/void<br>/companies/:param/vendors | partial |
| Haypbooks/Frontend/src/components/expenses/ExpenseCapturePage.tsx | Expense Capture | (none detected) | /companies/:param/expense-capture/expenses<br>/companies/:param/expense-capture/mileage<br>/companies/:param/expense-capture/receipts<br>/companies/:param/expense-capture/reimbursements | partial |
| Haypbooks/Frontend/src/components/expenses/PurchaseOrdersPage.tsx | Purchase Orders | (none detected) | /companies/:param/purchase-orders | partial |
| Haypbooks/Frontend/src/components/expenses/VendorCreditsPage.tsx | Vendor Credits | (none detected) | /companies/:param/ap/vendor-credits | partial |
| Haypbooks/Frontend/src/components/expenses/VendorsPage.tsx | Vendors | (none detected) | /companies/:param/ap/vendors/:param/activity<br>/companies/:param/vendors<br>/companies/:param/vendors/:param | partial |
| Haypbooks/Frontend/src/components/GapAdjuster.tsx | Gap Adjuster | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/GlobalMinimizedDock.tsx | Minimized items | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/HelpPopover.tsx | Help | ./Popover | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/HubHeader.tsx | Hub Header | @/components/HubSwitcher<br>@/components/CompanySwitcher | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/HubPageContainer.tsx | Hub Page Container | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/HubSelectionModal.tsx | HaypBooks | (none detected) | /api/companies<br>/api/tenants/clients<br>/api/users/preferred-hub | real |
| Haypbooks/Frontend/src/components/HubSidebar.tsx | HaypBooks | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/HubSwitcher.tsx | Hub Switcher | (none detected) | /api/users/preferred-hub | real |
| Haypbooks/Frontend/src/components/InlineWidthResizer.tsx | Inline Width Resizer | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/IntroAnimation.tsx | Haypbooks | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/Features.tsx | Business Management | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/Footer.tsx | Product | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/Hero.tsx | Accounting Made Simple | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/HowItWorks.tsx | Create Your Account | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/Industries.tsx | Industries | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/JourneySteps.tsx | Journey Steps | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/LandingHeader.tsx | Landing Header | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/LandingTweakControls.tsx | Landing Tweak Controls | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/LearningSearch.tsx | Learning Search | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/landing/ModernPricing.tsx | Modern Pricing | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/PricingPreview.tsx | Pricing Preview | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/ResourceGrid.tsx | Knowledge base | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/StoryHero.tsx | Story Hero | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/landing/Testimonials.tsx | Testimonials | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/landing/VideoCard.tsx | Video Card | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/layout/EdgeInset.tsx | Edge Inset | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/footer.tsx | footer | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/header.tsx | {title} | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/sidebar/owner-sidebar.tsx | owner sidebar | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/tabs/ContentTabBar.tsx | Content Tab Bar | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/tabs/SectionBreadcrumb.tsx | Section Breadcrumb | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/tabs/SectionTabBar.tsx | Section Tab Bar | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/tabs/TabbedSectionLayout.tsx | {section.label} | ./ContentTabBar | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/layout/tabs/TabPlaceholder.tsx | Tab Placeholder | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/layout/top-nav.tsx | top nav | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/MinimizedDock.tsx | Minimized items | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/MockInit.tsx | Mock Init | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/ModalErrorBoundary.tsx | Modal Error Boundary | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/NewMenu.tsx | New Menu | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/Notice.tsx | Notice | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/NotificationsPanel.tsx | Purchase Order Approval Required | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/Onboarding/__tests__/BusinessStep.test.tsx | Business Step.test | ../BusinessStep | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/Onboarding/BusinessStep.tsx | Business Step | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/AccountAuditLog.tsx | Refresh | (none detected) | /companies/:param/accounting/accounts/audit-log | real |
| Haypbooks/Frontend/src/components/owner/BankAccountsCrudPage.tsx | Bank Account | @/components/owner/OwnerPageTemplate<br>@/components/owner/CrudModal<br>@/components/owner/statusColors | /companies/:param/banking/accounts | partial |
| Haypbooks/Frontend/src/components/owner/ChecksCrudPage.tsx | Check | @/components/owner/OwnerPageTemplate<br>@/components/owner/CrudModal<br>@/components/owner/statusColors | /companies/{companyId}/banking/checks | partial |
| Haypbooks/Frontend/src/components/owner/ComingSoon.tsx | {title ?? 'Coming Soon'} | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/CreditCardsCrudPage.tsx | Credit Card | @/components/owner/OwnerPageTemplate<br>@/components/owner/CrudModal<br>@/components/owner/statusColors | /companies/{companyId}/banking/credit-cards | partial |
| Haypbooks/Frontend/src/components/owner/CrudModal.tsx | New Customer | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/CustomerAuditLog.tsx | Refresh | (none detected) | /companies/:param/contacts/customers/:param/audit-log | real |
| Haypbooks/Frontend/src/components/owner/CustomersCrudPage.tsx | Customers | @/components/owner/OwnerPageTemplate<br>@/components/owner/CrudModal<br>@/components/owner/CustomerAuditLog<br>@/components/owner/statusColors | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/DepositsCrudPage.tsx | Deposit | @/components/owner/OwnerPageTemplate<br>@/components/owner/CrudModal<br>@/components/owner/statusColors | /companies/{companyId}/banking/deposits | partial |
| Haypbooks/Frontend/src/components/owner/OwnerDashboard.tsx | Dashboard | (none detected) | /api/owner/cash-position<br>/api/owner/financial-summary | real |
| Haypbooks/Frontend/src/components/owner/OwnerPageTemplate.tsx | {title} | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/OwnerProgressChecklist.tsx | Owner Progress Checklist | ./ownerNavConfig | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/OwnerSidebar.tsx | Owner Sidebar | ./ownerNavConfig | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/owner/OwnerTopBar.tsx | Owner Top Bar | ./OwnerProgressChecklist | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/PageDocumentation.tsx | {title} | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/SectionComingSoon.tsx | Section Coming Soon | @/components/owner/ComingSoon<br>@/components/owner/ownerNavConfig | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/owner/SetupCenter.tsx | Setup Center | (none detected) | /api/companies/:param<br>/api/companies/:param/accounting/accounts/seed-default | real |
| Haypbooks/Frontend/src/components/owner/VendorsCrudPage.tsx | Vendors | @/components/owner/OwnerPageTemplate<br>@/components/owner/CrudModal<br>@/components/owner/statusColors | /companies/:param/contacts/vendors | partial |
| Haypbooks/Frontend/src/components/Popover.tsx | Popover | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/practice-hub/PageLayoutDefaults.tsx | Page Layout Defaults | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/practice-hub/PracticeProgressChecklist.tsx | Practice Progress Checklist | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/practice-hub/RightGapAdjuster.tsx | Right Gap Adjuster | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/practice-hub/TopBarActions.tsx | Top Bar Actions | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/PracticeHeader.tsx | Practice Header | @/components/practice-hub/TopBarActions<br>@/components/practice-hub/PageLayoutDefaults<br>@/components/practice-hub/RightGapAdjuster | /api/periods | partial |
| Haypbooks/Frontend/src/components/PracticeOnboarding/BankingPayments.tsx | Banking Payments | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/PracticeOnboarding/Branding.tsx | Branding | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/PracticeOnboarding/FiscalAccounting.tsx | Fiscal Accounting | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/PracticeOnboarding/PracticeProfile.tsx | Practice Profile | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/PracticeOnboarding/Review.tsx | Review | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/PracticeOnboarding/ServicesOffered.tsx | Services Offered | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/PracticeOnboarding/TaxCompliance.tsx | Tax Compliance | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ProfileCard.tsx | Profile Card | (none detected) | /api/user/profile | real |
| Haypbooks/Frontend/src/components/ResizableBox.tsx | Resizable Box | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ResizableColumn.tsx | Resizable Column | ./ColumnResizer | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/RoleSelectionModal.tsx | Role Selection Modal | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/RoleSwitcher.tsx | Switch role for RBAC testing | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/sales/ArAgingPage.tsx | AR Aging Report | (none detected) | /companies/:param/ar/customers/:param/activity<br>/companies/:param/ar/reports/aging | partial |
| Haypbooks/Frontend/src/components/sales/CollectionsCenterPage.tsx | Collections Center | (none detected) | /companies/:param/ar/collections<br>/companies/:param/ar/collections/:param<br>/companies/:param/ar/collections/batch/delete<br>/companies/:param/ar/collections/batch/status<br>/companies/:param/ar/collections/export<br>/companies/:param/integrations/audit-logs | partial |
| Haypbooks/Frontend/src/components/sales/CreditNotesPage.tsx | Credit Notes | ./CustomerPickerField<br>./QuickAddCustomerModal | /companies/:param/ar/credit-notes<br>/companies/:param/ar/credit-notes/:param/activity<br>/companies/:param/ar/credit-notes/:param/apply<br>/companies/:param/ar/credit-notes/:param/void<br>/companies/:param/ar/credit-notes/batch/delete<br>/companies/:param/ar/credit-notes/export<br>/companies/:param/ar/customers<br>/companies/:param/ar/invoices | partial |
| Haypbooks/Frontend/src/components/sales/CustomerActivityPage.tsx | Customer Activity Log | (none detected) | /companies/:param/ar/customers/activity | partial |
| Haypbooks/Frontend/src/components/sales/CustomerDetailPage.tsx | {customer.name} | @/components/ToastProvider | /companies/:param/ar/customers/:param<br>/companies/:param/ar/customers/:param/activity<br>/companies/:param/ar/payment-terms | partial |
| Haypbooks/Frontend/src/components/sales/CustomerDocumentsPage.tsx | Customer Documents | (none detected) | /companies/:param/customers | partial |
| Haypbooks/Frontend/src/components/sales/CustomerGroupDetailPage.tsx | Back to Groups | @/components/ToastProvider | /companies/:param/ar/customer-groups/:param<br>/companies/:param/ar/customer-groups/:param/members<br>/companies/:param/ar/customers | partial |
| Haypbooks/Frontend/src/components/sales/CustomerGroupsPage.tsx | Refresh | @/components/ToastProvider | /companies/:param/ar/customer-groups<br>/companies/:param/ar/customer-groups/:param<br>/companies/:param/ar/customer-groups/batch/delete<br>/companies/:param/ar/customer-groups/export<br>/companies/:param/integrations/audit-logs | partial |
| Haypbooks/Frontend/src/components/sales/CustomerPaymentsPage.tsx | Customer Payments | ./CustomerPickerField<br>./QuickAddCustomerModal | /companies/:param/ar/customers<br>/companies/:param/ar/invoices<br>/companies/:param/ar/payments<br>/companies/:param/ar/payments/:param<br>/companies/:param/ar/payments/:param/activity<br>/companies/:param/ar/payments/:param/void<br>/companies/:param/banking/accounts | partial |
| Haypbooks/Frontend/src/components/sales/CustomerPickerField.tsx | Customer Picker Field | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/sales/CustomerPortalPage.tsx | Customer Portal | @/components/ToastProvider | /companies/:param/customers | partial |
| Haypbooks/Frontend/src/components/sales/CustomersPage.tsx | Customers | @/components/ToastProvider | /companies/:param/ar/customer-groups<br>/companies/:param/ar/customers<br>/companies/:param/ar/customers/:param<br>/companies/:param/ar/customers/:param/activity<br>/companies/:param/ar/customers/batch/delete<br>/companies/:param/ar/customers/batch/status<br>/companies/:param/ar/customers/export<br>/companies/:param/ar/payment-terms | partial |
| Haypbooks/Frontend/src/components/sales/CustomerStatementsPage.tsx | Customer Statements | (none detected) | /companies/:param/customers | partial |
| Haypbooks/Frontend/src/components/sales/DeferredRevenuePage.tsx | Deferred Revenue | (none detected) | /companies/:param/deferred-revenue<br>/companies/:param/deferred-revenue/:param/activity<br>/companies/:param/deferred-revenue/:param/recognize | partial |
| Haypbooks/Frontend/src/components/sales/DunningManagementPage.tsx | Dunning Management | @/components/ToastProvider | /companies/:param/ar/dunning/:param/activity<br>/companies/:param/ar/dunning/:param/level<br>/companies/:param/ar/dunning/batch/send<br>/companies/:param/ar/dunning/send<br>/companies/:param/invoices | partial |
| Haypbooks/Frontend/src/components/sales/EmailPreviewModal.tsx | Email Preview Modal | ./InvoicesPage<br>./TemplateManagerModal | /companies/:param/ar/invoices/:param/send<br>/companies/:param/email-templates | real |
| Haypbooks/Frontend/src/components/sales/invoice-templates/TemplateCard.tsx | Template Card | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/sales/invoice-templates/TemplateEditor.tsx | INVOICE | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/sales/invoice-templates/TemplateGallery.tsx | Template Gallery | ./TemplateCard<br>./TemplatePreview<br>./TemplateEditor | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/sales/invoice-templates/TemplatePreview.tsx | INVOICE | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/sales/InvoiceCreatePage.tsx | INVOICE | @/components/sales/invoice-templates/TemplateGallery<br>@/components/sales/QuickAddCustomerModal<br>@/components/sales/CustomerPickerField<br>@/components/ToastProvider | /api/companies/:param/settings<br>/companies/:param/ar/customers<br>/companies/:param/ar/invoices<br>/companies/:param/ar/invoices/:param/send<br>/companies/:param/inventory/items | partial |
| Haypbooks/Frontend/src/components/sales/InvoiceDetailPage.tsx | Invoice Detail Page | ./InvoicesPage<br>./EmailPreviewModal<br>./TemplateManagerModal | /companies/:param/ar/invoices/:param<br>/companies/:param/ar/invoices/:param/activity<br>/companies/:param/ar/invoices/:param/send<br>/companies/:param/ar/invoices/:param/void<br>/companies/:param/ar/payments<br>/companies/:param/email-templates | partial |
| Haypbooks/Frontend/src/components/sales/InvoiceSettingsModal.tsx | Scheduling & Recurrency | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/sales/InvoicesPage.tsx | Invoices | ./InvoiceDetailPage<br>./invoice-templates/TemplateGallery<br>./EmailPreviewModal | /companies/:param/ar/invoices<br>/companies/:param/ar/invoices/:param/:param<br>/companies/:param/ar/invoices/:param/send<br>/companies/:param/ar/invoices/:param/void | partial |
| Haypbooks/Frontend/src/components/sales/PaymentLinksPage.tsx | Payment Links | (none detected) | /companies/:param/integrations/audit-logs<br>/companies/:param/payment-links | partial |
| Haypbooks/Frontend/src/components/sales/ProductDetailPage.tsx | {product.name} | @/components/ToastProvider<br>@/components/sales/ProductFormModal | /companies/:param/inventory/items/:param | real |
| Haypbooks/Frontend/src/components/sales/ProductFormModal.tsx | Product Form Modal | ./ProductsServicesPage | /companies/:param/inventory/items<br>/companies/:param/inventory/items/:param<br>/companies/:param/inventory/items/:param/activity | partial |
| Haypbooks/Frontend/src/components/sales/ProductsServicesPage.tsx | Products &amp; Services | ./ProductFormModal | /companies/:param/inventory/items<br>/companies/:param/inventory/items/:param | partial |
| Haypbooks/Frontend/src/components/sales/QuickAddCustomerModal.tsx | Quick Add Customer Modal | (none detected) | /companies/:param/ar/customers | partial |
| Haypbooks/Frontend/src/components/sales/QuotesEstimatesPage.tsx | Quotes & Estimates | ./CustomerPickerField<br>./QuickAddCustomerModal | /companies/:param/ar/customers<br>/companies/:param/ar/quotes<br>/companies/:param/ar/quotes/:param<br>/companies/:param/ar/quotes/:param/activity<br>/companies/:param/ar/quotes/:param/convert<br>/companies/:param/ar/quotes/:param/status<br>/companies/:param/ar/quotes/batch/delete<br>/companies/:param/ar/quotes/batch/status<br>/companies/:param/ar/quotes/export | partial |
| Haypbooks/Frontend/src/components/sales/RecurringInvoicesPage.tsx | Recurring Invoices | @/components/ToastProvider<br>./CustomerPickerField<br>./QuickAddCustomerModal | /companies/:param/ar/customers<br>/companies/:param/ar/recurring-invoices<br>/companies/:param/ar/recurring-invoices/:param<br>/companies/:param/ar/recurring-invoices/:param/generate<br>/companies/:param/ar/recurring-invoices/batch/delete | partial |
| Haypbooks/Frontend/src/components/sales/RefundsPage.tsx | Refunds | @/components/ToastProvider<br>./CustomerPickerField<br>./QuickAddCustomerModal | /companies/:param/ar/customers<br>/companies/:param/ar/refunds<br>/companies/:param/ar/refunds/:param/activity<br>/companies/:param/ar/refunds/:param/process<br>/companies/:param/ar/refunds/batch/delete | partial |
| Haypbooks/Frontend/src/components/sales/RevenueRecognitionPage.tsx | Revenue Recognition | (none detected) | /companies/:param/revenue-recognition<br>/companies/:param/revenue-recognition/:param/activity<br>/companies/:param/revenue-recognition/:param/recognize | partial |
| Haypbooks/Frontend/src/components/sales/SalesOrdersPage.tsx | Sales Orders | @/components/ToastProvider<br>./CustomerPickerField<br>./QuickAddCustomerModal | /companies/:param/ar/customers<br>/companies/:param/ar/sales-orders<br>/companies/:param/ar/sales-orders/:param<br>/companies/:param/ar/sales-orders/:param/activity<br>/companies/:param/ar/sales-orders/:param/convert<br>/companies/:param/ar/sales-orders/batch/delete | partial |
| Haypbooks/Frontend/src/components/sales/TemplateManagerModal.tsx | Set as default | (none detected) | /companies/:param/email-templates<br>/companies/:param/email-templates/:param | partial |
| Haypbooks/Frontend/src/components/sales/WriteOffsPage.tsx | Write-Offs | @/components/ToastProvider | /companies/:param/ar/write-offs<br>/companies/:param/ar/write-offs/:param<br>/companies/:param/ar/write-offs/:param/activity<br>/companies/:param/ar/write-offs/:param/approve<br>/companies/:param/ar/write-offs/:param/reverse<br>/companies/:param/ar/write-offs/batch/delete | partial |
| Haypbooks/Frontend/src/components/shared/FullAuditLog.tsx | {title} | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/shared/ModuleTabs.tsx | Module Tabs | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/shared/SectionModuleTabs.tsx | Section Module Tabs | @/components/shared/ModuleTabs | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/shared/TabComingSoon.tsx | Coming Soon | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/Sidebar.tsx | Sidebar | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/StatusBadge.tsx | Status Badge | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/Toaster.tsx | Toaster | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ToastProvider.tsx | Toast Provider | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/TopBar.tsx | HAYPBOOKS | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ui/ComingSoonPage.tsx | Coming Soon Page | (none detected) | (none detected) | stub/placeholder |
| Haypbooks/Frontend/src/components/ui/DashboardHeader.tsx | Dashboard Header | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ui/EmptyState.tsx | No data found | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ui/GlassCard.tsx | Glass Card | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/ui/Toast.tsx | Toast | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/UserMenu.tsx | User Menu | (none detected) | /api/auth/logout | real |
| Haypbooks/Frontend/src/components/workspace/CompanyModal.tsx | Company Modal | (none detected) | /api/companies/:param/last-accessed<br>/api/users/preferred-workspace | real |
| Haypbooks/Frontend/src/components/workspace/HubCard.tsx | Hub Card | (none detected) | (none detected) | ui-only/unknown |
| Haypbooks/Frontend/src/components/workspace/WorkspacePage.tsx | Welcome back{profile?.name ? `, ${profile.name}` : ''} | ./CompanyModal<br>@/components/ToastProvider | /api/users/me | partial |

## 3) Every Backend Module (`Backend/src/`)

### Module: accounting

- Controllers: 2
- Endpoint handlers: 30
- Prisma models used: account, accountType, accountingPeriod, auditLog, company, journalEntry, journalEntryLine, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/accounting/account-types | listAccountTypes | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/accounts | listAccounts | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/accounts | createAccount | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/accounts/seed-default | seedDefaultAccounts | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/coa-templates | listCoaTemplates | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/accounts/audit-log | getAccountAuditLog | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/accounts/:accountId | getAccount | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/accounts/:accountId/ledger | getAccountLedger | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| PUT | /api/companies/:companyId/accounting/accounts/:accountId | updateAccount | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| DELETE | /api/companies/:companyId/accounting/accounts/:accountId | deactivateAccount | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/journal-entries/audit-log | getJournalEntriesAuditLog | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/journal-entries | listJournalEntries | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/journal-entries | createJournalEntry | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/journal-entries/:jeId | getJournalEntry | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/journal-entries/:jeId/activity | getJournalEntryActivity | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| PUT | /api/companies/:companyId/accounting/journal-entries/:jeId | updateJournalEntry | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/journal-entries/:jeId/post | postJournalEntry | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/journal-entries/:jeId/void | voidJournalEntry | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| DELETE | /api/companies/:companyId/accounting/journal-entries/:jeId | deleteJournalEntry | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/trial-balance | getTrialBalance | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/periods | listPeriods | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/periods | createPeriod | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/periods/:periodId/close | closePeriod | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| POST | /api/companies/:companyId/accounting/periods/:periodId/reopen | reopenPeriod | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/companies/:companyId/accounting/period-close/multi-currency-revaluation | getMultiCurrencyRevaluation | Haypbooks/Backend/src/accounting/accounting.controller.ts |
| GET | /api/accounting/coa-templates | listTemplates | Haypbooks/Backend/src/accounting/coa-templates.controller.ts |
| POST | /api/accounting/coa-templates | saveTemplates | Haypbooks/Backend/src/accounting/coa-templates.controller.ts |
| GET | /api/accounting/close-workflow | getCloseWorkflow | Haypbooks/Backend/src/accounting/coa-templates.controller.ts |
| POST | /api/accounting/close-workflow/run | runCloseWorkflow | Haypbooks/Backend/src/accounting/coa-templates.controller.ts |
| POST | /api/accounting/close-workflow/complete | completeCloseWorkflow | Haypbooks/Backend/src/accounting/coa-templates.controller.ts |

### Module: ap

- Controllers: 1
- Endpoint handlers: 23
- Prisma models used: auditLog, bill, billPayment, company, purchaseOrder, service, vendor, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/ap/vendors | listVendors | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/vendors | createVendor | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/vendors/:contactId/activity | getVendorActivity | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/vendors/:contactId | getVendor | Haypbooks/Backend/src/ap/ap.controller.ts |
| PUT | /api/companies/:companyId/ap/vendors/:contactId | updateVendor | Haypbooks/Backend/src/ap/ap.controller.ts |
| DELETE | /api/companies/:companyId/ap/vendors/:contactId | deleteVendor | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/bills | listBills | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/bills | createBill | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/bills/:billId/activity | getBillActivity | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/bills/:billId | getBill | Haypbooks/Backend/src/ap/ap.controller.ts |
| PUT | /api/companies/:companyId/ap/bills/:billId | updateBill | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/bills/:billId/approve | approveBill | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/bills/:billId/void | voidBill | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/bill-payments | listBillPayments | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/bill-payments | recordBillPayment | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/bill-payments/:paymentId | getBillPayment | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/bill-payments/:paymentId/void | voidBillPayment | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/purchase-orders | listPOs | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/purchase-orders | createPO | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/purchase-orders/:poId | getPO | Haypbooks/Backend/src/ap/ap.controller.ts |
| PATCH | /api/companies/:companyId/ap/purchase-orders/:poId/status | updatePOStatus | Haypbooks/Backend/src/ap/ap.controller.ts |
| POST | /api/companies/:companyId/ap/purchase-orders/:poId/convert | convertPOToBill | Haypbooks/Backend/src/ap/ap.controller.ts |
| GET | /api/companies/:companyId/ap/reports/aging | getApAging | Haypbooks/Backend/src/ap/ap.controller.ts |

### Module: ar

- Controllers: 1
- Endpoint handlers: 104
- Prisma models used: auditLog, bankAccount, collectionsCase, company, contactAddress, creditNote, customer, customerGroup, customerRefund, deferredRevenue, invoice, paymentLink, paymentMethod, paymentReceived, paymentTerm, quote, quoteLine, recurringInvoice, revenueRecognition, salesOrder, salesOrderLine, service, workspaceUser, writeOff
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/ar/customers | listCustomers | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/customers | createCustomer | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customers/export | exportCustomers | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customers/activity | getAllCustomerActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/customer-groups | createCustomerGroup | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customer-groups/export | exportCustomerGroups | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/customer-groups/batch/delete | batchDeleteCustomerGroups | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customer-groups | listCustomerGroups | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customer-groups/:id | getCustomerGroup | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customer-groups/:id/members | listGroupMembers | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/customer-groups/:id/members | addGroupMembers | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/customer-groups/:id/members | removeGroupMembers | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/customer-groups/:id | updateCustomerGroup | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/customer-groups/:id | deleteCustomerGroup | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/payment-terms | listPaymentTerms | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/customers/batch/delete | batchDeleteCustomers | Haypbooks/Backend/src/ar/ar.controller.ts |
| PATCH | /api/companies/:companyId/ar/customers/batch/status | batchUpdateCustomerStatus | Haypbooks/Backend/src/ar/ar.controller.ts |
| PATCH | /api/companies/:companyId/ar/customers/batch/group | batchUpdateCustomerGroup | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customers/:contactId/activity | getCustomerActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/customers/:contactId | getCustomer | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/customers/:contactId | updateCustomer | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/customers/:contactId | deleteCustomer | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/quotes | listQuotes | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/quotes | createQuote | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/quotes/export | exportQuotes | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/quotes/batch/delete | batchDeleteQuotes | Haypbooks/Backend/src/ar/ar.controller.ts |
| PATCH | /api/companies/:companyId/ar/quotes/batch/status | batchUpdateQuoteStatus | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/quotes/:quoteId/activity | getQuoteActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/quotes/:quoteId | getQuote | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/quotes/:quoteId | updateQuote | Haypbooks/Backend/src/ar/ar.controller.ts |
| PATCH | /api/companies/:companyId/ar/quotes/:quoteId/status | updateQuoteStatus | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/quotes/:quoteId | deleteQuote | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/quotes/:quoteId/convert | convertQuote | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/invoices | listInvoices | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/invoices | createInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/invoices/:invoiceId/activity | getInvoiceActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/invoices/:invoiceId | getInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/invoices/:invoiceId | updateInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/invoices/:invoiceId/send | sendInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/invoices/:invoiceId/void | voidInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/payments | listPayments | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/payments | recordPayment | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/payments/:paymentId | updatePayment | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/payments/:paymentId/activity | getCustomerPaymentActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/payments/:paymentId | getPayment | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/payments/:paymentId/apply | applyPayment | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/payments/:paymentId/void | voidPayment | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/revenue-recognition | listRevenueRecognition | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/revenue-recognition | createRevenueRecognition | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/revenue-recognition/:id/recognize | recognizeRevenue | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/deferred-revenue | listDeferredRevenue | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/deferred-revenue | createDeferredRevenue | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/deferred-revenue/:id/recognize | recognizeDeferredRevenue | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/payment-links | listPaymentLinks | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/payment-links | createPaymentLink | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/aging | getAging | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/collections | listCollections | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/collections | createCollection | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/collections/export | exportCollections | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/collections/batch/delete | batchDeleteCollections | Haypbooks/Backend/src/ar/ar.controller.ts |
| PATCH | /api/companies/:companyId/ar/collections/batch/status | batchUpdateCollectionStatus | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/collections/:caseId | getCollection | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/collections/:caseId | updateCollection | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/collections/:caseId | deleteCollection | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/refunds | listRefunds | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/credit-notes | listCreditNotes | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/credit-notes | createCreditNote | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/credit-notes/export | exportCreditNotes | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/credit-notes/batch/delete | batchDeleteCreditNotes | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/credit-notes/:creditNoteId/activity | getCreditNoteActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/credit-notes/:creditNoteId | getCreditNote | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/credit-notes/:creditNoteId/void | voidCreditNote | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/credit-notes/:creditNoteId/apply | applyCreditNote | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/reports/aging | getArAging | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/recurring-invoices | getRecurringInvoices | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/recurring-invoices | createRecurringInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/recurring-invoices/batch/delete | batchDeleteRecurringInvoices | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/recurring-invoices/:id | getRecurringInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/recurring-invoices/:id | updateRecurringInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/recurring-invoices/:id | deleteRecurringInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/recurring-invoices/:id/generate | generateRecurringInvoice | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/write-offs | getWriteOffs | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/write-offs | createWriteOff | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/write-offs/batch/delete | batchDeleteWriteOffs | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/write-offs/:id | getWriteOff | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/write-offs/:id | updateWriteOff | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/write-offs/:id | deleteWriteOff | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/write-offs/:id/approve | approveWriteOff | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/write-offs/:id/reverse | reverseWriteOff | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/sales-orders | getSalesOrders | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/sales-orders | createSalesOrder | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/sales-orders/batch/delete | batchDeleteSalesOrders | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/sales-orders/:id/activity | getSalesOrderActivity | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/sales-orders/:id | getSalesOrder | Haypbooks/Backend/src/ar/ar.controller.ts |
| PUT | /api/companies/:companyId/ar/sales-orders/:id | updateSalesOrder | Haypbooks/Backend/src/ar/ar.controller.ts |
| DELETE | /api/companies/:companyId/ar/sales-orders/:id | deleteSalesOrder | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/sales-orders/:id/convert | convertSalesOrder | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/refunds | createRefund | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/refunds/batch/delete | batchDeleteRefunds | Haypbooks/Backend/src/ar/ar.controller.ts |
| GET | /api/companies/:companyId/ar/refunds/:id | getRefund | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/refunds/:id/process | processRefund | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/dunning/send | sendDunningReminder | Haypbooks/Backend/src/ar/ar.controller.ts |
| POST | /api/companies/:companyId/ar/dunning/batch/send | batchSendDunning | Haypbooks/Backend/src/ar/ar.controller.ts |
| PATCH | /api/companies/:companyId/ar/dunning/:invoiceId/level | updateDunningLevel | Haypbooks/Backend/src/ar/ar.controller.ts |

### Module: attachments

- Controllers: 1
- Endpoint handlers: 4
- Prisma models used: attachment, service
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/attachments | list | Haypbooks/Backend/src/attachments/attachments.controller.ts |
| POST | /api/attachments | create | Haypbooks/Backend/src/attachments/attachments.controller.ts |
| DELETE | /api/attachments/:id | remove | Haypbooks/Backend/src/attachments/attachments.controller.ts |
| PATCH | /api/attachments/:id/public | setPublic | Haypbooks/Backend/src/attachments/attachments.controller.ts |

### Module: auth

- Controllers: 2
- Endpoint handlers: 19
- Prisma models used: company, emailVerificationToken, otp, service, user, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| POST | /api/auth/login | login | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/pre-signup | preSignup | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/complete-signup | completeSignup | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/signup | signup | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/send-verification | sendVerification | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/logout | logout | Haypbooks/Backend/src/auth/auth.controller.ts |
| GET | /api/auth/sessions | listSessions | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/sessions/revoke | revokeSession | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/sessions/revoke-all | revokeAllSessions | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/refresh | refresh | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/forgot-password | forgotPassword | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/verify-otp | verifyOtp | Haypbooks/Backend/src/auth/auth.controller.ts |
| GET | /api/auth/verify-email | verifyEmail | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/reset-password | resetPassword | Haypbooks/Backend/src/auth/auth.controller.ts |
| GET | /api/auth/security-events | getSecurityEvents | Haypbooks/Backend/src/auth/auth.controller.ts |
| POST | /api/auth/email/send-code | sendEmailCode | Haypbooks/Backend/src/auth/verification.controller.ts |
| POST | /api/auth/email/verify-code | verifyEmailCode | Haypbooks/Backend/src/auth/verification.controller.ts |
| POST | /api/auth/phone/send-code | sendPhoneCode | Haypbooks/Backend/src/auth/verification.controller.ts |
| POST | /api/auth/phone/verify-code | verifyPhoneCode | Haypbooks/Backend/src/auth/verification.controller.ts |

### Module: banking

- Controllers: 2
- Endpoint handlers: 47
- Prisma models used: account, auditLog, bankAccount, bankDeposit, bankFeedConnection, bankFeedRule, bankReconciliation, bankReconciliationLine, bankTransaction, check, company, journalEntry, paymentReceived, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/banking/cash-position | getCashPosition | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/accounts | listBankAccounts | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/accounts | createBankAccount | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/accounts/:bankAccountId/activity | getBankAccountActivity | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/accounts/:bankAccountId | getBankAccount | Haypbooks/Backend/src/banking/banking.controller.ts |
| PUT | /api/companies/:companyId/banking/accounts/:bankAccountId | updateBankAccount | Haypbooks/Backend/src/banking/banking.controller.ts |
| DELETE | /api/companies/:companyId/banking/accounts/:bankAccountId | deleteBankAccount | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/accounts/:bankAccountId/transactions | listTransactions | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/accounts/:bankAccountId/transactions/import | importTransactions | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/accounts/:bankAccountId/transactions | createTransaction | Haypbooks/Backend/src/banking/banking.controller.ts |
| PATCH | /api/companies/:companyId/banking/accounts/:bankAccountId/transactions/:transactionId | updateTransaction | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/accounts/:bankAccountId/transactions/:transactionId/split | splitTransaction | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/accounts/:bankAccountId/transactions/batch-categorize | batchCategorize | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/transfers | createTransfer | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/accounts/:bankAccountId/reconciliations | listReconciliations | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/accounts/:bankAccountId/reconciliations | createReconciliation | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/reconciliations/:reconId | getReconciliation | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/reconciliations/:reconId/match | matchTransaction | Haypbooks/Backend/src/banking/banking.controller.ts |
| DELETE | /api/companies/:companyId/banking/reconciliations/:reconId/match/:bankTransactionId | unmatchTransaction | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/reconciliations/:reconId/complete | completeReconciliation | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/reconciliations/:reconId/undo | undoReconciliation | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/reconciliations/:reconId/auto-match | autoMatchReconciliation | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/reconciliations/:reconId/discrepancies | getReconciliationDiscrepancies | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/reconciliations/:reconId/adjustment | addReconciliationAdjustment | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/deposits | listDeposits | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/deposits | createDeposit | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/deposits/:depositId | getDeposit | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/deposits/:depositId/post | postDeposit | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/deposits/:depositId/void | voidDeposit | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/undeposited-funds | listUndepositedFunds | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/smart-rules | listSmartRules | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/smart-rules | createSmartRule | Haypbooks/Backend/src/banking/banking.controller.ts |
| PUT | /api/companies/:companyId/banking/smart-rules/:id | updateSmartRule | Haypbooks/Backend/src/banking/banking.controller.ts |
| DELETE | /api/companies/:companyId/banking/smart-rules/:id | deleteSmartRule | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/feed-connections | listFeedConnections | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/feed-connections | createFeedConnection | Haypbooks/Backend/src/banking/banking.controller.ts |
| PUT | /api/companies/:companyId/banking/feed-connections/:id | updateFeedConnection | Haypbooks/Backend/src/banking/banking.controller.ts |
| DELETE | /api/companies/:companyId/banking/feed-connections/:id | deleteFeedConnection | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/feed-connections/:id/sync | syncFeedConnection | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/feed-status | getFeedStatus | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/credit-cards | listCreditCards | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/credit-cards/:cardId/statements | listCardStatements | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/banking/checks | listChecks | Haypbooks/Backend/src/banking/banking.controller.ts |
| POST | /api/companies/:companyId/banking/checks | createCheck | Haypbooks/Backend/src/banking/banking.controller.ts |
| PATCH | /api/companies/:companyId/banking/checks/:checkId | updateCheck | Haypbooks/Backend/src/banking/banking.controller.ts |
| GET | /api/companies/:companyId/bank-accounts | list | Haypbooks/Backend/src/banking/company-bank-accounts.controller.ts |
| POST | /api/companies/:companyId/bank-accounts | create | Haypbooks/Backend/src/banking/company-bank-accounts.controller.ts |

### Module: companies

- Controllers: 2
- Endpoint handlers: 35
- Prisma models used: account, bankAccount, bill, company, companySettings, country, invoice, journalEntryLine, role, service, subscription, tenant, user, workspace, workspaceInvite, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| POST | /api/companies | create | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies | list | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/recent | recent | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/current | current | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id | get | Haypbooks/Backend/src/companies/company.controller.ts |
| PUT | /api/companies/:id | update | Haypbooks/Backend/src/companies/company.controller.ts |
| DELETE | /api/companies/:id | archive | Haypbooks/Backend/src/companies/company.controller.ts |
| PATCH | /api/companies/:id/last-accessed | patchLastAccessed | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/settings | getSettings | Haypbooks/Backend/src/companies/company.controller.ts |
| PUT | /api/companies/:id/settings | updateSettings | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/users | listUsers | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/workspace-users | listWorkspaceUsers | Haypbooks/Backend/src/companies/company.controller.ts |
| POST | /api/companies/:id/workspace-users | inviteWorkspaceUser | Haypbooks/Backend/src/companies/company.controller.ts |
| POST | /api/companies/:id/users | grantAccess | Haypbooks/Backend/src/companies/company.controller.ts |
| DELETE | /api/companies/:id/users/:targetUserId | revokeAccess | Haypbooks/Backend/src/companies/company.controller.ts |
| PATCH | /api/companies/:id/users/:targetUserId/role | updateUserRole | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/invites | listInvites | Haypbooks/Backend/src/companies/company.controller.ts |
| POST | /api/companies/:id/invites | sendInvite | Haypbooks/Backend/src/companies/company.controller.ts |
| DELETE | /api/companies/:id/invites/:inviteId | cancelInvite | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/roles | listRoles | Haypbooks/Backend/src/companies/company.controller.ts |
| POST | /api/companies/invites/:inviteId/accept | acceptInvite | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/dashboard/summary | getDashboardSummary | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/dashboard/cash-position | getCashPosition | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/dashboard/receivables | getReceivables | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/dashboard/payables | getPayables | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/dashboard/recent-transactions | getRecentTransactions | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/dashboard/upcoming | getUpcomingItems | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/health/metrics | getHealthMetrics | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/health/liquidity | getLiquidity | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/health/profitability | getProfitability | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/health/trends | getHealthTrends | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/overdue/all | getOverdueAll | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/overdue/invoices | getOverdueInvoices | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/companies/:id/overdue/bills | getOverdueBills | Haypbooks/Backend/src/companies/company.controller.ts |
| GET | /api/workspace/capabilities | getCapabilities | Haypbooks/Backend/src/companies/workspace.controller.ts |

### Module: contacts

- Controllers: 1
- Endpoint handlers: 11
- Prisma models used: auditLog, company, customer, service, vendor, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/contacts/customers | findCustomers | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| POST | /api/companies/:companyId/contacts/customers | createCustomer | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| GET | /api/companies/:companyId/contacts/customers/:id | getCustomer | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| PUT | /api/companies/:companyId/contacts/customers/:id | updateCustomer | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| DELETE | /api/companies/:companyId/contacts/customers/:id | deleteCustomer | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| GET | /api/companies/:companyId/contacts/customers/:id/audit-log | getCustomerAuditLog | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| GET | /api/companies/:companyId/contacts/vendors | findVendors | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| POST | /api/companies/:companyId/contacts/vendors | createVendor | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| GET | /api/companies/:companyId/contacts/vendors/:id | getVendor | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| PUT | /api/companies/:companyId/contacts/vendors/:id | updateVendor | Haypbooks/Backend/src/contacts/contacts.controller.ts |
| DELETE | /api/companies/:companyId/contacts/vendors/:id | deleteVendor | Haypbooks/Backend/src/contacts/contacts.controller.ts |

### Module: email-templates

- Controllers: 1
- Endpoint handlers: 5
- Prisma models used: emailTemplate, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/email-templates | list | Haypbooks/Backend/src/email-templates/email-templates.controller.ts |
| GET | /api/companies/:companyId/email-templates/:templateId | get | Haypbooks/Backend/src/email-templates/email-templates.controller.ts |
| POST | /api/companies/:companyId/email-templates | create | Haypbooks/Backend/src/email-templates/email-templates.controller.ts |
| PUT | /api/companies/:companyId/email-templates/:templateId | update | Haypbooks/Backend/src/email-templates/email-templates.controller.ts |
| DELETE | /api/companies/:companyId/email-templates/:templateId | remove | Haypbooks/Backend/src/email-templates/email-templates.controller.ts |

### Module: expenses

- Controllers: 1
- Endpoint handlers: 6
- Prisma models used: (none detected)
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/vendors | listVendors | Haypbooks/Backend/src/expenses/expenses.controller.ts |
| POST | /api/companies/:companyId/vendors | createVendor | Haypbooks/Backend/src/expenses/expenses.controller.ts |
| GET | /api/companies/:companyId/bills | listBills | Haypbooks/Backend/src/expenses/expenses.controller.ts |
| POST | /api/companies/:companyId/bills | createBill | Haypbooks/Backend/src/expenses/expenses.controller.ts |
| GET | /api/companies/:companyId/bill-payments | listBillPayments | Haypbooks/Backend/src/expenses/expenses.controller.ts |
| POST | /api/companies/:companyId/bill-payments | recordBillPayment | Haypbooks/Backend/src/expenses/expenses.controller.ts |

### Module: financial-services

- Controllers: 1
- Endpoint handlers: 12
- Prisma models used: bankAccount, bankTransaction, businessLoan, cashFlowForecast, company, creditLine, revenueSchedule, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/financial-services/revenue-forecast | getRevenueForecast | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/cash-flow | getCashFlow | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/loans | getLoans | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/credit-lines | getCreditLines | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/investments | getInvestments | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/bank-accounts | getBankAccounts | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/transactions | getTransactions | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/checking-account | getCheckingAccount | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/savings-accounts | getSavingsAccounts | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/merchant-services | getMerchantServices | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/cash-runway | getCashRunway | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |
| GET | /api/companies/:companyId/financial-services/credit-score | getCreditScore | Haypbooks/Backend/src/financial-services/financial-services.controller.ts |

### Module: general-ledger

- Controllers: 1
- Endpoint handlers: 3
- Prisma models used: account, journalEntry, journalEntryLine, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/general-ledger | getGlEntries | Haypbooks/Backend/src/general-ledger/general-ledger.controller.ts |
| GET | /api/companies/:companyId/general-ledger/summary | getGlSummary | Haypbooks/Backend/src/general-ledger/general-ledger.controller.ts |
| GET | /api/companies/:companyId/general-ledger/account-list | getAccountList | Haypbooks/Backend/src/general-ledger/general-ledger.controller.ts |

### Module: health

- Controllers: 1
- Endpoint handlers: 3
- Prisma models used: (none detected)
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/health/live | live | Haypbooks/Backend/src/health/health.controller.ts |
| GET | /api/health/ready | ready | Haypbooks/Backend/src/health/health.controller.ts |
| GET | /api/health | health | Haypbooks/Backend/src/health/health.controller.ts |

### Module: integrations

- Controllers: 1
- Endpoint handlers: 11
- Prisma models used: aiInsight, apiKey, auditLog, bankFeedConnection, bankFeedImport, bill, company, invoice, paymentReceived, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/integrations/ai/insights | listInsights | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| POST | /api/companies/:companyId/integrations/ai/insights/generate | generateInsights | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| GET | /api/companies/:companyId/integrations/ai/insights/:insightId | getInsight | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| POST | /api/companies/:companyId/integrations/ai/insights/:insightId/dismiss | dismissInsight | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| POST | /api/companies/:companyId/integrations/ai/insights/:insightId/resolve | resolveInsight | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| GET | /api/companies/:companyId/integrations/audit-logs | listAuditLogs | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| GET | /api/companies/:companyId/integrations/api-keys | listApiKeys | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| POST | /api/companies/:companyId/integrations/api-keys | createApiKey | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| DELETE | /api/companies/:companyId/integrations/api-keys/:keyId | revokeApiKey | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| GET | /api/companies/:companyId/integrations/bank-feed/connections | listBankFeedConnections | Haypbooks/Backend/src/integrations/integrations.controller.ts |
| GET | /api/companies/:companyId/integrations/bank-feed/imports | listBankFeedImports | Haypbooks/Backend/src/integrations/integrations.controller.ts |

### Module: inventory

- Controllers: 1
- Endpoint handlers: 42
- Prisma models used: auditLog, backOrder, binLocation, company, fixedAsset, fixedAssetCategory, fixedAssetDepreciation, inventoryTransaction, invoiceLine, item, lotSerialNumber, priceListEntry, priceListItem, quoteLine, reorderRule, service, stockCount, stockLevel, stockLocation, unitOfMeasure, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/inventory/stock | getStockSummary | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/items | listItems | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/items | createItem | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/items/export | exportItems | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/items/categories | listItemCategories | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/items/batch/delete | batchDeleteItems | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PATCH | /api/companies/:companyId/inventory/items/batch/status | batchUpdateItemStatus | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/items/:itemId/activity | getItemActivity | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/items/:itemId | getItem | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PUT | /api/companies/:companyId/inventory/items/:itemId | updateItem | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| DELETE | /api/companies/:companyId/inventory/items/:itemId | deleteItem | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/locations | listLocations | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/locations | createLocation | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PUT | /api/companies/:companyId/inventory/locations/:id | updateLocation | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| DELETE | /api/companies/:companyId/inventory/locations/:id | deleteLocation | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/transactions | listTransactions | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/transactions | createTransaction | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/assets | listFixedAssets | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/assets | createFixedAsset | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/assets/:assetId | getFixedAsset | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/assets/:assetId/schedule | getDepreciationSchedule | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/assets/:assetId/depreciate | runDepreciation | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/assets/:assetId/dispose | disposeAsset | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PUT | /api/companies/:companyId/inventory/assets/:assetId | updateFixedAsset | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/asset-categories | listAssetCategories | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/asset-categories | createAssetCategory | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PUT | /api/companies/:companyId/inventory/asset-categories/:id | updateAssetCategory | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| DELETE | /api/companies/:companyId/inventory/asset-categories/:id | deleteAssetCategory | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/units-of-measure | listUOM | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/units-of-measure | createUOM | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PUT | /api/companies/:companyId/inventory/units-of-measure/:id | updateUOM | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/bin-locations | listBinLocations | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/bin-locations | createBinLocation | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/physical-counts | listPhysicalCounts | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/physical-counts | createPhysicalCount | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/physical-counts/:countId | getPhysicalCount | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/reorder-rules | listReorderRules | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/reorder-rules | createReorderRule | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| PUT | /api/companies/:companyId/inventory/reorder-rules/:id | updateReorderRule | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/backorders | listBackorders | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| GET | /api/companies/:companyId/inventory/lot-serial | listLotSerial | Haypbooks/Backend/src/inventory/inventory.controller.ts |
| POST | /api/companies/:companyId/inventory/lot-serial | createLotSerial | Haypbooks/Backend/src/inventory/inventory.controller.ts |

### Module: onboarding

- Controllers: 1
- Endpoint handlers: 3
- Prisma models used: company, practice, service, workspace, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| POST | /api/onboarding/save | saveStep | Haypbooks/Backend/src/onboarding/onboarding.controller.ts |
| GET | /api/onboarding/save | loadProgress | Haypbooks/Backend/src/onboarding/onboarding.controller.ts |
| POST | /api/onboarding/complete | complete | Haypbooks/Backend/src/onboarding/onboarding.controller.ts |

### Module: organization

- Controllers: 1
- Endpoint handlers: 20
- Prisma models used: company, consolidationGroup, filingCalendar, intercompanyTransaction, legalEntity, location, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/organization/legal-entities | listLegalEntities | Haypbooks/Backend/src/organization/organization.controller.ts |
| POST | /api/companies/:companyId/organization/legal-entities | createLegalEntity | Haypbooks/Backend/src/organization/organization.controller.ts |
| PUT | /api/companies/:companyId/organization/legal-entities/:id | updateLegalEntity | Haypbooks/Backend/src/organization/organization.controller.ts |
| DELETE | /api/companies/:companyId/organization/legal-entities/:id | deleteLegalEntity | Haypbooks/Backend/src/organization/organization.controller.ts |
| GET | /api/companies/:companyId/organization/consolidation | listConsolidationGroups | Haypbooks/Backend/src/organization/organization.controller.ts |
| POST | /api/companies/:companyId/organization/consolidation | createConsolidationGroup | Haypbooks/Backend/src/organization/organization.controller.ts |
| GET | /api/companies/:companyId/organization/intercompany | listIntercompanyTransactions | Haypbooks/Backend/src/organization/organization.controller.ts |
| POST | /api/companies/:companyId/organization/intercompany | createIntercompanyTransaction | Haypbooks/Backend/src/organization/organization.controller.ts |
| GET | /api/companies/:companyId/organization/departments | listDepartments | Haypbooks/Backend/src/organization/organization.controller.ts |
| POST | /api/companies/:companyId/organization/departments | createDepartment | Haypbooks/Backend/src/organization/organization.controller.ts |
| PUT | /api/companies/:companyId/organization/departments/:id | updateDepartment | Haypbooks/Backend/src/organization/organization.controller.ts |
| DELETE | /api/companies/:companyId/organization/departments/:id | deleteDepartment | Haypbooks/Backend/src/organization/organization.controller.ts |
| GET | /api/companies/:companyId/organization/locations | listLocations | Haypbooks/Backend/src/organization/organization.controller.ts |
| POST | /api/companies/:companyId/organization/locations | createLocation | Haypbooks/Backend/src/organization/organization.controller.ts |
| PUT | /api/companies/:companyId/organization/locations/:id | updateLocation | Haypbooks/Backend/src/organization/organization.controller.ts |
| DELETE | /api/companies/:companyId/organization/locations/:id | deleteLocation | Haypbooks/Backend/src/organization/organization.controller.ts |
| GET | /api/companies/:companyId/organization/filing-calendar | listFilingCalendars | Haypbooks/Backend/src/organization/organization.controller.ts |
| POST | /api/companies/:companyId/organization/filing-calendar | createFilingCalendar | Haypbooks/Backend/src/organization/organization.controller.ts |
| PUT | /api/companies/:companyId/organization/filing-calendar/:id | updateFilingCalendar | Haypbooks/Backend/src/organization/organization.controller.ts |
| DELETE | /api/companies/:companyId/organization/filing-calendar/:id | deleteFilingCalendar | Haypbooks/Backend/src/organization/organization.controller.ts |

### Module: owner

- Controllers: 1
- Endpoint handlers: 3
- Prisma models used: (none detected)
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/owner/dashboard | getDashboard | Haypbooks/Backend/src/owner/owner.controller.ts |
| GET | /api/owner/cash-position | getCashPosition | Haypbooks/Backend/src/owner/owner.controller.ts |
| GET | /api/owner/financial-summary | getFinancialSummary | Haypbooks/Backend/src/owner/owner.controller.ts |

### Module: payroll

- Controllers: 1
- Endpoint handlers: 37
- Prisma models used: benefitPlan, employee, employeeLoan, governmentRemittance, paycheck, payrollDeduction, payrollRun, salaryStructure, salaryStructureComponent, service, shiftSchedule, timeOffBalance, timeOffRequest, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/payroll/summary | getSummary | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/employees | listEmployees | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/employees | createEmployee | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/employees/:employeeId | getEmployee | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| PUT | /api/companies/:companyId/payroll/employees/:employeeId | updateEmployee | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/employees/:employeeId/terminate | terminateEmployee | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/runs | listRuns | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/runs | createRun | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/runs/:runId | getRun | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/runs/:runId/process | processRun | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/runs/:runId/post | postRun | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/runs/:runId/void | voidRun | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/paychecks | listPaychecks | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/paychecks/:paycheckId | getPaycheck | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/loans | listLoans | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/loans | createLoan | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/salary-structures | listSalaryStructures | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/salary-structures | createSalaryStructure | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| PUT | /api/companies/:companyId/payroll/salary-structures/:id | updateSalaryStructure | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/benefit-plans | listBenefitPlans | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/benefit-plans | createBenefitPlan | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| PUT | /api/companies/:companyId/payroll/benefit-plans/:id | updateBenefitPlan | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/deductions | listDeductions | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/deductions | createDeduction | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/leave-requests | listLeaveRequests | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/leave-requests | createLeaveRequest | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| PATCH | /api/companies/:companyId/payroll/leave-requests/:id/approve | approveLeaveRequest | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| PATCH | /api/companies/:companyId/payroll/leave-requests/:id/reject | rejectLeaveRequest | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/leave-balances | listLeaveBalances | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/government-contributions | listGovernmentContributions | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/government-contributions | createGovernmentContribution | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/shift-schedules | listShiftSchedules | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/shift-schedules | createShiftSchedule | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| GET | /api/companies/:companyId/payroll/allowances | listAllowances | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| POST | /api/companies/:companyId/payroll/allowances | createAllowance | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| PUT | /api/companies/:companyId/payroll/allowances/:id | updateAllowance | Haypbooks/Backend/src/payroll/payroll.controller.ts |
| DELETE | /api/companies/:companyId/payroll/allowances/:id | deleteAllowance | Haypbooks/Backend/src/payroll/payroll.controller.ts |

### Module: practice

- Controllers: 1
- Endpoint handlers: 3
- Prisma models used: companyFirmAccess, practice, practiceUser, service, workspace
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| POST | /api/practices | createPractice | Haypbooks/Backend/src/practice/practice.controller.ts |
| GET | /api/practices/dashboard | getDashboard | Haypbooks/Backend/src/practice/practice.controller.ts |
| GET | /api/practices/clients | getClients | Haypbooks/Backend/src/practice/practice.controller.ts |

### Module: practice-hub

- Controllers: 1
- Endpoint handlers: 5
- Prisma models used: engagement, practice, practiceCalendar, service, task
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/practice-hub/dashboard | getDashboard | Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts |
| GET | /api/practice-hub/stats | getStats | Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts |
| GET | /api/practice-hub/activity | getActivity | Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts |
| GET | /api/practice-hub/deadlines | getDeadlines | Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts |
| GET | /api/practice-hub/clients | getClients | Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts |

### Module: projects

- Controllers: 1
- Endpoint handlers: 35
- Prisma models used: company, project, projectBilling, projectRetainer, projectTask, resourceAllocation, service
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/projects | listProjects | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects | createProject | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/wip | getWip | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId | getProject | Haypbooks/Backend/src/projects/projects.controller.ts |
| PUT | /api/companies/:companyId/projects/:projectId | updateProject | Haypbooks/Backend/src/projects/projects.controller.ts |
| DELETE | /api/companies/:companyId/projects/:projectId | deleteProject | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/milestones | listMilestones | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects/:projectId/milestones | createMilestone | Haypbooks/Backend/src/projects/projects.controller.ts |
| PATCH | /api/companies/:companyId/projects/:projectId/milestones/:milestoneId | updateMilestone | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/budget | getProjectBudget | Haypbooks/Backend/src/projects/projects.controller.ts |
| PUT | /api/companies/:companyId/projects/:projectId/budget | updateProjectBudget | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/tasks | listProjectTasks | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects/:projectId/tasks | createProjectTask | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/time-entries | listProjectTimeEntries | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects/:projectId/time-entries | createProjectTimeEntry | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/expenses | listProjectExpenses | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects/:projectId/expenses | createProjectExpense | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/profitability | getProjectProfitability | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/:projectId/wip | getProjectWip | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/retainers | listAllRetainers | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects/retainers | createFlatRetainer | Haypbooks/Backend/src/projects/projects.controller.ts |
| PUT | /api/companies/:companyId/projects/retainers/:id | updateFlatRetainer | Haypbooks/Backend/src/projects/projects.controller.ts |
| DELETE | /api/companies/:companyId/projects/retainers/:id | deleteFlatRetainer | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects/resource-plans | listResourcePlans | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects/resource-plans | createResourcePlan | Haypbooks/Backend/src/projects/projects.controller.ts |
| PUT | /api/companies/:companyId/projects/resource-plans/:id | updateResourcePlan | Haypbooks/Backend/src/projects/projects.controller.ts |
| DELETE | /api/companies/:companyId/projects/resource-plans/:id | deleteResourcePlan | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects | listChangeOrders | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects | createChangeOrder | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects | listRetainers | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects | createRetainer | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects | listBilling | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects | createBilling | Haypbooks/Backend/src/projects/projects.controller.ts |
| GET | /api/companies/:companyId/projects | listResources | Haypbooks/Backend/src/projects/projects.controller.ts |
| POST | /api/companies/:companyId/projects | createResource | Haypbooks/Backend/src/projects/projects.controller.ts |

### Module: reporting

- Controllers: 1
- Endpoint handlers: 14
- Prisma models used: account, bill, budget, company, contact, customer, employee, financialStatementSnapshot, invoice, kpiDashboard, service, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/reports/kpis | getQuickKpis | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/profit-and-loss | getProfitAndLoss | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/balance-sheet | getBalanceSheet | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/cash-flow | getCashFlow | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/trial-balance | getTrialBalance | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/snapshots | listSnapshots | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| POST | /api/companies/:companyId/reports/snapshots | saveSnapshot | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/budgets | listBudgets | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| POST | /api/companies/:companyId/reports/budgets | createBudget | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/budgets/:budgetId | getBudget | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/budgets/:budgetId/vs-actual | getBudgetVsActual | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/dashboards | listDashboards | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| POST | /api/companies/:companyId/reports/dashboards | createDashboard | Haypbooks/Backend/src/reporting/reporting.controller.ts |
| GET | /api/companies/:companyId/reports/esg | getEsgMetrics | Haypbooks/Backend/src/reporting/reporting.controller.ts |

### Module: sales

- Controllers: 1
- Endpoint handlers: 30
- Prisma models used: (none detected)
- Status signal: has stub/mock signal

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/customers | listCustomers | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/customers | createCustomer | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/customers/:contactId | getCustomer | Haypbooks/Backend/src/sales/sales.controller.ts |
| PUT | /api/companies/:companyId/customers/:contactId | updateCustomer | Haypbooks/Backend/src/sales/sales.controller.ts |
| DELETE | /api/companies/:companyId/customers/:contactId | deleteCustomer | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/payment-terms | listPaymentTerms | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/subscriptions | listSubscriptions | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/revenue-recognition | listRevenueRecognition | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/revenue-recognition | createRevenueRecognition | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/revenue-recognition/:id/recognize | recognizeRevenue | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/deferred-revenue | listDeferredRevenue | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/deferred-revenue | createDeferredRevenue | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/deferred-revenue/:id/recognize | recognizeDeferredRevenue | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/payment-links | listPaymentLinks | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/payment-links | createPaymentLink | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/invoices | listInvoices | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/invoices | createInvoice | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/invoices/:invoiceId | getInvoice | Haypbooks/Backend/src/sales/sales.controller.ts |
| PUT | /api/companies/:companyId/invoices/:invoiceId | updateInvoice | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/invoices/:invoiceId/send | sendInvoice | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/invoices/:invoiceId/void | voidInvoice | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/quotes | listQuotes | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/quotes | createQuote | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/quotes/:quoteId | getQuote | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/quotes/:quoteId/convert | convertQuote | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/payments | listPayments | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/payments | recordPayment | Haypbooks/Backend/src/sales/sales.controller.ts |
| PUT | /api/companies/:companyId/payments/:paymentId | updatePayment | Haypbooks/Backend/src/sales/sales.controller.ts |
| GET | /api/companies/:companyId/payments/:paymentId | getPayment | Haypbooks/Backend/src/sales/sales.controller.ts |
| POST | /api/companies/:companyId/payments/:paymentId/void | voidPayment | Haypbooks/Backend/src/sales/sales.controller.ts |

### Module: tasks

- Controllers: 1
- Endpoint handlers: 5
- Prisma models used: service, task, taskComment
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| POST | /api/tasks | create | Haypbooks/Backend/src/tasks/tasks.controller.ts |
| GET | /api/tasks | list | Haypbooks/Backend/src/tasks/tasks.controller.ts |
| GET | /api/tasks/:id | get | Haypbooks/Backend/src/tasks/tasks.controller.ts |
| PATCH | /api/tasks/:id | update | Haypbooks/Backend/src/tasks/tasks.controller.ts |
| POST | /api/tasks/:id/comments | comment | Haypbooks/Backend/src/tasks/tasks.controller.ts |

### Module: tax

- Controllers: 1
- Endpoint handlers: 49
- Prisma models used: account, alphalistEntry, closingEntry, company, country, deferredTax, form2307, governmentRemittance, journalEntryLine, lineTax, salesTaxReturn, service, taxAuthority, taxCalculationAudit, taxCode, taxFilingBatch, taxFilingPackage, taxIncentive, taxJurisdiction, taxObligation, taxPayment, taxRate, taxReturn, transferPricingDocument, vatTransaction, withholdingTaxCertificate, withholdingTaxDeduction, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/summary | getTaxSummary | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/codes | listTaxCodes | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/codes | createTaxCode | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/rates | listTaxRates | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/rates | createTaxRate | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/vat-returns | listVatReturns | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/vat-returns | createVatReturn | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/vat-returns/:returnId | getVatReturn | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/vat-returns/:returnId/file | fileVatReturn | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/withholding | listWithholding | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/withholding | createWithholding | Haypbooks/Backend/src/tax/tax.controller.ts |
| PUT | /api/withholding/:id | updateWithholding | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/form-2307 | listForm2307s | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/form-2307 | createForm2307 | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/form-2307/:formId | getForm2307 | Haypbooks/Backend/src/tax/tax.controller.ts |
| PATCH | /api/form-2307/:formId/status | updateForm2307Status | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/alphalist | getAlphalist | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/alphalist/generate | generateAlphalist | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/bir-forms | listBirForms | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/bir-forms | generateBirForm | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/bir-forms/:formType | getBirForm | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/percentage-tax | listPercentageTax | Haypbooks/Backend/src/tax/tax.controller.ts |
| POST | /api/percentage-tax | createPercentageTax | Haypbooks/Backend/src/tax/tax.controller.ts |
| PUT | /api/percentage-tax/:id | updatePercentageTax | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/calendar | getTaxCalendar | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/filing-batch | getFilingBatch | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/zero-rated-exempt | getZeroRatedExempt | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/output-tax-ledger | getOutputTaxLedger | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/creditable-withholding | getCreditableWithholding | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/reconciliation | getTaxReconciliation | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/expanded-withholding | getExpandedWithholding | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/income-tax | getIncomeTax | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/deferred-tax | getDeferredTax | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/transfer-pricing | getTransferPricing | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/multi-jurisdiction | getMultiJurisdiction | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/year-end/adjustments | getYearEndAdjustments | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/year-end/closing-entries | getYearEndClosingEntries | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/year-end/annual-summary | getAnnualTaxSummary | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/liability | getTaxLiability | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/audit-trail | getTaxAuditTrail | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/remittances | getRemittances | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/filing-history | getFilingHistory | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/e-filing | getEFiling | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/payments | getTaxPayments | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/tax-returns | getTaxReturns | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/agencies | getTaxAgencies | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/jurisdictions | getTaxJurisdictions | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/exemptions | getTaxExemptions | Haypbooks/Backend/src/tax/tax.controller.ts |
| GET | /api/withholding-setup | getWithholdingSetup | Haypbooks/Backend/src/tax/tax.controller.ts |

### Module: tenants

- Controllers: 1
- Endpoint handlers: 9
- Prisma models used: practice, role, service, user, workspace, workspaceInvite, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/tenants | listTenants | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| GET | /api/tenants/clients | listClients | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| POST | /api/tenants/practices | createPractice | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| POST | /api/tenants/:tenantId/invites | createInvite | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| GET | /api/tenants/invites/pending | getPendingInvites | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| POST | /api/tenants/invites/:inviteId/decline | declineInvite | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| POST | /api/tenants/:tenantId/invites/:inviteId/cancel | cancelInvite | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| GET | /api/tenants/:id | getTenant | Haypbooks/Backend/src/tenants/tenants.controller.ts |
| POST | /api/tenants/:tenantId/access | updateLastAccessed | Haypbooks/Backend/src/tenants/tenants.controller.ts |

### Module: test

- Controllers: 1
- Endpoint handlers: 22
- Prisma models used: account, company, journalEntry, otp, role, service, session, user, workspace, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/test/otp/latest | latestOtp | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/create-otp | unknownHandler | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/create-otps | createOtps | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/force-complete-signup | forceCompleteSignup | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/force-verify-user | forceVerifyUser | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/force-complete-onboarding | forceCompleteOnboarding | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/force-run-onboarding | forceRunOnboarding | Haypbooks/Backend/src/test/test.controller.ts |
| GET | /api/test/user | getUser | Haypbooks/Backend/src/test/test.controller.ts |
| GET | /api/test/journal-entries | getJournalEntries | Haypbooks/Backend/src/test/test.controller.ts |
| GET | /api/test/check-user-verification | checkUserVerification | Haypbooks/Backend/src/test/test.controller.ts |
| GET | /api/test/users | listUsers | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/create-user | createUser | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/create-new-workspace | createNewWorkspace | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/set-trial | setTrial | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/update-user | updateUser | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/echo-headers | echoHeaders | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/session/find-by-refresh | findSessionByRefresh | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/debug/refresh | debugRefresh | Haypbooks/Backend/src/test/test.controller.ts |
| GET | /api/test/sessions | listSessions | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/create-company | createCompany | Haypbooks/Backend/src/test/test.controller.ts |
| POST | /api/test/delete-company | deleteCompany | Haypbooks/Backend/src/test/test.controller.ts |
| GET | /api/test/companies | listCompaniesForUser | Haypbooks/Backend/src/test/test.controller.ts |

### Module: time

- Controllers: 1
- Endpoint handlers: 23
- Prisma models used: service
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/companies/:companyId/time/entries | listTimeEntries | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/entries | createTimeEntry | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time/entries/:entryId | getTimeEntry | Haypbooks/Backend/src/time/time.controller.ts |
| PUT | /api/companies/:companyId/time/entries/:entryId | updateTimeEntry | Haypbooks/Backend/src/time/time.controller.ts |
| DELETE | /api/companies/:companyId/time/entries/:entryId | deleteTimeEntry | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time/timesheets | listTimesheets | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/timesheets | createTimesheet | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time/timesheets/:timesheetId | getTimesheet | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/timesheets/:timesheetId/approve | approveTimesheet | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/timesheets/:timesheetId/reject | rejectTimesheet | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/timer/start | startTimer | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/timer/stop | stopTimer | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time/timer/sessions | getTimerSessions | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time/billable | getBillableSummary | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time/utilization | getUtilization | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time | list | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time | create | Haypbooks/Backend/src/time/time.controller.ts |
| PUT | /api/companies/:companyId/time/:entryId | update | Haypbooks/Backend/src/time/time.controller.ts |
| DELETE | /api/companies/:companyId/time/:entryId | remove | Haypbooks/Backend/src/time/time.controller.ts |
| GET | /api/companies/:companyId/time | list | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time | create | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/:timesheetId/approve | approve | Haypbooks/Backend/src/time/time.controller.ts |
| POST | /api/companies/:companyId/time/:timesheetId/reject | reject | Haypbooks/Backend/src/time/time.controller.ts |

### Module: users

- Controllers: 1
- Endpoint handlers: 5
- Prisma models used: company, onboardingData, practice, service, workspace, workspaceUser
- Status signal: real

| Method | Path | Handler | Controller |
| --- | --- | --- | --- |
| GET | /api/users/me | getProfile | Haypbooks/Backend/src/users/users.controller.ts |
| PATCH | /api/users/preferred-hub | setPreferredHub | Haypbooks/Backend/src/users/users.controller.ts |
| PATCH | /api/users/phone | updatePhone | Haypbooks/Backend/src/users/users.controller.ts |
| PATCH | /api/users/profile | updateProfile | Haypbooks/Backend/src/users/users.controller.ts |
| POST | /api/users/preferred-workspace | setPreferredWorkspace | Haypbooks/Backend/src/users/users.controller.ts |

## 4) Every Prisma Model (`Backend/prisma/schema.prisma`)

| Model | KeyRelationships | BackendRefs | FrontendRefs | Usage |
| --- | --- | --- | --- | --- |
| Account | Account, AccountBalanceAudit, AccountSegment, AccountSettings, AccountSubType, AccountType, AccrualSchedule, BankRule, BillLine, BudgetActualComparison, BudgetLine, BudgetLineVersion, CashFlowCategory, CashOverShortEntry, CashOverShortRule, Company, CurrencyRevaluationEntry, CurrencyRevaluationLine, CustomerCreditLine, DefaultAccountMapping, DeferredTax, DepreciationAccount, EquityAccount, ExpenseClaimLine, ExpenseSubCategoryConfig, FinalTaxDeduction, FixedAsset, Item, JournalEntryLine, OpeningBalance, PayrollAccrual, PayrollDeduction, PayrollTaxLiability, PercentageTax, PettyCashFund, PettyCashVoucher, ProductionRun, SubsidiaryLedger, TaxCodeAccount, VendorCreditLine, WithholdingTaxDeduction, WriteOff, YearEndClose | 25 | 190 | used |
| AccountBalance | Company | 0 | 0 | unused-or-very-low-usage |
| AccountBalanceAudit | Account, Company | 0 | 0 | unused-or-very-low-usage |
| AccountingFirm | AccountingFirmSubscription, CompanyFirmAccess, FirmData, Workspace | 3 | 0 | used |
| AccountingFirmSubscription | AccountingFirm, Plan | 0 | 0 | unused-or-very-low-usage |
| AccountingPeriod | Workspace | 1 | 0 | used |
| AccountingValidation | ApprovalRequest, Company | 0 | 0 | unused-or-very-low-usage |
| AccountSegment | Account, Company, Fund | 0 | 0 | unused-or-very-low-usage |
| AccountSettings | Account | 0 | 0 | unused-or-very-low-usage |
| AccountSubType | Account, Company | 4 | 0 | used |
| AccountType | Account | 3 | 16 | used |
| AccrualEntry | AccrualSchedule, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| AccrualSchedule | Account, AccrualEntry, Company | 0 | 0 | unused-or-very-low-usage |
| AdminActionApproval | User | 0 | 0 | unused-or-very-low-usage |
| AdminAuditLog | User | 0 | 0 | unused-or-very-low-usage |
| AdminIpWhitelist | User | 0 | 0 | unused-or-very-low-usage |
| AdminNotification | User | 0 | 0 | unused-or-very-low-usage |
| AdminSession | User | 0 | 0 | unused-or-very-low-usage |
| AdvancePricingAgreement | Company, TaxAuthority | 0 | 0 | unused-or-very-low-usage |
| AiAgent | AiAgentTask, AiModel, Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| AiAgentTask | AiAgent | 0 | 0 | unused-or-very-low-usage |
| AiAuditLog | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| AiChatMessage | AiChatSession | 0 | 0 | unused-or-very-low-usage |
| AiChatSession | AiChatMessage, Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| AiGovernanceRule | AiGovernanceTrigger, Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| AiGovernanceTrigger | AiGovernanceRule | 0 | 0 | unused-or-very-low-usage |
| AiInsight | AiInsightAttachment, AiInsightComment, AiInsightMetric, AiModel, Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| AiInsightAttachment | AiInsight | 0 | 0 | unused-or-very-low-usage |
| AiInsightComment | AiInsight, User | 0 | 0 | unused-or-very-low-usage |
| AiInsightMetric | AiInsight | 0 | 0 | unused-or-very-low-usage |
| AiModel | AiAgent, AiInsight, AiModelRun, Company, Prediction, Workspace | 0 | 0 | unused-or-very-low-usage |
| AiModelRun | AiModel | 0 | 0 | unused-or-very-low-usage |
| AiQueryLog | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| AlphalistEntry | Company | 0 | 0 | unused-or-very-low-usage |
| ApiKey | ExternalSystemAccessLog, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| ApiRateLimit | (none) | 0 | 0 | unused-or-very-low-usage |
| ApiTokenRevocation | (none) | 0 | 0 | unused-or-very-low-usage |
| Approval | Workspace | 0 | 24 | unused-or-very-low-usage |
| ApprovalRequest | AccountingValidation, ApprovalWorkflow, Bill, PurchaseOrder, User, UserSecurityEvent | 0 | 0 | unused-or-very-low-usage |
| ApprovalThreshold | Company | 0 | 0 | unused-or-very-low-usage |
| ApprovalWorkflow | ApprovalRequest, ConsolidationGroupMember, Workspace | 0 | 0 | unused-or-very-low-usage |
| ArchiveJob | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| AssemblyBuild | AssemblyComponent, Company, Item | 0 | 0 | unused-or-very-low-usage |
| AssemblyComponent | AssemblyBuild, Item | 0 | 0 | unused-or-very-low-usage |
| AssetDisposal | Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| AssetImpairment | Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| AssetInsurance | Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| AssetMaintenance | Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| AssetRevaluation | Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| Attachment | BirFormSubmission, GrantReport, TaxReturn, TransferPricingDocument, User, Workspace | 0 | 2 | unused-or-very-low-usage |
| AuditLog | AuditLogLine, Company, Practice, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| AuditLogLine | AuditLog | 0 | 0 | unused-or-very-low-usage |
| BackOrder | Company | 0 | 0 | unused-or-very-low-usage |
| BankAccount | BankDeposit, BankFeedAccount, BankReconciliation, BankTransaction, BankTransactionRaw, BankTransfer, BillPayment, CashOverShortRule, Check, CustomerRefund, PaymentReceived, UndepositedFundsBatch, VendorRefund, Workspace | 5 | 5 | used |
| BankDeposit | BankAccount, BankDepositLine, CashOverShortEntry, Company, DepositSlip, JournalEntry, Workspace | 2 | 5 | used |
| BankDepositLine | BankDeposit, PaymentReceived | 0 | 0 | unused-or-very-low-usage |
| BankFeedAccount | BankAccount, BankFeedConnection, BankTransactionRaw, Company | 0 | 0 | unused-or-very-low-usage |
| BankFeedConnection | BankFeedAccount, BankFeedImport, Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| BankFeedImport | BankFeedConnection, BankTransactionRaw, Company | 0 | 0 | unused-or-very-low-usage |
| BankFeedRule | Company | 1 | 0 | used |
| BankReconciliation | BankAccount, BankReconciliationLine, Workspace | 2 | 0 | used |
| BankReconciliationLine | BankReconciliation, BankTransaction, JournalEntryLine, Workspace | 8 | 0 | used |
| BankRule | Account, ConsolidationGroupMember, Workspace | 0 | 0 | unused-or-very-low-usage |
| BankTransaction | BankAccount, BankReconciliationLine, BankTransactionRaw, BankTransactionSplit, Workspace | 1 | 10 | used |
| BankTransactionRaw | BankAccount, BankFeedAccount, BankFeedImport, BankTransaction, Company | 0 | 0 | unused-or-very-low-usage |
| BankTransactionSplit | BankTransaction, Workspace | 0 | 0 | unused-or-very-low-usage |
| BankTransfer | BankAccount, Workspace | 0 | 0 | unused-or-very-low-usage |
| BenefitEnrollment | BenefitPlan | 0 | 0 | unused-or-very-low-usage |
| BenefitPlan | BenefitEnrollment, Company | 0 | 0 | unused-or-very-low-usage |
| Bill | ApprovalRequest, BillLine, BillPayment, BillPaymentApplication, Company, DebitNote, JournalEntry, PaymentTerm, RetentionSchedule, User, Vendor, Workspace, WriteOff | 26 | 59 | used |
| BillLine | Account, Bill, Class, Company, Item, LineTax, Location, Project, Workspace | 0 | 0 | unused-or-very-low-usage |
| BillPayment | BankAccount, Bill, BillPaymentApplication, Check, Company, ContractorPayment, JournalEntry, User, VendorPaymentMethod, VendorRefund, Workspace | 2 | 2 | used |
| BillPaymentApplication | Bill, BillPayment, Workspace | 3 | 0 | used |
| BinLocation | StockLocation | 0 | 0 | unused-or-very-low-usage |
| BirFormSubmission | Attachment, BirFormTemplate, Company | 0 | 0 | unused-or-very-low-usage |
| BirFormTemplate | BirFormSubmission, Country | 0 | 0 | unused-or-very-low-usage |
| Budget | BudgetActualComparison, BudgetLine, BudgetVersion, Workspace | 5 | 6 | used |
| BudgetActualComparison | Account, Budget, Company | 0 | 0 | unused-or-very-low-usage |
| BudgetLine | Account, Budget, Class, Workspace | 0 | 0 | unused-or-very-low-usage |
| BudgetLineVersion | Account, BudgetVersion, Class | 0 | 0 | unused-or-very-low-usage |
| BudgetVersion | Budget, BudgetLineVersion, Workspace | 0 | 0 | unused-or-very-low-usage |
| BusinessLoan | BusinessLoanPayment, Company | 0 | 0 | unused-or-very-low-usage |
| BusinessLoanPayment | BusinessLoan | 0 | 0 | unused-or-very-low-usage |
| BusinessPermit | Company | 0 | 0 | unused-or-very-low-usage |
| CalendarAttendee | PracticeCalendar, User | 0 | 0 | unused-or-very-low-usage |
| Campaign | Company | 0 | 0 | unused-or-very-low-usage |
| CashFlowCategory | Account, Company | 0 | 0 | unused-or-very-low-usage |
| CashFlowForecast | CashFlowForecastItem, CashFlowForecastLine, Company | 0 | 0 | unused-or-very-low-usage |
| CashFlowForecastItem | CashFlowForecast | 0 | 0 | unused-or-very-low-usage |
| CashFlowForecastLine | CashFlowForecast | 0 | 0 | unused-or-very-low-usage |
| CashFlowStatementSnapshot | Company | 0 | 0 | unused-or-very-low-usage |
| CashOverShortEntry | Account, BankDeposit, CashOverShortRule | 0 | 0 | unused-or-very-low-usage |
| CashOverShortRule | Account, BankAccount, CashOverShortEntry, Company | 0 | 0 | unused-or-very-low-usage |
| ChangeOrder | ChangeOrderItem, Company, ConstructionProject, User | 0 | 0 | unused-or-very-low-usage |
| ChangeOrderItem | ChangeOrder | 0 | 0 | unused-or-very-low-usage |
| Chargeback | Company, Invoice, PaymentReceived, Workspace | 0 | 0 | unused-or-very-low-usage |
| ChartOfAccountsTemplate | CompanyChartOfAccounts, Country | 0 | 0 | unused-or-very-low-usage |
| Check | BankAccount, BillPayment, Company, DocumentTemplate | 8 | 84 | used |
| Class | BillLine, BudgetLine, BudgetLineVersion, Company, InventoryTransactionLine, InvoiceLine, JournalEntryLine, WorkspaceUser | 0 | 2 | unused-or-very-low-usage |
| ClientPortalSettings | Practice | 0 | 0 | unused-or-very-low-usage |
| ClientRequest | ClientRequestActivity, ClientRequestAttachment, ClientRequestResponse, Company, Engagement, Practice, User | 0 | 0 | unused-or-very-low-usage |
| ClientRequestActivity | ClientRequest, User | 0 | 0 | unused-or-very-low-usage |
| ClientRequestAttachment | ClientRequest | 0 | 0 | unused-or-very-low-usage |
| ClientRequestResponse | ClientRequest, User | 0 | 0 | unused-or-very-low-usage |
| ClosingEntry | Company, JournalEntry | 1 | 0 | used |
| COGSRecognition | Company, InventoryTransactionLine, InvoiceLine, Item, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| CollectionsCase | (none) | 5 | 1 | used |
| CommunicationLog | Company, Practice, User | 0 | 0 | unused-or-very-low-usage |
| Company | Account, AccountBalance, AccountBalanceAudit, AccountSegment, AccountSubType, AccountingValidation, AccrualSchedule, AdvancePricingAgreement, AiAgent, AiAuditLog, AiChatSession, AiGovernanceRule, AiInsight, AiModel, AiQueryLog, AlphalistEntry, ApprovalThreshold, ArchiveJob, AssemblyBuild, AssetDisposal, AssetImpairment, AssetInsurance, AssetMaintenance, AssetRevaluation, AuditLog, BackOrder, BankDeposit, BankFeedAccount, BankFeedConnection, BankFeedImport, BankFeedRule, BankTransactionRaw, BenefitPlan, Bill, BillLine, BillPayment, BirFormSubmission, BudgetActualComparison, BusinessLoan, BusinessPermit, COGSRecognition, Campaign, CashFlowCategory, CashFlowForecast, CashFlowStatementSnapshot, CashOverShortRule, ChangeOrder, Chargeback, Check, Class, ClientRequest, ClosingEntry, CommunicationLog, CompanyCard, CompanyCardActivity, CompanyChartOfAccounts, CompanyFirmAccess, CompanySettings, CompanyUser, ComplianceDeadline, ComplianceIssue, ConsolidationEntry, ConsolidationGroupMember, ConstructionCostCode, ConstructionProject, ContractRetention, Contractor, ContractorPayment, ControlViolation, CostCodeAllocation, Country, CreditHealthScore, CreditLine, CreditNote, CurrencyRevaluation, CustomFieldDefinition, CustomReportBuilder, CustomerCredit, CustomerCreditLine, CustomerGroup, CustomerRefund, CustomerStatement, DataImportJob, DataQualityScore, DataRetentionPolicy, DebitNote, DefaultAccountMapping, DeferredTax, DeletionLog, Department, DepreciationAccount, DepreciationJournal, Dimension, DimensionValue, Dispute, Dividend, DocumentApproval, DocumentRenderLog, DocumentRetention, DocumentSequence, DocumentTemplate, Donation, DonorManagement, DunningNotice, DunningProfile, DunningRule, DunningRun, EmailTemplate, Employee, EmployeeLoan, EmployeeLoanPayment, Engagement, EntityDimensionValue, EntityVersion, EquityAccount, EsgMetric, Estimate, ExpenseClaim, ExpenseSubCategoryConfig, ExternalSystemConfig, FeatureStore, FeatureVector, FilingCalendar, FinalTaxDeduction, FinancialControl, FinancialMetric, FinancialRatio, FinancialStatementLine, FinancialStatementTemplate, FixedAsset, FixedAssetCategory, FixedAssetDepreciation, FixedAssetSchedule, ForeignCurrencyGainLoss, Form1099, Form2307, FraudDetectionRule, Fund, GiftCard, GovernmentContributionPayment, GovernmentRemittance, Grant, GrantExpense, IntercompanyTransaction, InternalControl, InventoryAdjustmentRequest, InventoryCostLayer, InventoryReserve, InventoryTransaction, InventoryTransactionLine, Invoice, InvoiceLine, Item, JobPosition, JournalEntry, JournalEntryLine, KpiDashboard, LegalEntity, LetterOfCredit, Lien, LocalFinancialStatementTemplate, LocalTaxObligation, Location, LotSerialNumber, LoyaltyProgram, MerchantAccount, MileageLog, Nexus, NotificationPreference, OnboardingStep, OpeningBalance, PaySchedule, Paycheck, PaycheckLine, PaycheckTax, PaymentApproval, PaymentGatewaySettlement, PaymentReceived, PaymentReminder, Payout, PayrollAccrual, PayrollDeduction, PayrollRun, PayrollRunEmployee, PayrollTaxLiability, PayrollTaxPayment, PayrollTaxReturn, PercentageTax, PeriodCloseChecklist, PettyCashFund, Pledge, PolicyDocument, PostingLock, PracticeCalendar, PracticeCertification, PracticeUnlockedTool, PracticeXpLog, Prediction, ProductionRun, Project, ProjectBilling, ProjectMilestone, ProjectRetainer, Property, PurchaseOrder, PurchaseOrderLine, PurchaseRequest, Quote, QuoteLine, Receipt, ReconciliationException, RecurringInvoice, RecurringJournalTemplate, RecurringSchedule, RefundApproval, RelatedParty, ReorderRule, RetentionSchedule, RevenueSchedule, Risk, SalaryStructure, SalesOrder, SalesTaxPayment, SalesTaxReturn, SavedReport, Session, ShiftSchedule, StockCount, StockLevel, StockLocation, SubledgerReconciliation, Subscription, SubscriptionReminder, SubsidiaryLedger, Task, TaxAttributeCarryforward, TaxAuditCase, TaxAuthorityCommunication, TaxCalculationAudit, TaxCalendar, TaxClearanceCertificate, TaxCode, TaxCodeAccount, TaxCodeRate, TaxFilingBatch, TaxFilingPackage, TaxIncentive, TaxObligation, TaxOptimizationSuggestion, TaxPeriodLock, TaxProvision, TaxRate, TaxReturn, TaxRiskScore, Team, ThirteenthMonthPay, TimeOffBalance, TimeOffRequest, TransferPricingDocument, UncertainTaxPosition, UndepositedFundsBatch, UnitOfMeasure, User, UserActionAudit, VatLedger, VatRegistration, VatTransaction, VendorCredit, VendorCreditLine, VendorPaymentMethod, VendorRefund, WebhookSubscription, WithholdingTaxCertificate, WithholdingTaxDeduction, WorkInProgress, Workflow, Workspace, WriteOff, YearEndClose | 81 | 56 | used |
| CompanyCard | Company, CompanyCardActivity | 0 | 0 | unused-or-very-low-usage |
| CompanyCardActivity | Company, CompanyCard | 0 | 0 | unused-or-very-low-usage |
| CompanyChartOfAccounts | ChartOfAccountsTemplate, Company | 0 | 0 | unused-or-very-low-usage |
| CompanyFirmAccess | AccountingFirm, Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| CompanySettings | Company | 0 | 0 | unused-or-very-low-usage |
| CompanyUser | Company, Workspace, WorkspaceUser | 0 | 0 | unused-or-very-low-usage |
| ComplianceDeadline | Company, Country | 0 | 0 | unused-or-very-low-usage |
| ComplianceIssue | Company, InternalControl | 0 | 0 | unused-or-very-low-usage |
| ConsentRecord | (none) | 0 | 0 | unused-or-very-low-usage |
| ConsolidationEntry | Company, JournalEntry, Workspace | 0 | 0 | unused-or-very-low-usage |
| ConsolidationGroup | ConsolidationGroupMember, PracticeClientLead, PracticeRoleRate, PracticeWipLedger, Workspace | 0 | 0 | unused-or-very-low-usage |
| ConsolidationGroupMember | ApprovalWorkflow, BankRule, Company, ConsolidationGroup, InvoiceTemplate | 0 | 0 | unused-or-very-low-usage |
| ConstructionCostCode | Company, ConstructionCostCode, ConstructionProject, CostCodeAllocation | 0 | 0 | unused-or-very-low-usage |
| ConstructionProject | ChangeOrder, Company, ConstructionCostCode, CostCodeAllocation, Customer, Lien, Project, ProjectMilestone, ProjectPhaseLog, RetentionSchedule, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| Contact | ContactEmail, ContactPhone, Customer, Vendor, Workspace | 2 | 26 | used |
| ContactAddress | Workspace | 0 | 0 | unused-or-very-low-usage |
| ContactCustomField | Workspace | 0 | 0 | unused-or-very-low-usage |
| ContactEmail | Contact | 0 | 0 | unused-or-very-low-usage |
| ContactPhone | Contact | 0 | 0 | unused-or-very-low-usage |
| Contractor | Company, ContractorPayment, Form1099, Vendor, Workspace | 0 | 1 | unused-or-very-low-usage |
| ContractorPayment | BillPayment, Company, Contractor, Vendor, Workspace | 0 | 0 | unused-or-very-low-usage |
| ContractRetention | Company, Project, RetentionEntry, Workspace | 0 | 0 | unused-or-very-low-usage |
| ControlTest | InternalControl | 0 | 0 | unused-or-very-low-usage |
| ControlViolation | Company, FinancialControl | 0 | 0 | unused-or-very-low-usage |
| CostCodeAllocation | Company, ConstructionCostCode, ConstructionProject | 0 | 0 | unused-or-very-low-usage |
| Country | BirFormTemplate, ChartOfAccountsTemplate, Company, ComplianceDeadline, CountryTaxModule, DocumentRetention, LocalFinancialStatementTemplate, LocalTaxTypeConfig, Nexus, PayrollDeduction, TaxAttributeCarryforward, TaxAuthority, TaxCalendar, TaxIncentive, TaxJurisdiction, TaxPeriodLock, TaxRate, TaxRule, TaxTreaty, VatRegistration | 1 | 17 | used |
| CountryTaxModule | Country | 0 | 0 | unused-or-very-low-usage |
| CreditHealthScore | Company | 0 | 0 | unused-or-very-low-usage |
| CreditLine | Company, CreditLineDrawdown | 0 | 0 | unused-or-very-low-usage |
| CreditLineDrawdown | CreditLine | 0 | 0 | unused-or-very-low-usage |
| CreditNote | Company, Customer, DocumentTemplate, Invoice, JournalEntry | 3 | 0 | used |
| Currency | (none) | 2 | 29 | used |
| CurrencyRevaluation | Company, CurrencyRevaluationEntry, CurrencyRevaluationLine, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| CurrencyRevaluationEntry | Account, CurrencyRevaluation | 0 | 0 | unused-or-very-low-usage |
| CurrencyRevaluationLine | Account, CurrencyRevaluation | 0 | 0 | unused-or-very-low-usage |
| Customer | ConstructionProject, Contact, CreditNote, CustomerCredit, CustomerGroup, CustomerRefund, CustomerStatement, Donation, DonorManagement, DunningNotice, Grant, Invoice, Lease, LoyaltyAccount, PaymentReceived, PaymentTerm, Pledge, PriceList, Quote, RecurringInvoice, SalesOrder, Workspace | 21 | 130 | used |
| CustomerCredit | Company, Customer, CustomerCreditApplication, CustomerCreditLine, DocumentTemplate, Workspace | 0 | 0 | unused-or-very-low-usage |
| CustomerCreditApplication | CustomerCredit, Invoice, Workspace | 0 | 0 | unused-or-very-low-usage |
| CustomerCreditLine | Account, Company, CustomerCredit, Workspace | 0 | 0 | unused-or-very-low-usage |
| CustomerGroup | Company, Customer, PriceList, Workspace | 4 | 6 | used |
| CustomerRefund | BankAccount, Company, Customer, JournalEntry, PaymentReceived, RefundApproval, RefundReason, Workspace | 2 | 0 | used |
| CustomerStatement | Company, Customer, DocumentTemplate, Workspace | 0 | 0 | unused-or-very-low-usage |
| CustomFieldDefinition | Company | 0 | 0 | unused-or-very-low-usage |
| CustomReportBuilder | Company | 0 | 0 | unused-or-very-low-usage |
| DashboardWidget | KpiDashboard | 0 | 0 | unused-or-very-low-usage |
| DataImportJob | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| DataQualityScore | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| DataRetentionPolicy | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| DeadLetter | (none) | 0 | 0 | unused-or-very-low-usage |
| DebitNote | Bill, Company, JournalEntry, Vendor | 0 | 0 | unused-or-very-low-usage |
| DefaultAccountMapping | Account, Company | 0 | 0 | unused-or-very-low-usage |
| DeferredRevenue | (none) | 0 | 0 | unused-or-very-low-usage |
| DeferredTax | Account, Company | 0 | 0 | unused-or-very-low-usage |
| DeletionLog | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| Department | Company, Department | 3 | 1 | used |
| DepositSlip | BankDeposit, DocumentTemplate, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| DepreciationAccount | Account, Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| DepreciationJournal | Company, FixedAssetSchedule, JournalEntry, TaxAttributeCarryforward, UncertainTaxPosition | 0 | 0 | unused-or-very-low-usage |
| Dimension | Company, DimensionValue | 0 | 0 | unused-or-very-low-usage |
| DimensionValue | Company, Dimension, DimensionValue, EntityDimensionValue | 0 | 0 | unused-or-very-low-usage |
| Dispute | Company, DisputeReason, Invoice, Workspace | 0 | 0 | unused-or-very-low-usage |
| DisputeReason | Dispute, Workspace | 0 | 0 | unused-or-very-low-usage |
| Dividend | Company, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| DocumentApproval | Company, User | 0 | 0 | unused-or-very-low-usage |
| DocumentRenderLog | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| DocumentRetention | Company, Country | 0 | 0 | unused-or-very-low-usage |
| DocumentSequence | Company | 0 | 0 | unused-or-very-low-usage |
| DocumentSignature | DocumentTemplate, Workspace | 0 | 0 | unused-or-very-low-usage |
| DocumentTemplate | Check, Company, CreditNote, CustomerCredit, CustomerStatement, DepositSlip, DocumentSignature, DocumentTemplateVersion, Invoice, Paycheck, PurchaseOrder, Quote, VendorCredit, Workspace | 0 | 0 | unused-or-very-low-usage |
| DocumentTemplateVersion | DocumentTemplate, Workspace | 0 | 0 | unused-or-very-low-usage |
| Donation | Company, Customer, Fund, Workspace | 0 | 0 | unused-or-very-low-usage |
| DonorInteraction | DonorManagement | 0 | 0 | unused-or-very-low-usage |
| DonorManagement | Company, Customer, DonorInteraction | 0 | 0 | unused-or-very-low-usage |
| DsrExportRequest | (none) | 0 | 0 | unused-or-very-low-usage |
| DunningLog | DunningRule | 0 | 0 | unused-or-very-low-usage |
| DunningNotice | Company, Customer, DunningRun, DunningStep, Invoice, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| DunningProfile | Company, DunningRun, DunningStep, Workspace | 0 | 0 | unused-or-very-low-usage |
| DunningRule | Company, DunningLog | 0 | 0 | unused-or-very-low-usage |
| DunningRun | Company, DunningNotice, DunningProfile | 0 | 0 | unused-or-very-low-usage |
| DunningStep | DunningNotice, DunningProfile | 0 | 0 | unused-or-very-low-usage |
| EmailTemplate | Company | 0 | 13 | unused-or-very-low-usage |
| EmailVerificationToken | (none) | 11 | 0 | used |
| Employee | Company, Employee, EmployeeLoan, EmployeeLoanPayment, EmployeeTaxInfo, ExpenseClaim, FormI9, GovernmentContributionPayment, Paycheck, PayrollAccrual, PayrollDeduction, PayrollRunEmployee, PettyCashFund, ThirteenthMonthPay, TimeEntry, TimeOffBalance, TimeOffRequest, Timesheet | 7 | 8 | used |
| EmployeeLoan | Company, Employee, EmployeeLoanPayment, EmployeeLoanRepayment | 0 | 0 | unused-or-very-low-usage |
| EmployeeLoanPayment | Company, Employee, EmployeeLoan | 0 | 0 | unused-or-very-low-usage |
| EmployeeLoanRepayment | EmployeeLoan | 0 | 0 | unused-or-very-low-usage |
| EmployeeTaxInfo | Employee, Paycheck | 0 | 0 | unused-or-very-low-usage |
| Engagement | ClientRequest, Company, EngagementTimeEntry, EngagementWorkflow, Practice, PracticeCalendar, PracticeWipLedger | 0 | 22 | unused-or-very-low-usage |
| EngagementTemplate | EngagementWorkflow, Practice | 0 | 0 | unused-or-very-low-usage |
| EngagementTimeEntry | Engagement, PracticeUser | 0 | 0 | unused-or-very-low-usage |
| EngagementWorkflow | Engagement, EngagementTemplate | 0 | 0 | unused-or-very-low-usage |
| EntityDimensionValue | Company, DimensionValue | 0 | 0 | unused-or-very-low-usage |
| EntityVersion | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| EquityAccount | Account, Company | 0 | 0 | unused-or-very-low-usage |
| EsgMetric | Company | 0 | 0 | unused-or-very-low-usage |
| Estimate | Company | 0 | 1 | unused-or-very-low-usage |
| EventLog | Workspace | 0 | 0 | unused-or-very-low-usage |
| ExchangeRate | (none) | 0 | 0 | unused-or-very-low-usage |
| ExpenseClaim | Company, Employee, ExpenseClaimLine, Paycheck, Workspace | 0 | 0 | unused-or-very-low-usage |
| ExpenseClaimLine | Account, ExpenseClaim, ExpenseSubCategoryConfig | 0 | 0 | unused-or-very-low-usage |
| ExpenseSubCategoryConfig | Account, Company, ExpenseClaimLine | 0 | 0 | unused-or-very-low-usage |
| ExternalEntity | ExternalSystemConfig, Workspace | 0 | 0 | unused-or-very-low-usage |
| ExternalSystemAccessLog | ApiKey, User | 0 | 0 | unused-or-very-low-usage |
| ExternalSystemAudit | ExternalSystemConfig, Workspace | 0 | 0 | unused-or-very-low-usage |
| ExternalSystemConfig | Company, ExternalEntity, ExternalSystemAudit, SyncJob, Workspace | 0 | 0 | unused-or-very-low-usage |
| Feature | PlanFeature | 0 | 1 | unused-or-very-low-usage |
| FeatureStore | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| FeatureVector | Company, Prediction, Workspace | 0 | 0 | unused-or-very-low-usage |
| FilingCalendar | Company, FilingDeadline | 0 | 0 | unused-or-very-low-usage |
| FilingDeadline | FilingCalendar | 0 | 0 | unused-or-very-low-usage |
| FinalTaxDeduction | Account, Company, Vendor | 0 | 0 | unused-or-very-low-usage |
| FinancialControl | Company, ControlViolation, Workspace | 0 | 0 | unused-or-very-low-usage |
| FinancialMetric | Company | 0 | 0 | unused-or-very-low-usage |
| FinancialRatio | Company | 0 | 0 | unused-or-very-low-usage |
| FinancialStatementLine | Company | 0 | 0 | unused-or-very-low-usage |
| FinancialStatementSnapshot | Workspace | 0 | 0 | unused-or-very-low-usage |
| FinancialStatementTemplate | Company, ReportSection | 0 | 0 | unused-or-very-low-usage |
| FirmData | AccountingFirm, Workspace | 0 | 0 | unused-or-very-low-usage |
| FixedAsset | Account, AssetDisposal, AssetImpairment, AssetInsurance, AssetMaintenance, AssetRevaluation, Company, DepreciationAccount, FixedAssetCategory, FixedAssetDepreciation, FixedAssetSchedule | 1 | 0 | used |
| FixedAssetCategory | Company, FixedAsset | 0 | 0 | unused-or-very-low-usage |
| FixedAssetDepreciation | Company, FixedAsset, FixedAssetSchedule | 0 | 0 | unused-or-very-low-usage |
| FixedAssetSchedule | Company, DepreciationJournal, FixedAsset, FixedAssetDepreciation | 0 | 0 | unused-or-very-low-usage |
| ForeignCurrencyGainLoss | Company | 0 | 0 | unused-or-very-low-usage |
| Form1099 | Company, Contractor, Form1099Box, Workspace | 0 | 0 | unused-or-very-low-usage |
| Form1099Box | Form1099 | 0 | 0 | unused-or-very-low-usage |
| Form2307 | Company, JournalEntry, Vendor | 0 | 0 | unused-or-very-low-usage |
| FormI9 | Employee, Paycheck | 0 | 0 | unused-or-very-low-usage |
| FraudAlert | FraudDetectionRule | 0 | 0 | unused-or-very-low-usage |
| FraudDetectionRule | Company, FraudAlert | 0 | 0 | unused-or-very-low-usage |
| Fund | AccountSegment, Company, Donation, FundAllocation, Workspace | 1 | 1 | used |
| FundAllocation | Fund | 0 | 0 | unused-or-very-low-usage |
| GiftCard | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| GovernmentContributionPayment | Company, Employee | 0 | 0 | unused-or-very-low-usage |
| GovernmentRemittance | Company | 0 | 0 | unused-or-very-low-usage |
| Grant | Company, Customer, GrantBudget, GrantExpense, GrantReport, Workspace | 0 | 0 | unused-or-very-low-usage |
| GrantBudget | Grant, GrantExpense | 0 | 0 | unused-or-very-low-usage |
| GrantExpense | Company, Grant, GrantBudget | 0 | 0 | unused-or-very-low-usage |
| GrantReport | Attachment, Grant, User | 0 | 0 | unused-or-very-low-usage |
| IdempotencyKey | (none) | 0 | 0 | unused-or-very-low-usage |
| IntegrationConnector | (none) | 0 | 0 | unused-or-very-low-usage |
| IntercompanyTransaction | Company, JournalEntry, Workspace | 0 | 0 | unused-or-very-low-usage |
| InternalControl | Company, ComplianceIssue, ControlTest | 0 | 0 | unused-or-very-low-usage |
| InventoryAdjustmentApproval | InventoryAdjustmentRequest, User | 0 | 0 | unused-or-very-low-usage |
| InventoryAdjustmentRequest | Company, InventoryAdjustmentApproval, InventoryTransaction, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| InventoryCostLayer | Company, InventoryTransactionLine, Item, LandedCostLine | 0 | 0 | unused-or-very-low-usage |
| InventoryReserve | Company, Item | 0 | 0 | unused-or-very-low-usage |
| InventoryTransaction | Company, InventoryAdjustmentRequest, InventoryTransactionLine, Invoice, JournalEntry, PurchaseOrder, Workspace | 0 | 0 | unused-or-very-low-usage |
| InventoryTransactionLine | COGSRecognition, Class, Company, InventoryCostLayer, InventoryTransaction, Item, Location, Project, StockLocation, Workspace | 0 | 0 | unused-or-very-low-usage |
| Invoice | Chargeback, Company, CreditNote, Customer, CustomerCreditApplication, Dispute, DocumentTemplate, DunningNotice, InventoryTransaction, InvoiceLine, InvoicePaymentApplication, InvoiceTemplate, JournalEntry, PaymentReminder, PaymentTerm, Quote, RetentionSchedule, SalesOrder, User, Workspace, WriteOff | 25 | 142 | used |
| InvoiceLine | COGSRecognition, Class, Company, Invoice, Item, LineTax, Location, Project, RevenueRecognitionSchedule, RevenueSchedule, Workspace | 4 | 0 | used |
| InvoicePaymentApplication | Invoice, PaymentReceived, Workspace | 14 | 9 | used |
| InvoiceTemplate | ConsolidationGroupMember, Invoice, Workspace | 0 | 28 | unused-or-very-low-usage |
| Item | Account, AssemblyBuild, AssemblyComponent, BillLine, COGSRecognition, Company, InventoryCostLayer, InventoryReserve, InventoryTransactionLine, InvoiceLine, PriceListEntry, PriceListItem, ProductionRun, PurchaseOrderLine, PurchaseRequestLine, QuoteLine, SalesOrderLine, StandardCostVersion, StockCountLine, StockLevel | 10 | 33 | used |
| JobApplication | JobPosition | 0 | 0 | unused-or-very-low-usage |
| JobAttempt | (none) | 0 | 0 | unused-or-very-low-usage |
| JobPosition | Company, JobApplication | 0 | 0 | unused-or-very-low-usage |
| JournalEntry | AccrualEntry, BankDeposit, Bill, BillPayment, COGSRecognition, ClosingEntry, Company, ConsolidationEntry, CreditNote, CurrencyRevaluation, CustomerRefund, DebitNote, DepreciationJournal, Dividend, Form2307, IntercompanyTransaction, InventoryTransaction, Invoice, JournalEntry, JournalEntryLine, PaymentReceived, PayrollAccrual, PayrollTaxPayment, ProductionRun, RevenueRecognitionPhase, RevenueSchedule, User, VarianceJournal, VendorRefund, Workspace, WriteOff, YearEndClose | 19 | 9 | used |
| JournalEntryLine | Account, BankReconciliationLine, Class, Company, JournalEntry, Location, Project, Workspace | 0 | 0 | unused-or-very-low-usage |
| KpiDashboard | Company, DashboardWidget, Workspace | 0 | 0 | unused-or-very-low-usage |
| LandedCost | LandedCostLine | 0 | 0 | unused-or-very-low-usage |
| LandedCostLine | InventoryCostLayer, LandedCost | 0 | 0 | unused-or-very-low-usage |
| Lease | Customer, PropertyUnit | 0 | 0 | unused-or-very-low-usage |
| LegalEntity | Company, LegalEntity | 0 | 0 | unused-or-very-low-usage |
| LetterOfCredit | Company, PurchaseOrder | 0 | 0 | unused-or-very-low-usage |
| Lien | Company, ConstructionProject | 0 | 0 | unused-or-very-low-usage |
| LineTax | BillLine, InvoiceLine, PurchaseOrderLine, QuoteLine, TaxCode, TaxRate | 3 | 0 | used |
| LocaleConfiguration | User, Workspace | 0 | 0 | unused-or-very-low-usage |
| LocalFinancialStatementTemplate | Company, Country | 0 | 0 | unused-or-very-low-usage |
| LocalTaxObligation | Company | 0 | 0 | unused-or-very-low-usage |
| LocalTaxTypeConfig | Country | 0 | 0 | unused-or-very-low-usage |
| Location | BillLine, Company, InventoryTransactionLine, InvoiceLine, JournalEntryLine, WorkspaceUser | 4 | 0 | used |
| LoginHistory | (none) | 0 | 0 | unused-or-very-low-usage |
| LotSerialNumber | Company | 0 | 0 | unused-or-very-low-usage |
| LoyaltyAccount | Customer, LoyaltyProgram | 0 | 0 | unused-or-very-low-usage |
| LoyaltyProgram | Company, LoyaltyAccount, Workspace | 0 | 0 | unused-or-very-low-usage |
| MerchantAccount | Company | 0 | 0 | unused-or-very-low-usage |
| MileageLog | Company | 0 | 0 | unused-or-very-low-usage |
| Nexus | Company, Country | 0 | 1 | unused-or-very-low-usage |
| Notification | User, Workspace | 0 | 13 | unused-or-very-low-usage |
| NotificationPreference | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| OnboardingData | (none) | 2 | 0 | used |
| OnboardingStep | Company, Practice | 0 | 0 | unused-or-very-low-usage |
| OpeningBalance | Account, Company | 0 | 0 | unused-or-very-low-usage |
| Otp | (none) | 13 | 0 | used |
| OutboxEvent | (none) | 0 | 0 | unused-or-very-low-usage |
| Paycheck | Company, DocumentTemplate, Employee, EmployeeTaxInfo, ExpenseClaim, FormI9, PaycheckLine, PaycheckTax, PayrollRun | 1 | 0 | used |
| PaycheckLine | Company, Paycheck | 0 | 0 | unused-or-very-low-usage |
| PaycheckTax | Company, Paycheck | 0 | 0 | unused-or-very-low-usage |
| PaymentApproval | Company | 0 | 0 | unused-or-very-low-usage |
| PaymentGatewayPayout | PaymentGatewaySettlement | 0 | 0 | unused-or-very-low-usage |
| PaymentGatewaySettlement | Company, PaymentGatewayPayout, Workspace | 0 | 0 | unused-or-very-low-usage |
| PaymentLink | (none) | 1 | 1 | used |
| PaymentMethod | PaymentReceived, Workspace | 0 | 0 | unused-or-very-low-usage |
| PaymentReceived | BankAccount, BankDepositLine, Chargeback, Company, Customer, CustomerRefund, InvoicePaymentApplication, JournalEntry, PaymentMethod, UndepositedFundsBatch, User, Workspace | 2 | 0 | used |
| PaymentReminder | Company, Invoice, Workspace | 0 | 0 | unused-or-very-low-usage |
| PaymentTerm | Bill, Customer, Invoice, Vendor, Workspace | 0 | 6 | unused-or-very-low-usage |
| Payout | Company, Workspace | 0 | 1 | unused-or-very-low-usage |
| PayrollAccrual | Account, Company, Employee, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| PayrollDeduction | Account, Company, Country, Employee | 0 | 0 | unused-or-very-low-usage |
| PayrollRun | Company, PaySchedule, Paycheck, PayrollRunEmployee | 0 | 0 | unused-or-very-low-usage |
| PayrollRunEmployee | Company, Employee, PayrollRun | 0 | 0 | unused-or-very-low-usage |
| PayrollTaxLiability | Account, Company, PayrollTaxPayment | 0 | 0 | unused-or-very-low-usage |
| PayrollTaxPayment | Company, JournalEntry, PayrollTaxLiability | 0 | 0 | unused-or-very-low-usage |
| PayrollTaxReturn | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| PaySchedule | Company, PayrollRun | 0 | 0 | unused-or-very-low-usage |
| PercentageTax | Account, Company | 0 | 0 | unused-or-very-low-usage |
| PeriodCloseChecklist | Company, PeriodCloseChecklistItem | 0 | 0 | unused-or-very-low-usage |
| PeriodCloseChecklistItem | PeriodCloseChecklist | 0 | 0 | unused-or-very-low-usage |
| Permission | RolePermission | 0 | 4 | unused-or-very-low-usage |
| PettyCashFund | Account, Company, Employee, PettyCashVoucher | 0 | 0 | unused-or-very-low-usage |
| PettyCashVoucher | Account, PettyCashFund, User | 0 | 0 | unused-or-very-low-usage |
| Plan | AccountingFirmSubscription, PlanFeature, Subscription | 0 | 13 | unused-or-very-low-usage |
| PlanFeature | Feature, Plan | 0 | 0 | unused-or-very-low-usage |
| PlatformMetricSnapshot | (none) | 0 | 0 | unused-or-very-low-usage |
| Pledge | Company, Customer | 0 | 0 | unused-or-very-low-usage |
| PolicyDocument | Company | 0 | 0 | unused-or-very-low-usage |
| PostingLock | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| Practice | AuditLog, ClientPortalSettings, ClientRequest, CommunicationLog, Engagement, EngagementTemplate, OnboardingStep, PracticeCalendar, PracticeClientLead, PracticeDashboard, PracticeHealthMetric, PracticeRoleRate, PracticeUser, PracticeWipLedger, RecurringSchedule, Subscription, SubscriptionReminder, Task, Workflow, Workspace | 19 | 205 | used |
| PracticeCalendar | CalendarAttendee, Company, Engagement, Practice, Task, User | 0 | 0 | unused-or-very-low-usage |
| PracticeCertification | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| PracticeClientLead | ConsolidationGroup, Practice | 0 | 0 | unused-or-very-low-usage |
| PracticeDashboard | Practice | 0 | 0 | unused-or-very-low-usage |
| PracticeHealthMetric | Practice | 0 | 0 | unused-or-very-low-usage |
| PracticeRoleRate | ConsolidationGroup, Practice | 0 | 0 | unused-or-very-low-usage |
| PracticeUnlockedTool | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| PracticeUser | EngagementTimeEntry, Practice, Workspace, WorkspaceUser | 0 | 0 | unused-or-very-low-usage |
| PracticeWipLedger | ConsolidationGroup, Engagement, Practice | 0 | 0 | unused-or-very-low-usage |
| PracticeXpLog | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| Prediction | AiModel, Company, FeatureVector, Workspace | 0 | 0 | unused-or-very-low-usage |
| PriceList | Customer, CustomerGroup, PriceListEntry, PriceListItem, Workspace | 0 | 0 | unused-or-very-low-usage |
| PriceListEntry | Item, PriceList | 0 | 0 | unused-or-very-low-usage |
| PriceListItem | Item, PriceList | 0 | 0 | unused-or-very-low-usage |
| ProductionRun | Account, Company, Item, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| Project | BillLine, Company, ConstructionProject, ContractRetention, InventoryTransactionLine, InvoiceLine, JournalEntryLine, ProjectBilling, ProjectLine, ProjectRetainer, ProjectTask, ResourceAllocation, TimeEntry, TimerSession, WorkInProgress, Workspace, WorkspaceUser | 14 | 8 | used |
| ProjectBilling | Company, Project, ProjectMilestone | 0 | 0 | unused-or-very-low-usage |
| ProjectLine | Project | 0 | 0 | unused-or-very-low-usage |
| ProjectMilestone | Company, ConstructionProject, ProjectBilling, User | 0 | 0 | unused-or-very-low-usage |
| ProjectPhaseLog | ConstructionProject | 0 | 0 | unused-or-very-low-usage |
| ProjectRetainer | Company, Project | 0 | 0 | unused-or-very-low-usage |
| ProjectTask | Project | 0 | 0 | unused-or-very-low-usage |
| Property | Company, PropertyUnit, Workspace | 0 | 0 | unused-or-very-low-usage |
| PropertyUnit | Lease, Property | 0 | 0 | unused-or-very-low-usage |
| PurchaseOrder | ApprovalRequest, Company, DocumentTemplate, InventoryTransaction, LetterOfCredit, PurchaseOrderLine, PurchaseRequest, Vendor, Workspace | 0 | 0 | unused-or-very-low-usage |
| PurchaseOrderLine | Company, Item, LineTax, PurchaseOrder, Workspace | 0 | 0 | unused-or-very-low-usage |
| PurchaseRequest | Company, PurchaseOrder, PurchaseRequestLine, Workspace | 0 | 0 | unused-or-very-low-usage |
| PurchaseRequestLine | Item, PurchaseRequest | 0 | 0 | unused-or-very-low-usage |
| Quote | Company, Customer, DocumentTemplate, Invoice, QuoteLine, Workspace | 12 | 18 | used |
| QuoteLine | Company, Item, LineTax, Quote | 0 | 0 | unused-or-very-low-usage |
| RateLimitLog | Workspace | 0 | 0 | unused-or-very-low-usage |
| Receipt | Company | 1 | 54 | used |
| ReconciliationException | Company, SubledgerReconciliation | 0 | 0 | unused-or-very-low-usage |
| RecurringExecutionLog | RecurringSchedule | 0 | 0 | unused-or-very-low-usage |
| RecurringInvoice | Company, Customer, Workspace | 4 | 0 | used |
| RecurringJournalTemplate | Company, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| RecurringSchedule | Company, Practice, RecurringExecutionLog, Workspace | 0 | 0 | unused-or-very-low-usage |
| RefundApproval | Company, CustomerRefund, User, VendorRefund, Workspace | 0 | 0 | unused-or-very-low-usage |
| RefundReason | CustomerRefund, VendorRefund, Workspace | 0 | 0 | unused-or-very-low-usage |
| RelatedParty | Company, TransferPricingDocument | 0 | 0 | unused-or-very-low-usage |
| ReorderRule | Company | 0 | 0 | unused-or-very-low-usage |
| ReportSection | FinancialStatementTemplate | 0 | 0 | unused-or-very-low-usage |
| ResourceAllocation | Project, User | 0 | 0 | unused-or-very-low-usage |
| RetentionEntry | ContractRetention | 0 | 0 | unused-or-very-low-usage |
| RetentionSchedule | Bill, Company, ConstructionProject, Invoice | 0 | 0 | unused-or-very-low-usage |
| Revaluation | Workspace | 2 | 1 | used |
| RevenueRecognition | (none) | 0 | 0 | unused-or-very-low-usage |
| RevenueRecognitionEntry | RevenueRecognitionSchedule | 0 | 0 | unused-or-very-low-usage |
| RevenueRecognitionPhase | JournalEntry, RevenueRecognitionSchedule | 0 | 0 | unused-or-very-low-usage |
| RevenueRecognitionSchedule | InvoiceLine, RevenueRecognitionEntry, RevenueRecognitionPhase, Workspace | 0 | 0 | unused-or-very-low-usage |
| RevenueSchedule | Company, InvoiceLine, JournalEntry | 0 | 0 | unused-or-very-low-usage |
| Reversal | Workspace | 4 | 2 | used |
| Risk | Company, User | 0 | 2 | unused-or-very-low-usage |
| Role | RolePermission, UserRole, Workspace, WorkspaceInvite, WorkspaceUser | 9 | 5 | used |
| RolePermission | Permission, Role | 0 | 0 | unused-or-very-low-usage |
| SalaryStructure | Company, SalaryStructureComponent | 0 | 0 | unused-or-very-low-usage |
| SalaryStructureComponent | SalaryStructure | 1 | 0 | used |
| SalesOrder | Company, Customer, Invoice, SalesOrderLine, Workspace | 5 | 7 | used |
| SalesOrderLine | Item, SalesOrder | 0 | 4 | unused-or-very-low-usage |
| SalesTaxPayment | Company, SalesTaxReturn, Workspace | 0 | 0 | unused-or-very-low-usage |
| SalesTaxReturn | Company, SalesTaxPayment, SalesTaxReturnLine, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| SalesTaxReturnLine | SalesTaxReturn, TaxJurisdiction, TaxRate | 0 | 0 | unused-or-very-low-usage |
| SavedReport | Company, Workspace | 0 | 0 | unused-or-very-low-usage |
| SchemaMigration | (none) | 0 | 0 | unused-or-very-low-usage |
| SearchIndexedDoc | (none) | 0 | 0 | unused-or-very-low-usage |
| SearchIndexingQueue | (none) | 0 | 0 | unused-or-very-low-usage |
| Session | Company, User | 19 | 7 | used |
| ShiftAssignment | ShiftSchedule | 0 | 0 | unused-or-very-low-usage |
| ShiftSchedule | Company, ShiftAssignment | 0 | 0 | unused-or-very-low-usage |
| StandardCostVersion | Item | 0 | 0 | unused-or-very-low-usage |
| StockCount | Company, StockCountLine, StockLocation, Workspace | 0 | 0 | unused-or-very-low-usage |
| StockCountLine | Item, StockCount | 0 | 0 | unused-or-very-low-usage |
| StockLevel | Company, Item, StockLocation | 0 | 0 | unused-or-very-low-usage |
| StockLocation | BinLocation, Company, InventoryTransactionLine, StockCount, StockLevel | 0 | 0 | unused-or-very-low-usage |
| SubledgerReconciliation | Company, ReconciliationException | 0 | 0 | unused-or-very-low-usage |
| Subscription | Company, Plan, Practice, SubscriptionReminder | 2 | 13 | used |
| SubscriptionReminder | Company, Practice, Subscription, Workspace | 0 | 0 | unused-or-very-low-usage |
| SubsidiaryLedger | Account, Company | 0 | 0 | unused-or-very-low-usage |
| SyncJob | ExternalSystemConfig, Workspace | 0 | 0 | unused-or-very-low-usage |
| SystemConfig | User, Workspace | 0 | 0 | unused-or-very-low-usage |
| SystemHealthStatus | Workspace | 0 | 0 | unused-or-very-low-usage |
| Task | Company, Practice, PracticeCalendar, TaskComment, User, Workspace, WorkspaceUser | 0 | 13 | unused-or-very-low-usage |
| TaskComment | Task, User | 0 | 0 | unused-or-very-low-usage |
| TaxAttributeCarryforward | Company, Country, DepreciationJournal, TaxJurisdiction | 0 | 0 | unused-or-very-low-usage |
| TaxAuditCase | Company, TaxAuthority, TaxReturn | 0 | 0 | unused-or-very-low-usage |
| TaxAuthority | AdvancePricingAgreement, Country, TaxAuditCase, TaxAuthorityCommunication, TaxClearanceCertificate, TaxObligation, TaxReturn, UncertainTaxPosition | 1 | 0 | used |
| TaxAuthorityCommunication | Company, TaxAuthority | 0 | 0 | unused-or-very-low-usage |
| TaxCalculationAudit | Company, User | 0 | 0 | unused-or-very-low-usage |
| TaxCalendar | Company, Country | 0 | 0 | unused-or-very-low-usage |
| TaxClearanceCertificate | Company, TaxAuthority | 0 | 0 | unused-or-very-low-usage |
| TaxCode | Company, LineTax, TaxCodeAccount, TaxCodeRate | 0 | 0 | unused-or-very-low-usage |
| TaxCodeAccount | Account, Company, TaxCode | 0 | 0 | unused-or-very-low-usage |
| TaxCodeRate | Company, TaxCode, TaxRate | 0 | 0 | unused-or-very-low-usage |
| TaxFilingBatch | Company | 0 | 0 | unused-or-very-low-usage |
| TaxFilingPackage | Company | 0 | 0 | unused-or-very-low-usage |
| TaxIncentive | Company, Country | 0 | 0 | unused-or-very-low-usage |
| TaxJurisdiction | Country, SalesTaxReturnLine, TaxAttributeCarryforward, TaxRate, TaxReturnLine, TaxRule, WithholdingTaxDeduction | 0 | 0 | unused-or-very-low-usage |
| TaxObligation | Company, TaxAuthority, TaxReturn | 0 | 0 | unused-or-very-low-usage |
| TaxOptimizationSuggestion | Company | 0 | 0 | unused-or-very-low-usage |
| TaxPayment | TaxReturn | 0 | 0 | unused-or-very-low-usage |
| TaxPeriodLock | Company, Country, User | 0 | 0 | unused-or-very-low-usage |
| TaxProvision | Company | 0 | 0 | unused-or-very-low-usage |
| TaxRate | Company, Country, LineTax, SalesTaxReturnLine, TaxCodeRate, TaxJurisdiction, TaxReturnLine | 1 | 0 | used |
| TaxReturn | Attachment, Company, TaxAuditCase, TaxAuthority, TaxObligation, TaxPayment, TaxReturnAmendment, TaxReturnLine, UncertainTaxPosition | 0 | 0 | unused-or-very-low-usage |
| TaxReturnAmendment | TaxReturn | 0 | 0 | unused-or-very-low-usage |
| TaxReturnLine | TaxJurisdiction, TaxRate, TaxReturn | 0 | 0 | unused-or-very-low-usage |
| TaxRiskScore | Company | 0 | 0 | unused-or-very-low-usage |
| TaxRule | Country, TaxJurisdiction | 0 | 0 | unused-or-very-low-usage |
| TaxTreaty | Country | 0 | 0 | unused-or-very-low-usage |
| Team | Company, TeamMember | 6 | 54 | used |
| TeamMember | Team | 0 | 0 | unused-or-very-low-usage |
| ThirteenthMonthPay | Company, Employee | 0 | 0 | unused-or-very-low-usage |
| TimeEntry | Employee, Project, Timesheet, Workspace | 0 | 0 | unused-or-very-low-usage |
| TimeOffBalance | Company, Employee | 0 | 0 | unused-or-very-low-usage |
| TimeOffRequest | Company, Employee, User | 0 | 0 | unused-or-very-low-usage |
| TimerSession | Project, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| Timesheet | Employee, TimeEntry, TimesheetApproval, Workspace | 1 | 2 | used |
| TimesheetApproval | Timesheet, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| TransferPricingDocument | Attachment, Company, RelatedParty | 0 | 0 | unused-or-very-low-usage |
| Translation | Workspace | 0 | 0 | unused-or-very-low-usage |
| UncertainTaxPosition | Company, DepreciationJournal, TaxAuthority, TaxReturn | 0 | 0 | unused-or-very-low-usage |
| UndepositedFundsBatch | BankAccount, Company, PaymentReceived, Workspace | 0 | 0 | unused-or-very-low-usage |
| UnitOfMeasure | Company | 0 | 0 | unused-or-very-low-usage |
| User | AdminActionApproval, AdminAuditLog, AdminIpWhitelist, AdminNotification, AdminSession, AiChatSession, AiInsightComment, AiQueryLog, ApiKey, ApprovalRequest, Attachment, AuditLog, Bill, BillPayment, CalendarAttendee, ChangeOrder, ClientRequest, ClientRequestActivity, ClientRequestResponse, CommunicationLog, Company, ConstructionProject, DataImportJob, DeletionLog, DepositSlip, DocumentApproval, DunningNotice, ExternalSystemAccessLog, GrantReport, InventoryAdjustmentApproval, InventoryAdjustmentRequest, Invoice, JournalEntry, LocaleConfiguration, Notification, NotificationPreference, PaymentReceived, PettyCashVoucher, PracticeCalendar, PracticeCertification, PracticeXpLog, ProjectMilestone, RecurringJournalTemplate, RefundApproval, ResourceAllocation, Risk, SalesTaxReturn, Session, SystemConfig, Task, TaskComment, TaxCalculationAudit, TaxPeriodLock, TimeOffRequest, TimerSession, TimesheetApproval, UserActionAudit, UserLocale, UserPreferences, UserSecurityEvent, UserShortcut, Workflow, WorkflowTemplate, Workspace, WorkspaceInvite, WorkspaceUser | 42 | 43 | used |
| UserActionAudit | Company, User | 0 | 0 | unused-or-very-low-usage |
| UserLocale | User | 0 | 0 | unused-or-very-low-usage |
| UserPreferences | User | 0 | 0 | unused-or-very-low-usage |
| UserRole | Role | 0 | 0 | unused-or-very-low-usage |
| UserSecurityEvent | ApprovalRequest, User | 0 | 0 | unused-or-very-low-usage |
| UserShortcut | User | 0 | 0 | unused-or-very-low-usage |
| VarianceJournal | JournalEntry | 0 | 0 | unused-or-very-low-usage |
| VatLedger | Company, VatRegistration | 0 | 0 | unused-or-very-low-usage |
| VatRegistration | Company, Country, VatLedger, VatTransaction | 0 | 0 | unused-or-very-low-usage |
| VatTransaction | Company, VatRegistration | 0 | 0 | unused-or-very-low-usage |
| Vendor | Bill, Contact, Contractor, ContractorPayment, DebitNote, FinalTaxDeduction, Form2307, PaymentTerm, PurchaseOrder, VendorCredit, VendorPaymentMethod, VendorRefund, WithholdingTaxCertificate, WithholdingTaxDeduction, Workspace | 11 | 33 | used |
| VendorCredit | Company, DocumentTemplate, Vendor, VendorCreditLine, Workspace | 0 | 0 | unused-or-very-low-usage |
| VendorCreditLine | Account, Company, VendorCredit, Workspace | 0 | 0 | unused-or-very-low-usage |
| VendorPaymentMethod | BillPayment, Company, Vendor, Workspace | 0 | 0 | unused-or-very-low-usage |
| VendorRefund | BankAccount, BillPayment, Company, JournalEntry, RefundApproval, RefundReason, Vendor, Workspace | 0 | 0 | unused-or-very-low-usage |
| WebhookDelivery | WebhookSubscription, Workspace | 0 | 0 | unused-or-very-low-usage |
| WebhookSubscription | Company, WebhookDelivery, Workspace | 0 | 0 | unused-or-very-low-usage |
| WithholdingTaxCertificate | Company, Vendor | 0 | 0 | unused-or-very-low-usage |
| WithholdingTaxDeduction | Account, Company, TaxJurisdiction, Vendor | 0 | 0 | unused-or-very-low-usage |
| Workflow | Company, Practice, User, WorkflowRule, WorkflowRun, Workspace | 0 | 14 | unused-or-very-low-usage |
| WorkflowRule | Workflow, WorkflowRunStep | 0 | 0 | unused-or-very-low-usage |
| WorkflowRun | Workflow, WorkflowRunStep | 0 | 0 | unused-or-very-low-usage |
| WorkflowRunStep | WorkflowRule, WorkflowRun | 0 | 0 | unused-or-very-low-usage |
| WorkflowTemplate | User, Workspace | 0 | 0 | unused-or-very-low-usage |
| WorkInProgress | Company, Project | 0 | 0 | unused-or-very-low-usage |
| Workspace | AccountingFirm, AccountingPeriod, AiAgent, AiAuditLog, AiChatSession, AiGovernanceRule, AiInsight, AiModel, AiQueryLog, ApiKey, Approval, ApprovalWorkflow, ArchiveJob, Attachment, AuditLog, BankAccount, BankDeposit, BankFeedConnection, BankReconciliation, BankReconciliationLine, BankRule, BankTransaction, BankTransactionSplit, BankTransfer, Bill, BillLine, BillPayment, BillPaymentApplication, Budget, BudgetLine, BudgetVersion, Chargeback, Company, CompanyFirmAccess, CompanyUser, ConsolidationEntry, ConsolidationGroup, ConstructionProject, Contact, ContactAddress, ContactCustomField, ContractRetention, Contractor, ContractorPayment, Customer, CustomerCredit, CustomerCreditApplication, CustomerCreditLine, CustomerGroup, CustomerRefund, CustomerStatement, DataImportJob, DataQualityScore, DataRetentionPolicy, DeletionLog, DepositSlip, Dispute, DisputeReason, DocumentRenderLog, DocumentSignature, DocumentTemplate, DocumentTemplateVersion, Donation, DunningNotice, DunningProfile, EntityVersion, EventLog, ExpenseClaim, ExternalEntity, ExternalSystemAudit, ExternalSystemConfig, FeatureStore, FeatureVector, FinancialControl, FinancialStatementSnapshot, FirmData, Form1099, Fund, GiftCard, Grant, IntercompanyTransaction, InventoryAdjustmentRequest, InventoryTransaction, InventoryTransactionLine, Invoice, InvoiceLine, InvoicePaymentApplication, InvoiceTemplate, JournalEntry, JournalEntryLine, KpiDashboard, LocaleConfiguration, LoyaltyProgram, Notification, NotificationPreference, PaymentGatewaySettlement, PaymentMethod, PaymentReceived, PaymentReminder, PaymentTerm, Payout, PayrollTaxReturn, PostingLock, Practice, PracticeCertification, PracticeUnlockedTool, PracticeUser, PracticeXpLog, Prediction, PriceList, Project, Property, PurchaseOrder, PurchaseOrderLine, PurchaseRequest, Quote, RateLimitLog, RecurringInvoice, RecurringJournalTemplate, RecurringSchedule, RefundApproval, RefundReason, Revaluation, RevenueRecognitionSchedule, Reversal, Role, SalesOrder, SalesTaxPayment, SalesTaxReturn, SavedReport, StockCount, SubscriptionReminder, SyncJob, SystemConfig, SystemHealthStatus, Task, TimeEntry, TimerSession, Timesheet, TimesheetApproval, Translation, UndepositedFundsBatch, User, Vendor, VendorCredit, VendorCreditLine, VendorPaymentMethod, VendorRefund, WebhookDelivery, WebhookSubscription, Workflow, WorkflowTemplate, WorkspaceBillingInvoice, WorkspaceBillingUsage, WorkspaceCapabilities, WorkspaceInvite, WorkspaceUser, WriteOff | 16 | 30 | used |
| WorkspaceBillingInvoice | Workspace | 0 | 0 | unused-or-very-low-usage |
| WorkspaceBillingUsage | Workspace | 0 | 0 | unused-or-very-low-usage |
| WorkspaceCapabilities | Workspace | 1 | 0 | used |
| WorkspaceInvite | Role, User, Workspace | 0 | 0 | unused-or-very-low-usage |
| WorkspaceUser | Class, CompanyUser, Location, PracticeUser, Project, Role, Task, User, Workspace | 10 | 0 | used |
| WriteOff | Account, Bill, Company, Invoice, JournalEntry, Workspace | 5 | 9 | used |
| YearEndClose | Account, Company, JournalEntry | 0 | 0 | unused-or-very-low-usage |

## 5) Cross-Component / Cross-Module Dependencies

### 5.1 Page -> Backend Module Dependency (inferred from API calls)

| Route | Modules | EndpointCount | Status |
| --- | --- | --- | --- |
| /accountant-workspace/client-requests | (none detected) | 0 | stub/placeholder |
| /accounting/allocations/allocation-history | (none detected) | 0 | stub/placeholder |
| /accounting/allocations/allocation-rules | (none detected) | 0 | stub/placeholder |
| /accounting/allocations/allocation-runs | (none detected) | 0 | stub/placeholder |
| /accounting/close-workflow | accounting | 3 | partial |
| /accounting/core-accounting/chart-of-accounts | accounting | 2 | partial |
| /accounting/core-accounting/chart-of-accounts/[id]/audit-log | accounting | 1 | stub/placeholder |
| /accounting/core-accounting/chart-of-accounts/audit-log | accounting | 1 | stub/placeholder |
| /accounting/core-accounting/general-ledger | accounting, companies | 2 | partial |
| /accounting/core-accounting/journal-entries | accounting | 4 | partial |
| /accounting/core-accounting/journal-entries/[id] | accounting | 4 | stub/placeholder |
| /accounting/core-accounting/journal-entries/[id]/activity | (none detected) | 0 | stub/placeholder |
| /accounting/core-accounting/journal-entries/audit-log | accounting | 1 | stub/placeholder |
| /accounting/core-accounting/journal-entries/new | accounting, contacts | 3 | stub/placeholder |
| /accounting/fixed-assets/asset-lifecycle | (none detected) | 0 | stub/placeholder |
| /accounting/fixed-assets/asset-management | (none detected) | 0 | stub/placeholder |
| /accounting/fixed-assets/depreciation | (none detected) | 0 | stub/placeholder |
| /accounting/fixed-assets/insurance | (none detected) | 0 | stub/placeholder |
| /accounting/period-close/close-archive | (none detected) | 0 | stub/placeholder |
| /accounting/period-close/lock-period | (none detected) | 0 | stub/placeholder |
| /accounting/period-close/multi-currency-revaluation | (none detected) | 0 | stub/placeholder |
| /accounting/period-close/sign-offs | (none detected) | 0 | stub/placeholder |
| /apps-integrations/api/api-keys | (none detected) | 0 | stub/placeholder |
| /apps-integrations/api/webhooks | (none detected) | 0 | stub/placeholder |
| /apps-integrations/connected-apps/installed-apps | (none detected) | 0 | stub/placeholder |
| /apps-integrations/data-tools/export-data | (none detected) | 0 | stub/placeholder |
| /apps-integrations/developer-tools/developer-sandbox | (none detected) | 0 | stub/placeholder |
| /apps-integrations/discover/app-marketplace | (none detected) | 0 | stub/placeholder |
| /apps-integrations/imports/import-data | (none detected) | 0 | stub/placeholder |
| /apps-integrations/my-integrations/integration-logs | (none detected) | 0 | stub/placeholder |
| /automation/ai-intelligence/ai-bookkeeping | (none detected) | 0 | stub/placeholder |
| /automation/ai-intelligence/smart-matching | (none detected) | 0 | stub/placeholder |
| /automation/monitoring/automation-logs | (none detected) | 0 | stub/placeholder |
| /automation/monitoring/error-queue | (none detected) | 0 | stub/placeholder |
| /automation/workflow-engine/smart-rules | (none detected) | 0 | stub/placeholder |
| /automation/workflow-engine/workflow-builder | (none detected) | 0 | stub/placeholder |
| /banking-cash/bank-rules | (none detected) | 0 | ui-only/unknown |
| /banking-cash/bank-rules/csv-upload | (none detected) | 0 | ui-only/unknown |
| /banking-cash/bank-rules/rule-templates | (none detected) | 0 | ui-only/unknown |
| /banking-cash/bank-rules/rules | (none detected) | 0 | ui-only/unknown |
| /banking-cash/reconciliation | (none detected) | 0 | ui-only/unknown |
| /banking-cash/reconciliation/history | (none detected) | 0 | ui-only/unknown |
| /banking-cash/reconciliation/reconcile | (none detected) | 0 | stub/placeholder |
| /banking-cash/reconciliation/statements | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions | banking, companies | 8 | partial |
| /banking-cash/transactions/activity | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions/deposits | banking | 6 | partial |
| /banking-cash/transactions/match | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions/register | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions/rules | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions/split | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions/transfer | (none detected) | 0 | stub/placeholder |
| /banking-cash/transactions/undeposited-funds | banking | 1 | partial |
| /banking-cash/transactions/view-record | (none detected) | 0 | stub/placeholder |
| /compliance/controls/control-testing | (none detected) | 0 | stub/placeholder |
| /compliance/controls/internal-controls | (none detected) | 0 | stub/placeholder |
| /compliance/controls/policy-management | (none detected) | 0 | stub/placeholder |
| /compliance/monitoring/audit-log-analysis | (none detected) | 0 | stub/placeholder |
| /compliance/monitoring/fraud-detection-rules | (none detected) | 0 | stub/placeholder |
| /compliance/monitoring/issue-tracking | (none detected) | 0 | stub/placeholder |
| /expenses/expense-capture | (none detected) | 0 | ui-only/unknown |
| /expenses/expense-capture/expenses | (none detected) | 0 | stub/placeholder |
| /expenses/expense-capture/mileage | (none detected) | 0 | stub/placeholder |
| /expenses/expense-capture/per-diem | (none detected) | 0 | stub/placeholder |
| /expenses/expense-capture/receipts | (none detected) | 0 | stub/placeholder |
| /expenses/expense-capture/reimbursements | (none detected) | 0 | stub/placeholder |
| /expenses/payables | (none detected) | 0 | ui-only/unknown |
| /expenses/payables/bill-payments | ap, companies | 4 | partial |
| /expenses/payables/bills | ap, companies | 6 | partial |
| /expenses/payables/payment-runs | (none detected) | 0 | stub/placeholder |
| /expenses/payables/recurring-bills | (none detected) | 0 | stub/placeholder |
| /expenses/payables/vendor-credits | (none detected) | 0 | stub/placeholder |
| /expenses/purchasing | (none detected) | 0 | ui-only/unknown |
| /expenses/purchasing/approvals | (none detected) | 0 | stub/placeholder |
| /expenses/purchasing/orders | (none detected) | 0 | stub/placeholder |
| /expenses/purchasing/purchase-requests | (none detected) | 0 | stub/placeholder |
| /expenses/purchasing/rfq | (none detected) | 0 | stub/placeholder |
| /expenses/purchasing/vendors | contacts | 1 | partial |
| /home/business-health | (none detected) | 0 | stub/placeholder |
| /home/dashboard | unknown | 2 | real |
| /home/notifications | (none detected) | 0 | stub/placeholder |
| /home/performance | (none detected) | 0 | stub/placeholder |
| /home/setup-center | (none detected) | 0 | stub/placeholder |
| /home/shortcuts | (none detected) | 0 | stub/placeholder |
| /inventory/control | (none detected) | 0 | ui-only/unknown |
| /inventory/control/cycle-counts | (none detected) | 0 | stub/placeholder |
| /inventory/control/lot-serial-tracking | (none detected) | 0 | stub/placeholder |
| /inventory/control/physical-counts | (none detected) | 0 | stub/placeholder |
| /inventory/control/reorder-points | (none detected) | 0 | stub/placeholder |
| /inventory/items | (none detected) | 0 | ui-only/unknown |
| /inventory/items/bundles | (none detected) | 0 | stub/placeholder |
| /inventory/items/categories | (none detected) | 0 | stub/placeholder |
| /inventory/items/item-list | (none detected) | 0 | stub/placeholder |
| /inventory/items/units | (none detected) | 0 | stub/placeholder |
| /inventory/stock-operations | (none detected) | 0 | ui-only/unknown |
| /inventory/stock-operations/adjustments | (none detected) | 0 | stub/placeholder |
| /inventory/stock-operations/item-receipts | (none detected) | 0 | stub/placeholder |
| /inventory/stock-operations/stock-movements | (none detected) | 0 | stub/placeholder |
| /inventory/stock-operations/transfers | (none detected) | 0 | stub/placeholder |
| /inventory/valuation | (none detected) | 0 | ui-only/unknown |
| /inventory/valuation/cost-adjustments | (none detected) | 0 | stub/placeholder |
| /inventory/valuation/inventory-valuation | (none detected) | 0 | stub/placeholder |
| /inventory/valuation/landed-costs | (none detected) | 0 | stub/placeholder |
| /inventory/valuation/write-downs | (none detected) | 0 | stub/placeholder |
| /inventory/warehouses | (none detected) | 0 | ui-only/unknown |
| /inventory/warehouses/bin-locations | (none detected) | 0 | stub/placeholder |
| /inventory/warehouses/warehouse-list | (none detected) | 0 | stub/placeholder |
| /inventory/warehouses/zones | (none detected) | 0 | stub/placeholder |
| /organization/entity-structure/consolidation | (none detected) | 0 | stub/placeholder |
| /organization/entity-structure/intercompany | (none detected) | 0 | stub/placeholder |
| /organization/entity-structure/legal-entities | (none detected) | 0 | stub/placeholder |
| /organization/operational-structure/locations-divisions | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/compensation/allowances | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/compensation/benefit-plans | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/compensation/deductions | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/compensation/loans | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/compensation/salary-structures | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-processing/bonuses-commissions | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-processing/final-pay | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-adjustments | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-approvals | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-history | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-processing/payroll-runs | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-taxes/government-contributions | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-taxes/remittance-tracking | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/payroll-taxes/tax-withholding | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/time-leave/holiday-calendar | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/time-leave/leave-balances | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/time-leave/leave-requests | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/time-leave/shift-scheduling | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/workforce/employee-documents | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/workforce/employees | (none detected) | 0 | stub/placeholder |
| /payroll-workforce/workforce/job-positions | (none detected) | 0 | stub/placeholder |
| /projects/billing | (none detected) | 0 | ui-only/unknown |
| /projects/billing/change-orders | (none detected) | 0 | stub/placeholder |
| /projects/billing/progress-billing | (none detected) | 0 | stub/placeholder |
| /projects/billing/project-billing | (none detected) | 0 | stub/placeholder |
| /projects/billing/wip | (none detected) | 0 | stub/placeholder |
| /projects/financials | (none detected) | 0 | ui-only/unknown |
| /projects/financials/budget-vs-actual | (none detected) | 0 | stub/placeholder |
| /projects/financials/profitability | (none detected) | 0 | stub/placeholder |
| /projects/project-setup | (none detected) | 0 | ui-only/unknown |
| /projects/project-setup/contracts | (none detected) | 0 | stub/placeholder |
| /projects/project-setup/milestones | (none detected) | 0 | stub/placeholder |
| /projects/project-setup/projects | (none detected) | 0 | stub/placeholder |
| /projects/project-setup/templates | (none detected) | 0 | stub/placeholder |
| /projects/tasks | (none detected) | 0 | ui-only/unknown |
| /projects/tasks/resource-planning | (none detected) | 0 | stub/placeholder |
| /projects/tasks/schedule | (none detected) | 0 | stub/placeholder |
| /projects/tasks/task-list | (none detected) | 0 | stub/placeholder |
| /projects/tasks/time-expenses | (none detected) | 0 | stub/placeholder |
| /reporting/analytics/analytics-dashboards | (none detected) | 0 | stub/placeholder |
| /reporting/custom-reports | (none detected) | 0 | stub/placeholder |
| /reporting/custom-reports/report-builder | (none detected) | 0 | stub/placeholder |
| /reporting/custom-reports/scheduled-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/accountant-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/accountant-reports/general-ledger | accounting, companies | 2 | partial |
| /reporting/reports-center/accountant-reports/trial-balance | companies | 1 | real |
| /reporting/reports-center/banking-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/expense-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/financial-statements | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/financial-statements/balance-sheet | companies | 1 | real |
| /reporting/reports-center/financial-statements/cash-flow-statement | companies | 1 | real |
| /reporting/reports-center/financial-statements/profit-and-loss | companies | 1 | real |
| /reporting/reports-center/inventory-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/payroll-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/project-reports | (none detected) | 0 | stub/placeholder |
| /reporting/reports-center/sales-reports | (none detected) | 0 | stub/placeholder |
| /sales/billing | (none detected) | 0 | ui-only/unknown |
| /sales/billing/invoices | ar | 4 | partial |
| /sales/billing/invoices/new | ar, companies, inventory | 5 | partial |
| /sales/billing/payment-links | companies, integrations | 2 | partial |
| /sales/billing/recurring | ar | 5 | partial |
| /sales/collections | (none detected) | 0 | ui-only/unknown |
| /sales/collections/aging | ar | 2 | partial |
| /sales/collections/center | ar, integrations | 6 | partial |
| /sales/collections/dunning | ar, companies | 5 | partial |
| /sales/collections/payments | ar, banking | 7 | partial |
| /sales/collections/refunds | ar | 5 | partial |
| /sales/collections/write-offs | ar | 6 | partial |
| /sales/customers | ar | 8 | partial |
| /sales/customers/[id] | ar | 3 | partial |
| /sales/customers/activity | ar | 1 | partial |
| /sales/customers/groups | ar, integrations | 5 | partial |
| /sales/customers/groups/[id] | ar | 3 | partial |
| /sales/customers/portal | companies | 1 | partial |
| /sales/revenue | (none detected) | 0 | ui-only/unknown |
| /sales/revenue/credit-notes | ar | 8 | partial |
| /sales/revenue/deferred | companies | 3 | partial |
| /sales/revenue/recognition | companies | 3 | partial |
| /sales/sales | (none detected) | 0 | ui-only/unknown |
| /sales/sales/orders | ar | 6 | partial |
| /sales/sales/pipeline | companies, integrations | 3 | real |
| /sales/sales/products-services | inventory | 2 | partial |
| /sales/sales/products-services/[id] | inventory | 1 | real |
| /sales/sales/quotes | ar | 9 | partial |
| /settings/accounting-preferences | companies | 2 | real |
| /settings/company-profile/company-details | (none detected) | 0 | stub/placeholder |
| /settings/company-profile/fiscal-year-setup | (none detected) | 0 | stub/placeholder |
| /settings/customization/custom-fields | (none detected) | 0 | stub/placeholder |
| /settings/data-privacy/audit-log | (none detected) | 0 | stub/placeholder |
| /settings/data-privacy/data-backup | (none detected) | 0 | stub/placeholder |
| /settings/entity-management/base-currency | (none detected) | 0 | stub/placeholder |
| /settings/entity-management/numbering-sequences | (none detected) | 0 | stub/placeholder |
| /settings/users-security/roles-permissions | (none detected) | 0 | stub/placeholder |
| /settings/users-security/two-factor-auth | (none detected) | 0 | stub/placeholder |
| /settings/users-security/user-management | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/management/approval-history | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/management/approval-queue | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/management/delegated-tasks | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/management/task-templates | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/management/team-tasks | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/my-work/calendar | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/my-work/my-approvals | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/my-work/my-exceptions | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/my-work/my-tasks | (none detected) | 0 | stub/placeholder |
| /tasks-approvals/my-work/overdue-items | (none detected) | 0 | stub/placeholder |
| /taxes/filing-payments/e-filing | (none detected) | 0 | stub/placeholder |
| /taxes/filing-payments/tax-returns | (none detected) | 0 | stub/placeholder |
| /taxes/tax-center/filing-payments | (none detected) | 0 | stub/placeholder |
| /taxes/tax-center/tax-calendar | (none detected) | 0 | stub/placeholder |
| /taxes/tax-center/tax-dashboard | (none detected) | 0 | stub/placeholder |
| /taxes/tax-center/tax-liabilities | (none detected) | 0 | stub/placeholder |
| /taxes/tax-reporting/tax-summary | (none detected) | 0 | stub/placeholder |
| /taxes/tax-reporting/vat-payable | (none detected) | 0 | stub/placeholder |
| /taxes/tax-setup/tax-agencies | (none detected) | 0 | stub/placeholder |
| /taxes/tax-setup/tax-rates | (none detected) | 0 | stub/placeholder |
| /time/entry | (none detected) | 0 | ui-only/unknown |
| /time/entry/time-entries | (none detected) | 0 | stub/placeholder |
| /time/entry/timer | (none detected) | 0 | stub/placeholder |
| /time/entry/timesheets | (none detected) | 0 | stub/placeholder |
| /time/review | (none detected) | 0 | ui-only/unknown |
| /time/review/billable-time-review | (none detected) | 0 | stub/placeholder |
| /time/review/time-approvals | (none detected) | 0 | stub/placeholder |

### 5.2 Top Module Reach Across Owner Pages

| Module | PageCount |
| --- | --- |
| companies | 17 |
| ar | 17 |
| accounting | 10 |
| banking | 4 |
| integrations | 4 |
| inventory | 3 |
| contacts | 2 |
| ap | 2 |
| unknown | 1 |

### 5.3 Known High-Value Flow Chains

- Sales Payments -> Banking Deposits -> GL Journal Entries (AR module + Banking module + SubLedger/Accounting integration).
- Sales Invoices/Collections -> AR activity and audit feeds -> Integrations audit-log endpoint usage.
- AP Bills/Payments -> Expense module -> Accounting/GL posting dependencies.
- Onboarding -> Workspace/Company creation -> COA seed -> optional bank account provisioning.

## 6) Seed Data Dependency Scan (enhanced)

- Total inferred seed gaps: 5
| Category | Source | EndpointOrField | ExpectedModel | Seeded |
| --- | --- | --- | --- | --- |
| dropdown-endpoint | Haypbooks/Frontend/src/components/sales/ProductFormModal.tsx | /companies/:param/inventory/items/:param | item | false |
| gl-account-constant | Haypbooks/Backend/src/tax/tax.service.ts | code:1200 | account | false |
| gl-account-constant | Haypbooks/Backend/src/tax/tax.service.ts | code:2050 | account | false |
| gl-account-constant | Haypbooks/Backend/src/accounting/accounting.service.ts | name:Accounts Payable | account | false |
| gl-account-constant | Haypbooks/Backend/src/accounting/accounting.service.ts | name:Sales Revenue | account | false |

### 6.1 Dropdown/List Endpoint Dependencies

- Count: 5
| Component | Endpoint | ExpectedModel | Seeded |
| --- | --- | --- | --- |
| Haypbooks/Frontend/src/components/accounting/ChartOfAccountsPage.tsx | /companies/:param/accounting/accounts/:param | account | true |
| Haypbooks/Frontend/src/components/sales/CustomerDetailPage.tsx | /companies/:param/ar/customers/:param | customer | true |
| Haypbooks/Frontend/src/components/sales/CustomersPage.tsx | /companies/:param/ar/customers/:param | customer | true |
| Haypbooks/Frontend/src/components/sales/InvoiceDetailPage.tsx | /companies/:param/ar/invoices/:param | invoice | true |
| Haypbooks/Frontend/src/components/sales/ProductFormModal.tsx | /companies/:param/inventory/items/:param | item | false |

### 6.2 FK Field Dependencies in Forms

- Count: 16
| Component | FKField | ExpectedModel | Seeded |
| --- | --- | --- | --- |
| Haypbooks/Frontend/src/components/accounting/GeneralLedgerPage.tsx | accountId | account | true |
| Haypbooks/Frontend/src/components/accounting/JournalEntriesPage.tsx | accountId | account | true |
| Haypbooks/Frontend/src/components/accounting/TrialBalancePage.tsx | accountId | account | true |
| Haypbooks/Frontend/src/components/banking/BankDepositsPage.tsx | bankAccountId | bankAccount | true |
| Haypbooks/Frontend/src/components/banking/BankReconciliationPage.tsx | bankAccountId | bankAccount | true |
| Haypbooks/Frontend/src/components/banking/BankReconciliationPage.tsx | accountId | account | true |
| Haypbooks/Frontend/src/components/banking/BankTransactionsPage.tsx | accountId | account | true |
| Haypbooks/Frontend/src/components/expenses/VendorsPage.tsx | taxId | taxRate | true |
| Haypbooks/Frontend/src/components/owner/AccountAuditLog.tsx | accountId | account | true |
| Haypbooks/Frontend/src/components/owner/CustomersCrudPage.tsx | taxId | taxRate | true |
| Haypbooks/Frontend/src/components/owner/DepositsCrudPage.tsx | bankAccountId | bankAccount | true |
| Haypbooks/Frontend/src/components/owner/VendorsCrudPage.tsx | taxId | taxRate | true |
| Haypbooks/Frontend/src/components/PracticeOnboarding/TaxCompliance.tsx | taxId | taxRate | true |
| Haypbooks/Frontend/src/components/sales/CustomerPaymentsPage.tsx | bankAccountId | bankAccount | true |
| Haypbooks/Frontend/src/components/sales/CustomerPaymentsPage.tsx | paymentMethodId | paymentMethod | true |
| Haypbooks/Frontend/src/components/sales/InvoicesPage.tsx | accountId | account | true |

### 6.3 Expected GL Account Constants (Name/Code)

- Count: 9
| SourceFile | IndicatorType | Indicator | Seeded |
| --- | --- | --- | --- |
| Haypbooks/Backend/src/general-ledger/dto/gl-query.dto.ts | code | 1010 | true |
| Haypbooks/Backend/src/tax/tax.service.ts | code | 1200 | false |
| Haypbooks/Backend/src/tax/tax.service.ts | code | 2050 | false |
| Haypbooks/Backend/src/accounting/accounting.service.ts | name | Accounts Payable | false |
| Haypbooks/Backend/src/accounting/accounting.service.ts | name | Accounts Receivable | true |
| Haypbooks/Backend/src/accounting/accounting.service.ts | name | Cash | true |
| Haypbooks/Backend/src/accounting/accounting.service.ts | name | Sales Revenue | false |
| Haypbooks/Backend/src/accounting/accounting.service.ts | name | Service Revenue | true |
| Haypbooks/Backend/src/accounting/accounting.service.ts | name | Undeposited Funds | true |

### Additional Seed Risk Notes

- Seed script logs non-fatal legacy-schema warnings; some relational links can remain missing in partially migrated local DBs.
- Many Owner pages are UI-only or placeholder and may need manual data setup before meaningful testing.
- If workspace/company currency is blank in demo company rows, account currency falls back to workspace base currency or USD.

## 7) Missing Pieces / Mismatch Scan

### 7.1 Frontend endpoint patterns without backend route match (inferred)

- Count: 19
- Showing first 19 patterns (see JSON artifact for full set).

- /api/companies/:param/accounts
- /api/companies/:param/ap/vendor-credits
- /api/companies/:param/ar/dunning/:param/activity
- /api/companies/:param/ar/refunds/:param/activity
- /api/companies/:param/ar/write-offs/:param/activity
- /api/companies/:param/banking
- /api/companies/:param/bill-payments/:param/void
- /api/companies/:param/bills/:param/approve
- /api/companies/:param/bills/:param/void
- /api/companies/:param/deferred-revenue/:param/activity
- /api/companies/:param/employees
- /api/companies/:param/expense-capture/expenses
- /api/companies/:param/expense-capture/mileage
- /api/companies/:param/expense-capture/receipts
- /api/companies/:param/expense-capture/reimbursements
- /api/companies/:param/purchase-orders
- /api/companies/:param/revenue-recognition/:param/activity
- /api/periods
- /api/user/profile

### 7.2 Unused Backend Routes Triaged by Module

- Total unused backend route patterns: 306
- Classified as Backend-only: 38
- Classified as Missing UI: 268

| Module | Total | BackendOnly | MissingUI |
| --- | --- | --- | --- |
| accounting | 8 | 2 | 6 |
| ap | 11 | 0 | 11 |
| ar | 9 | 0 | 9 |
| attachments | 3 | 3 | 0 |
| auth | 18 | 18 | 0 |
| banking | 21 | 5 | 16 |
| companies | 27 | 4 | 23 |
| contacts | 2 | 0 | 2 |
| financial-services | 12 | 0 | 12 |
| general-ledger | 2 | 0 | 2 |
| health | 3 | 3 | 0 |
| integrations | 9 | 1 | 8 |
| inventory | 22 | 0 | 22 |
| onboarding | 2 | 1 | 1 |
| organization | 10 | 0 | 10 |
| owner | 1 | 0 | 1 |
| payroll | 25 | 0 | 25 |
| practice | 3 | 0 | 3 |
| practice-hub | 5 | 0 | 5 |
| projects | 14 | 0 | 14 |
| reporting | 7 | 0 | 7 |
| sales | 7 | 0 | 7 |
| tasks | 3 | 0 | 3 |
| tax | 42 | 1 | 41 |
| tenants | 3 | 0 | 3 |
| test | 22 | 0 | 22 |
| time | 14 | 0 | 14 |
| users | 1 | 0 | 1 |

### 7.3 Route-Level Triage (Grouped)

#### Module: accounting

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/accounting/close-workflow | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/accounting/close-workflow/complete | POST | Backend-only | Single-purpose command endpoint likely used by orchestration jobs or admin flows. |
| /api/accounting/close-workflow/run | POST | Backend-only | Single-purpose command endpoint likely used by orchestration jobs or admin flows. |
| /api/accounting/coa-templates | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/accounting/account-types | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/accounting/accounts/:accountId/ledger | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/accounting/coa-templates | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/accounting/period-close/multi-currency-revaluation | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: ap

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/ap/bill-payments/:paymentId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/bill-payments/:paymentId/void | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/bills/:billId | GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/bills/:billId/approve | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/bills/:billId/void | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/purchase-orders | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/purchase-orders/:poId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/purchase-orders/:poId/convert | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/purchase-orders/:poId/status | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/vendors | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ap/vendors/:contactId | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: ar

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/ar/aging | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/customers/batch/group | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/deferred-revenue | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/deferred-revenue/:id/recognize | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/payment-links | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/payments/:paymentId/apply | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/refunds/:id | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/revenue-recognition | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/ar/revenue-recognition/:id/recognize | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: attachments

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/attachments | GET, POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/attachments/:id | DELETE | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/attachments/:id/public | PATCH | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |

#### Module: auth

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/auth/complete-signup | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/email/send-code | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/email/verify-code | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/forgot-password | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/login | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/phone/send-code | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/phone/verify-code | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/pre-signup | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/refresh | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/reset-password | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/security-events | GET | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/send-verification | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/sessions | GET | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/sessions/revoke | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/sessions/revoke-all | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/signup | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/verify-email | GET | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |
| /api/auth/verify-otp | POST | Backend-only | Auth/attachment infrastructure endpoint is typically consumed outside owner pages. |

#### Module: banking

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/bank-accounts | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/accounts/:bankAccountId | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/accounts/:bankAccountId/reconciliations | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/accounts/:bankAccountId/transactions/:transactionId/split | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/cash-position | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/checks/:checkId | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/credit-cards/:cardId/statements | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/feed-connections | GET, POST | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:companyId/banking/feed-connections/:id | DELETE, PUT | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:companyId/banking/feed-connections/:id/sync | POST | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:companyId/banking/feed-status | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:companyId/banking/reconciliations/:reconId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/reconciliations/:reconId/adjustment | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/reconciliations/:reconId/auto-match | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/reconciliations/:reconId/complete | POST | Backend-only | Single-purpose command endpoint likely used by orchestration jobs or admin flows. |
| /api/companies/:companyId/banking/reconciliations/:reconId/discrepancies | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/reconciliations/:reconId/match | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/reconciliations/:reconId/match/:bankTransactionId | DELETE | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/reconciliations/:reconId/undo | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/smart-rules | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/banking/smart-rules/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: companies

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/customers/:contactId | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/invoices/:invoiceId | GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payments/:paymentId | GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/quotes/:quoteId | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/:entryId | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/dashboard/cash-position | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/dashboard/payables | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/dashboard/receivables | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/dashboard/recent-transactions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/dashboard/summary | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/dashboard/upcoming | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/health/liquidity | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:id/health/metrics | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:id/health/profitability | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:id/health/trends | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/companies/:id/invites | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/invites/:inviteId | DELETE, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/overdue/all | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/overdue/bills | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/overdue/invoices | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/roles | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/users | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/users/:targetUserId | DELETE, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/users/:targetUserId/role | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:id/workspace-users | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/workspace/capabilities | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: contacts

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/contacts/customers/:id | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/contacts/vendors/:id | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: financial-services

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/financial-services/bank-accounts | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/cash-flow | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/cash-runway | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/checking-account | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/credit-lines | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/credit-score | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/investments | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/loans | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/merchant-services | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/revenue-forecast | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/savings-accounts | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/financial-services/transactions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: general-ledger

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/general-ledger/account-list | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/general-ledger/summary | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: health

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/health | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/health/live | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |
| /api/health/ready | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |

#### Module: integrations

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/integrations/ai/insights | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/ai/insights/:insightId | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/ai/insights/:insightId/dismiss | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/ai/insights/:insightId/resolve | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/ai/insights/generate | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/api-keys | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/api-keys/:keyId | DELETE | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/bank-feed/connections | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/integrations/bank-feed/imports | GET | Backend-only | Route pattern suggests integration/system processing rather than owner-facing UI. |

#### Module: inventory

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/inventory/asset-categories | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/asset-categories/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/assets | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/assets/:assetId | GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/assets/:assetId/depreciate | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/assets/:assetId/dispose | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/assets/:assetId/schedule | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/backorders | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/bin-locations | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/items/batch/delete | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/items/batch/status | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/locations | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/locations/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/lot-serial | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/physical-counts | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/physical-counts/:countId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/reorder-rules | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/reorder-rules/:id | PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/stock | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/transactions | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/units-of-measure | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/inventory/units-of-measure/:id | PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: onboarding

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/onboarding/complete | POST | Backend-only | Single-purpose command endpoint likely used by orchestration jobs or admin flows. |
| /api/onboarding/save | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: organization

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/organization/consolidation | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/departments | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/departments/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/filing-calendar | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/filing-calendar/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/intercompany | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/legal-entities | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/legal-entities/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/locations | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/organization/locations/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: owner

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/owner/dashboard | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: payroll

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/payroll/allowances | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/allowances/:id | DELETE, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/benefit-plans | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/benefit-plans/:id | PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/deductions | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/employees | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/employees/:employeeId | GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/employees/:employeeId/terminate | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/government-contributions | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/leave-balances | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/leave-requests | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/leave-requests/:id/approve | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/leave-requests/:id/reject | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/loans | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/paychecks | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/paychecks/:paycheckId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/runs | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/runs/:runId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/runs/:runId/post | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/runs/:runId/process | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/runs/:runId/void | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/salary-structures | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/salary-structures/:id | PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/shift-schedules | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payroll/summary | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: practice

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/practices | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/practices/clients | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/practices/dashboard | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: practice-hub

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/practice-hub/activity | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/practice-hub/clients | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/practice-hub/dashboard | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/practice-hub/deadlines | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/practice-hub/stats | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: projects

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/projects | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/budget | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/expenses | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/milestones | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/milestones/:milestoneId | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/profitability | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/tasks | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/time-entries | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/:projectId/wip | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/resource-plans | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/resource-plans/:id | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/retainers | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/retainers/:id | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/projects/wip | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: reporting

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/reports/budgets | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/reports/budgets/:budgetId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/reports/budgets/:budgetId/vs-actual | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/reports/dashboards | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/reports/esg | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/reports/kpis | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/reports/snapshots | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: sales

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/invoices/:invoiceId/send | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/invoices/:invoiceId/void | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payment-terms | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payments | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/payments/:paymentId/void | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/quotes/:quoteId/convert | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/subscriptions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: tasks

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/tasks | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/tasks/:id | GET, PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/tasks/:id/comments | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: tax

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/agencies | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/alphalist | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/alphalist/generate | POST | Backend-only | Single-purpose command endpoint likely used by orchestration jobs or admin flows. |
| /api/audit-trail | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/bir-forms | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/bir-forms/:formType | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/calendar | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/codes | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/creditable-withholding | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/deferred-tax | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/e-filing | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/exemptions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/expanded-withholding | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/filing-batch | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/filing-history | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/form-2307 | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/form-2307/:formId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/form-2307/:formId/status | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/income-tax | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/jurisdictions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/liability | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/multi-jurisdiction | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/output-tax-ledger | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/payments | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/percentage-tax | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/percentage-tax/:id | PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/rates | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/reconciliation | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/remittances | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/summary | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/tax-returns | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/transfer-pricing | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/vat-returns | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/vat-returns/:returnId | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/vat-returns/:returnId/file | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/withholding | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/withholding-setup | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/withholding/:id | PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/year-end/adjustments | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/year-end/annual-summary | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/year-end/closing-entries | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/zero-rated-exempt | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: tenants

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/tenants | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/tenants/:tenantId/access | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/tenants/invites/:inviteId/decline | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: test

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/test/check-user-verification | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/companies | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/create-company | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/create-new-workspace | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/create-otp | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/create-otps | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/create-user | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/debug/refresh | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/delete-company | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/echo-headers | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/force-complete-onboarding | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/force-complete-signup | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/force-run-onboarding | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/force-verify-user | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/journal-entries | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/otp/latest | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/session/find-by-refresh | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/sessions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/set-trial | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/update-user | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/user | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/test/users | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: time

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/companies/:companyId/time | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/:timesheetId/approve | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/:timesheetId/reject | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/billable | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/entries | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/entries/:entryId | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timer/sessions | GET | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timer/start | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timer/stop | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timesheets | DELETE, GET, POST, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timesheets/:timesheetId | GET, POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timesheets/:timesheetId/approve | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/timesheets/:timesheetId/reject | POST | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |
| /api/companies/:companyId/time/utilization | DELETE, GET, PUT | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

#### Module: users

| Path | Methods | Classification | Reason |
| --- | --- | --- | --- |
| /api/users/profile | PATCH | Missing UI | Business endpoint appears owner-relevant but no owner page currently calls it. |

## Top Gaps / Gotchas Summary

- Owner hub surface area is very large (200+ pages); many are wrappers/placeholders, so ticket-level work can miss prerequisite setup assumptions.
- Banking deposit flow depends on seeded/default bank accounts; without this, dropdowns are empty and flow appears broken.
- GL posting paths rely on specific system COA codes (e.g., 1010/1050/1100), so seed consistency is critical for end-to-end behavior.
- Endpoint-to-UI coverage is uneven: 268 unmatched backend routes look owner-relevant (Missing UI), while 38 appear intentionally backend-only.
