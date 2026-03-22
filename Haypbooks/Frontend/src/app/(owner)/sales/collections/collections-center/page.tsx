'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Collections Center"
      module="SALES"
      breadcrumb="Sales / Collections / Collections Center"
      purpose="The Collections Center is the accounts receivable collections management hub. It shows all overdue invoices, organizes them by priority (amount and days overdue), and provides the tools to take collection action — sending reminder emails, recording phone call notes, escalating to management, and setting follow-up callbacks. The Collections Center transforms the AR team's process from informal chasing to a structured, documented, and tracked collections workflow."
      components={[
        { name: 'Overdue Invoice Queue', description: 'All overdue invoices sorted by priority score (days overdue × amount). Each row shows: customer, invoice number, original amount, outstanding, due date, days overdue, and last contact.' },
        { name: 'Collection Action Panel', description: 'For each invoice: Send reminder email, Log call note, Schedule follow-up, Escalate, or Write off.' },
        { name: 'Reminder Email Templates', description: 'Template library for collection reminder emails: Gentle Reminder (1–7 days), Firm Reminder (8–30 days), Final Notice (31+ days).' },
        { name: 'Collection Notes Log', description: 'Chronological log of all collection actions taken per customer: emails sent, calls made, promises received.' },
        { name: 'Promise to Pay Tracker', description: 'Track promises received from customers with promised date and amount, and monitor whether the promise was kept.' },
      ]}
      tabs={['Overdue Queue', 'Reminder Emails', 'Collection Notes', 'Promises to Pay', 'Escalations']}
      features={[
        'Priority-scored overdue invoice queue',
        'Templated reminder email sending from system',
        'Collection activity documentation per customer',
        'Promise-to-pay tracking and monitoring',
        'Escalation workflow for high-value overdues',
        'Collections performance dashboard ($ collected, contact rate)',
        'Integration with write-off workflow for uncollectibles',
      ]}
      dataDisplayed={[
        'All overdue invoices with priority score',
        'Days overdue and outstanding amount per invoice',
        'Last contact date and action for each customer',
        'Promises to pay: date, amount, kept/broken',
        'Total overdue AR and collection target',
        'Collection activity metrics',
      ]}
      userActions={[
        'Send a collection reminder email from the queue',
        'Log a phone call note on an overdue invoice',
        'Record a customer promise to pay',
        'Schedule a follow-up callback',
        'Escalate overdue invoice to senior management',
        'Initiate write-off for uncollectible amount',
        'View collection history for a customer',
      ]}
      relatedPages={[
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'AR Aging', href: '/reporting/reports-center/ar-aging' },
        { label: 'AR Ledger', href: '/accounting/core-accounting/accounts-receivable' },
        { label: 'Write-Offs', href: '/sales/collections/write-offs' },
      ]}
    />
  )
}

