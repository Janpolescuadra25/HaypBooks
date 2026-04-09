from pathlib import Path

checks = [
    ('General Ledger','/accounting/core-accounting/general-ledger','src/app/(owner)/accounting/core-accounting/general-ledger/page.tsx'),
    ('Trial Balance','/accounting/core-accounting/trial-balance','src/app/(owner)/accounting/core-accounting/trial-balance/page.tsx'),
    ('Allocation Runs','/accounting/allocations/allocation-runs','src/app/(owner)/accounting/allocations/allocation-runs/page.tsx'),
    ('Allocation Runs (run-allocations)','/accounting/allocations/run-allocations','src/app/(owner)/accounting/allocations/run-allocations/page.tsx'),
    ('Currency Revaluation','/accounting/revaluations/currency-revaluation','src/app/(owner)/accounting/revaluations/currency-revaluation/page.tsx'),
    ('FX Revaluation','/accounting/revaluations/fx-revaluation','src/app/(owner)/accounting/revaluations/fx-revaluation/page.tsx'),
    ('Customer Groups','/sales/customers/customer-groups','src/app/(owner)/sales/customers/customer-groups/page.tsx'),
    ('Customer Documents','/sales/customers/customer-documents','src/app/(owner)/sales/customers/customer-documents/page.tsx'),
    ('Price Lists','/sales/customers/price-lists','src/app/(owner)/sales/customers/price-lists/page.tsx'),
    ('Customer Portal','/sales/customers/customer-portal','src/app/(owner)/sales/customers/customer-portal/page.tsx'),
    ('Products & Services','/sales/sales-operations/products-services','src/app/(owner)/sales/sales-operations/products-services/page.tsx'),
    ('Quotes & Estimates','/sales/sales-operations/quotes-estimates','src/app/(owner)/sales/sales-operations/quotes-estimates/page.tsx'),
    ('Sales Orders','/sales/sales-operations/sales-orders','src/app/(owner)/sales/sales-operations/sales-orders/page.tsx'),
    ('Recurring Invoices','/sales/billing/recurring-invoices','src/app/(owner)/sales/billing/recurring-invoices/page.tsx'),
    ('Credit Notes','/sales/billing/credit-notes','src/app/(owner)/sales/billing/credit-notes/page.tsx'),
    ('Payment Links','/sales/billing/payment-links','src/app/(owner)/sales/billing/payment-links/page.tsx'),
    ('Customer Statements','/sales/billing/customer-statements','src/app/(owner)/sales/billing/customer-statements/page.tsx'),
    ('Refund List','/sales/refunds/refund-list','src/app/(owner)/sales/refunds/refund-list/page.tsx'),
    ('Process Refund','/sales/refunds/process-refund','src/app/(owner)/sales/refunds/process-refund/page.tsx'),
    ('Refund History','/sales/refunds/refund-history','src/app/(owner)/sales/refunds/refund-history/page.tsx'),
    ('Revenue Recognition','/sales/revenue-management/revenue-recognition','src/app/(owner)/sales/revenue-management/revenue-recognition/page.tsx'),
    ('Deferred Revenue','/sales/revenue-management/deferred-revenue','src/app/(owner)/sales/revenue-management/deferred-revenue/page.tsx'),
    ('Contract Revenue','/sales/revenue-management/contract-revenue','src/app/(owner)/sales/revenue-management/contract-revenue/page.tsx'),
    ('Subscription Billing','/sales/revenue-management/subscription-billing','src/app/(owner)/sales/revenue-management/subscription-billing/page.tsx'),
    ('Sales Performance','/sales/sales-insights/sales-performance','src/app/(owner)/sales/sales-insights/sales-performance/page.tsx'),
    ('Revenue Trends','/sales/sales-insights/revenue-trends','src/app/(owner)/sales/sales-insights/revenue-trends/page.tsx'),
    ('Customer Profitability','/sales/sales-insights/customer-profitability','src/app/(owner)/sales/sales-insights/customer-profitability/page.tsx'),
]

print('Page Name\tFile Status\tContent Status\tAction Needed')
for name,url,path in checks:
    p = Path(path)
    if not p.exists():
        print(f'{name}\tMissing\tN/A\tCreate')
        continue
    text = p.read_text(encoding='utf-8', errors='ignore')
    if 'PageDocumentation' in text or 'Content is coming soon' in text:
        print(f'{name}\tExists\tPlaceholder\tFix')
    elif '<table' in text.lower() or 'datatable' in text.lower() or 'rows' in text.lower():
        print(f'{name}\tExists\tReal UI\tSkip')
    else:
        print(f'{name}\tExists\tUnknown (needs manual)\tInspect')
