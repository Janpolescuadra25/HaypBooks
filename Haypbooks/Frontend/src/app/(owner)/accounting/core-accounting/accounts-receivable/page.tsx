'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Accounts Receivable Ledger"
      module="ACCOUNTING"
      breadcrumb="Accounting / Core Accounting / Accounts Receivable"
      purpose="The Accounts Receivable Ledger is the sub-ledger that tracks all amounts owed by customers for goods and services delivered. It reconciles to the Accounts Receivable control account on the balance sheet. It provides an aging analysis of receivables by customer, highlights overdue accounts, tracks partial payments, and feeds the collections management process. It is the primary tool for monitoring receivable health and ensuring timely cash collection."
      components={[
        { name: 'AR Summary Tiles', description: 'Tiles for: total outstanding AR, overdue, due in 7 days, and credits available to apply.' },
        { name: 'Customer Balance List', description: 'Per-customer AR balance with aging buckets: current, 1–30 days, 31–60 days 61–90 days, 90+ days.' },
        { name: 'Invoice Detail View', description: 'All open invoices per customer with invoice date, due date, original amount, payments applied, and outstanding balance.' },
        { name: 'AR Aging Report', description: 'Formal AR aging summary across all customers for month-end reporting.' },
        { name: 'Collection Status', description: 'Flag overdue invoices with collection priority level and most recent contact note.' },
      ]}
      tabs={['Summary', 'Customer Balances', 'Open Invoices', 'Aging Report', 'Collections']}
      features={[
        'Sub-ledger AR balance tracking with aging buckets',
        'Customer-level outstanding balance visibility',
        'AR-to-GL control account reconciliation',
        'Collection status flagging for overdue accounts',
        'Days sales outstanding (DSO) metric',
        'Drill-through to individual invoice transactions',
        'Export AR aging for audit or investor presentations',
      ]}
      dataDisplayed={[
        'Total outstanding AR balance',
        'Per-customer balances with aging buckets',
        'Open invoices with due dates and outstanding amounts',
        'DSO metric and trend',
        'AR balance vs. GL control account',
        'Customer collection risk flags',
      ]}
      userActions={[
        'View AR aging for a specific customer',
        'Drill through to an individual invoice',
        'Flag an overdue invoice for collections',
        'Export AR aging report',
        'Apply a payment or credit to an invoice',
        'View collection history for a customer',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'AR Aging Report', href: '/reporting/reports-center/ar-aging' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
      ]}
    />
  )
}

