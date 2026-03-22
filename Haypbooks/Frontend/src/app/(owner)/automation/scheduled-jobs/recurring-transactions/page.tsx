'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recurring Transactions"
      module="AUTOMATION"
      breadcrumb="Automation / Scheduled Jobs / Recurring Transactions"
      purpose="Recurring Transactions manages templates for transactions that repeat on a defined schedule — monthly subscription invoices, recurring rent bills, weekly payroll journals, quarterly prepayment amortizations. The system automatically creates these transactions on schedule without manual intervention, reducing accounting repetition and ensuring consistent coding."
      components={[
        { name: 'Recurring Template List', description: 'All recurring templates with name, type (invoice/bill/journal), frequency, next due date, and status.' },
        { name: 'Template Builder', description: 'Create a recurring template: specify all transaction details (accounts, amounts, lines) and the recurrence schedule.' },
        { name: 'Schedule Configuration', description: 'Configure recurrence: daily/weekly/monthly/quarterly/annually, start date, end date or number of occurrences.' },
        { name: 'Auto-created Records Log', description: 'History of all transactions auto-generated from recurring templates with links to each record.' },
      ]}
      tabs={['All Templates', 'Invoices', 'Bills', 'Journal Entries', 'Upcoming']}
      features={[
        'Auto-create invoices, bills, and journals on schedule',
        'Full transaction line-item templates with account codes',
        'Flexible recurrence: daily/weekly/monthly/quarterly/annual',
        'End date or fixed-count termination',
        'Email notification when recurring transaction is created',
        'Pause individual templates without deleting',
      ]}
      dataDisplayed={[
        'Template name and transaction type',
        'Recurrence frequency and next run date',
        'Transaction amount and line items',
        'Number of occurrences so far',
        'Last auto-created record link',
        'Active / paused / ended status',
      ]}
      userActions={[
        'Create a new recurring transaction template',
        'Edit template line items or schedule',
        'Pause or resume a template',
        'Manually trigger creation ahead of schedule',
        'Delete (disable) a template no longer needed',
        'View all transactions created from a template',
      ]}
      relatedPages={[
        { label: 'Report Scheduler', href: '/automation/scheduled-jobs/report-scheduler' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Recurring Invoices', href: '/sales/billing/recurring-invoices' },
        { label: 'Recurring Bills', href: '/expenses/bills/recurring-bills' },
      ]}
    />
  )
}

