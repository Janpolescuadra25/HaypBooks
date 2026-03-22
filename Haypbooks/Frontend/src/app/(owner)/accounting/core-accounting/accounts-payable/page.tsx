'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Accounts Payable Ledger"
      module="ACCOUNTING"
      breadcrumb="Accounting / Core Accounting / Accounts Payable"
      purpose="The Accounts Payable Ledger is the sub-ledger that tracks all outstanding amounts owed to vendors and suppliers. It reconciles to the Accounts Payable control account on the balance sheet. It shows the aging of payables by vendor, due dates, discount opportunities, and payment status. It is the source-of-truth for what is owed and when, used for cash flow planning, vendor relationship management, and financial statement preparation."
      components={[
        { name: 'AP Summary Tiles', description: 'Tiles for: total outstanding AP, overdue AP, due in 7 days, and total credits available.' },
        { name: 'Vendor Balance List', description: 'Per-vendor outstanding balance with aging buckets: current, 1–30 days, 31–60 days, 61–90 days, 90+ days.' },
        { name: 'Invoice Detail View', description: 'All open bills per vendor with invoice date, due date, original amount, amount paid, and outstanding balance.' },
        { name: 'AP Aging Report', description: 'Formal AP aging summary across all vendors for month-end reporting.' },
        { name: 'Payment Due Calendar', description: 'Upcoming payment due dates in a calendar view with amounts.' },
      ]}
      tabs={['Summary', 'Vendor Balances', 'Open Bills', 'Aging Report', 'Payment Calendar']}
      features={[
        'Sub-ledger AP balance tracking with aging buckets',
        'Cash flow forecasting based on due dates',
        'Early payment discount tracking',
        'AP-to-GL control account reconciliation',
        'Drill-through to individual bill transactions',
        'Export AP aging for audit or bank presentations',
      ]}
      dataDisplayed={[
        'Total outstanding AP balance',
        'Per-vendor balances with aging buckets',
        'Open invoices with due dates and outstanding amounts',
        'Early payment discount opportunities',
        'Days payable outstanding (DPO) metric',
        'AP balance vs. GL control account',
      ]}
      userActions={[
        'View AP aging for a specific vendor',
        'Drill through to an individual bill',
        'Navigate to pay a bill',
        'Export AP aging report',
        'Filter by due date or vendor',
        'View payment discount details',
      ]}
      relatedPages={[
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'AP Aging Report', href: '/reporting/reports-center/ap-aging' },
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
      ]}
    />
  )
}

