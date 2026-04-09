from pathlib import Path
routes=[
    ('Accounting','Fixed Assets','Asset Register','/accounting/fixed-assets/asset-management/asset-register','src/app/(owner)/accounting/fixed-assets/asset-management/asset-register/page.tsx'),
    ('Accounting','Fixed Assets','Categories','/accounting/fixed-assets/asset-management/asset-categories','src/app/(owner)/accounting/fixed-assets/asset-management/asset-categories/page.tsx'),
    ('Accounting','Fixed Assets','Locations','/accounting/fixed-assets/asset-management/asset-locations','src/app/(owner)/accounting/fixed-assets/asset-management/asset-locations/page.tsx'),
    ('Accounting','Fixed Assets','Depreciation Schedules','/accounting/fixed-assets/depreciation/schedules','src/app/(owner)/accounting/fixed-assets/depreciation/schedules/page.tsx'),
    ('Accounting','Fixed Assets','Depreciation Runs','/accounting/fixed-assets/depreciation/runs','src/app/(owner)/accounting/fixed-assets/depreciation/runs/page.tsx'),
    ('Accounting','Fixed Assets','Depreciation Reports','/accounting/fixed-assets/depreciation/reports','src/app/(owner)/accounting/fixed-assets/depreciation/reports/page.tsx'),
    ('Accounting','Fixed Assets','Disposals','/accounting/fixed-assets/lifecycle/disposals','src/app/(owner)/accounting/fixed-assets/lifecycle/disposals/page.tsx'),
    ('Accounting','Fixed Assets','Impairments','/accounting/fixed-assets/lifecycle/impairments','src/app/(owner)/accounting/fixed-assets/lifecycle/impairments/page.tsx'),
    ('Accounting','Fixed Assets','Revaluations','/accounting/fixed-assets/lifecycle/revaluations','src/app/(owner)/accounting/fixed-assets/lifecycle/revaluations/page.tsx'),
    ('Accounting','Fixed Assets','Maintenance','/accounting/fixed-assets/lifecycle/maintenance','src/app/(owner)/accounting/fixed-assets/lifecycle/maintenance/page.tsx'),
    ('Accounting','Fixed Assets','Transfers','/accounting/fixed-assets/lifecycle/transfers','src/app/(owner)/accounting/fixed-assets/lifecycle/transfers/page.tsx'),
    ('Accounting','Fixed Assets','Asset Insurance','/accounting/fixed-assets/insurance/asset-insurance','src/app/(owner)/accounting/fixed-assets/insurance/asset-insurance/page.tsx'),
    ('Accounting','Fixed Assets','Coverage Tracking','/accounting/fixed-assets/insurance/coverage-tracking','src/app/(owner)/accounting/fixed-assets/insurance/coverage-tracking/page.tsx'),
    ('Accounting','Fixed Assets','Premium Management','/accounting/fixed-assets/insurance/premium-management','src/app/(owner)/accounting/fixed-assets/insurance/premium-management/page.tsx'),
    ('Accounting','Fixed Assets','Fixed Asset Schedule','/accounting/fixed-assets/reports/fixed-asset-schedule','src/app/(owner)/accounting/fixed-assets/reports/fixed-asset-schedule/page.tsx'),
    ('Accounting','Fixed Assets','Depreciation Summary','/accounting/fixed-assets/reports/depreciation-summary','src/app/(owner)/accounting/fixed-assets/reports/depreciation-summary/page.tsx'),
    ('Accounting','Fixed Assets','Asset Valuation','/accounting/fixed-assets/reports/asset-valuation','src/app/(owner)/accounting/fixed-assets/reports/asset-valuation/page.tsx'),
    ('Accounting','Fixed Assets','Gain/Loss Disposal','/accounting/fixed-assets/reports/gain-loss-disposal','src/app/(owner)/accounting/fixed-assets/reports/gain-loss-disposal/page.tsx'),
    ('Accounting','Planning','Budgets','/accounting/planning/budgets','src/app/(owner)/accounting/planning/budgets/page.tsx'),
    ('Accounting','Planning','Budget vs Actual','/accounting/planning/budget-vs-actual','src/app/(owner)/accounting/planning/budget-vs-actual/page.tsx'),
    ('Accounting','Period Close','Close Checklist','/accounting/period-close/close-checklist','src/app/(owner)/accounting/period-close/close-checklist/page.tsx'),
    ('Accounting','Period Close','Reconciliations','/accounting/period-close/reconciliations','src/app/(owner)/accounting/period-close/reconciliations/page.tsx'),
    ('Accounting','Period Close','Adjustments','/accounting/period-close/adjustments','src/app/(owner)/accounting/period-close/adjustments/page.tsx'),
    ('Accounting','Period Close','Multi-Currency Revaluation','/accounting/period-close/multi-currency-revaluation','src/app/(owner)/accounting/period-close/multi-currency-revaluation/page.tsx'),
    ('Accounting','Period Close','Lock Period','/accounting/period-close/lock-period','src/app/(owner)/accounting/period-close/lock-period/page.tsx'),
    ('Accounting','Period Close','Sign-Offs','/accounting/period-close/sign-offs','src/app/(owner)/accounting/period-close/sign-offs/page.tsx'),
    ('Accounting','Period Close','Close Archive','/accounting/period-close/close-archive','src/app/(owner)/accounting/period-close/close-archive/page.tsx'),
    ('Accounting','Allocations','Allocation Rules','/accounting/allocations/allocation-rules','src/app/(owner)/accounting/allocations/allocation-rules/page.tsx'),
    ('Accounting','Allocations','Allocation Runs','/accounting/allocations/run-allocations','src/app/(owner)/accounting/allocations/run-allocations/page.tsx'),
    ('Accounting','Allocations','Allocation History','/accounting/allocations/allocation-history','src/app/(owner)/accounting/allocations/allocation-history/page.tsx'),
    ('Accounting','Revaluations','FX Revaluation','/accounting/revaluations/fx-revaluation','src/app/(owner)/accounting/revaluations/fx-revaluation/page.tsx'),
    ('Accounting','Revaluations','Revaluation Schedule','/accounting/revaluations/revaluation-schedule','src/app/(owner)/accounting/revaluations/revaluation-schedule/page.tsx'),
    ('Accounting','Revaluations','Revaluation History','/accounting/revaluations/revaluation-history','src/app/(owner)/accounting/revaluations/revaluation-history/page.tsx'),
    ('Banking','Bank Connections','Connected Banks','/banking-cash/bank-connections/connected-banks','src/app/(owner)/banking-cash/bank-connections/connected-banks/page.tsx'),
    ('Banking','Transactions','Bank Transactions','/banking-cash/transactions/bank-transactions','src/app/(owner)/banking-cash/transactions/bank-transactions/page.tsx'),
    ('Banking','Transactions','App Transactions','/banking-cash/transactions/app-transactions','src/app/(owner)/banking-cash/transactions/app-transactions/page.tsx'),
    ('Banking','Transactions','Transaction Rules','/banking-cash/transactions/transaction-rules','src/app/(owner)/banking-cash/transactions/transaction-rules/page.tsx'),
    ('Banking','Transactions','Recurring Transactions','/banking-cash/transactions/recurring-transactions','src/app/(owner)/banking-cash/transactions/recurring-transactions/page.tsx'),
    ('Banking','Reconciliation','Reconcile','/banking-cash/reconciliation/reconcile','src/app/(owner)/banking-cash/reconciliation/reconcile/page.tsx'),
    ('Banking','Reconciliation','History','/banking-cash/reconciliation/history','src/app/(owner)/banking-cash/reconciliation/history/page.tsx'),
    ('Banking','Reconciliation','Statement Archive','/banking-cash/reconciliation/statement-archive','src/app/(owner)/banking-cash/reconciliation/statement-archive/page.tsx'),
    ('Banking','Reconciliation','Reports','/banking-cash/reconciliation/reports','src/app/(owner)/banking-cash/reconciliation/reports/page.tsx'),
    ('Banking','Cash Accounts','Bank Accounts','/banking-cash/cash-accounts/bank-accounts','src/app/(owner)/banking-cash/cash-accounts/bank-accounts/page.tsx'),
    ('Banking','Cash Accounts','Petty Cash','/banking-cash/cash-accounts/petty-cash','src/app/(owner)/banking-cash/cash-accounts/petty-cash/page.tsx'),
    ('Banking','Cash Accounts','Clearing Accounts','/banking-cash/cash-accounts/clearing-accounts','src/app/(owner)/banking-cash/cash-accounts/clearing-accounts/page.tsx'),
    ('Banking','Deposits','Undeposited Funds','/banking-cash/deposits/undeposited-funds','src/app/(owner)/banking-cash/deposits/undeposited-funds/page.tsx'),
    ('Banking','Deposits','Bank Deposits','/banking-cash/deposits/bank-deposits','src/app/(owner)/banking-cash/deposits/bank-deposits/page.tsx'),
    ('Banking','Deposits','Deposit Slips','/banking-cash/deposits/deposit-slips','src/app/(owner)/banking-cash/deposits/deposit-slips/page.tsx'),
    ('Banking','Bank Feeds','Feed Connections','/banking-cash/bank-feeds/feed-connections','src/app/(owner)/banking-cash/bank-feeds/feed-connections/page.tsx'),
    ('Banking','Bank Feeds','Import Rules','/banking-cash/bank-feeds/import-rules','src/app/(owner)/banking-cash/bank-feeds/import-rules/page.tsx'),
    ('Banking','Bank Feeds','Feed Status','/banking-cash/bank-feeds/feed-status','src/app/(owner)/banking-cash/bank-feeds/feed-status/page.tsx'),
    ('Banking','Credit Cards','Credit Card Accounts','/banking-cash/credit-cards/credit-card-accounts','src/app/(owner)/banking-cash/credit-cards/credit-card-accounts/page.tsx'),
    ('Banking','Credit Cards','Card Transactions','/banking-cash/credit-cards/card-transactions','src/app/(owner)/banking-cash/credit-cards/card-transactions/page.tsx'),
    ('Banking','Credit Cards','Card Statements','/banking-cash/credit-cards/card-statements','src/app/(owner)/banking-cash/credit-cards/card-statements/page.tsx'),
    ('Banking','Checks','Check Register','/banking-cash/checks/check-register','src/app/(owner)/banking-cash/checks/check-register/page.tsx'),
    ('Banking','Checks','Check Printing','/banking-cash/checks/check-printing','src/app/(owner)/banking-cash/checks/check-printing/page.tsx'),
    ('Banking','Checks','Stop Payments','/banking-cash/checks/stop-payments','src/app/(owner)/banking-cash/checks/stop-payments/page.tsx'),
    ('Banking','Cash Management','Cash Position','/banking-cash/cash-management/cash-position','src/app/(owner)/banking-cash/cash-management/cash-position/page.tsx'),
    ('Banking','Cash Management','Short-term Forecast','/banking-cash/cash-management/short-term-forecast','src/app/(owner)/banking-cash/cash-management/short-term-forecast/page.tsx'),
    ('Banking','Cash Management','Cash Flow Projection','/banking-cash/cash-management/cash-flow-projection','src/app/(owner)/banking-cash/cash-management/cash-flow-projection/page.tsx'),
    ('Banking','Treasury','Intercompany Transfers','/banking-cash/treasury/intercompany-transfers','src/app/(owner)/banking-cash/treasury/intercompany-transfers/page.tsx'),
    ('Banking','Treasury','Internal Loans','/banking-cash/treasury/internal-loans','src/app/(owner)/banking-cash/treasury/internal-loans/page.tsx'),
    ('Banking','Treasury','Credit Lines','/banking-cash/treasury/credit-lines','src/app/(owner)/banking-cash/treasury/credit-lines/page.tsx'),
    ('Banking','Treasury','Payment Approvals','/banking-cash/treasury/payment-approvals','src/app/(owner)/banking-cash/treasury/payment-approvals/page.tsx'),
    ('Sales','Customers','Customers','/sales/customers/customers','src/app/(owner)/sales/customers/customers/page.tsx'),
    ('Sales','Customers','Customer Groups','/sales/customers/customer-groups','src/app/(owner)/sales/customers/customer-groups/page.tsx'),
    ('Sales','Customers','Customer Documents','/sales/customers/customer-documents','src/app/(owner)/sales/customers/customer-documents/page.tsx'),
    ('Sales','Customers','Price Lists','/sales/customers/price-lists','src/app/(owner)/sales/customers/price-lists/page.tsx'),
    ('Sales','Customers','Customer Portal','/sales/customers/customer-portal','src/app/(owner)/sales/customers/customer-portal/page.tsx'),
    ('Sales','Sales Ops','Products & Services','/sales/sales-operations/products-services','src/app/(owner)/sales/sales-operations/products-services/page.tsx'),
    ('Sales','Sales Ops','Quotes & Estimates','/sales/sales-operations/quotes-estimates','src/app/(owner)/sales/sales-operations/quotes-estimates/page.tsx'),
    ('Sales','Sales Ops','Sales Orders','/sales/sales-operations/sales-orders','src/app/(owner)/sales/sales-operations/sales-orders/page.tsx'),
    ('Sales','Billing','Invoices','/sales/billing/invoices','src/app/(owner)/sales/billing/invoices/page.tsx'),
    ('Sales','Billing','Recurring Invoices','/sales/billing/recurring-invoices','src/app/(owner)/sales/billing/recurring-invoices/page.tsx'),
    ('Sales','Billing','Credit Notes','/sales/billing/credit-notes','src/app/(owner)/sales/billing/credit-notes/page.tsx'),
    ('Sales','Billing','Payment Links','/sales/billing/payment-links','src/app/(owner)/sales/billing/payment-links/page.tsx'),
    ('Sales','Billing','Customer Statements','/sales/billing/customer-statements','src/app/(owner)/sales/billing/customer-statements/page.tsx'),
]
print('| Module | Subsection | Page Name | Route URL | Status | Notes |')
print('|---|---|---|---|---|---|')
for module, sub, name, route, path in routes:
    p = Path(path)
    if not p.exists():
        print(f'| {module} | {sub} | {name} | {route} | ❌ | MISSING FILE {path} |')
        continue
    text = p.read_text(encoding='utf-8', errors='ignore')
    if 'PageDocumentation' in text or 'Content is coming soon' in text:
        print(f'| {module} | {sub} | {name} | {route} | ❌ | PageDocumentation placeholder found |')
        continue
    if '<table' in text.lower() or 'className="w-full text-sm"' in text or 'className="table' in text.lower():
        print(f'| {module} | {sub} | {name} | {route} | ✅ | Table in implementation found |')
    elif 'useMemo' in text or 'rows:' in text:
        print(f'| {module} | {sub} | {name} | {route} | ✅ | Data rows implementation found |')
    else:
        print(f'| {module} | {sub} | {name} | {route} | ❌ | no table/data rows detected |')
