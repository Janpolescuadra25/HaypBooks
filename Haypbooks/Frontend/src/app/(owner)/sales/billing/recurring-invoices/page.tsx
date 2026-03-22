'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recurring Invoices"
      module="SALES"
      breadcrumb="Sales / Billing / Recurring Invoices"
      purpose="Recurring Invoices automates the generation of invoices for subscription-based, retainer, and rental billing — where the same invoice is issued to the same customer at regular intervals. Users set up a recurring invoice template once with the customer, invoice lines, amounts, and frequency (weekly, monthly, quarterly, annually). The system then generates and optionally auto-sends the invoice on the scheduled date, saving manual effort for predictable recurring revenue streams."
      components={[
        { name: 'Recurring Invoice List', description: 'All active recurring schedules with customer, billing frequency, next invoice date, amount, and status (active/paused).' },
        { name: 'Schedule Builder', description: 'Create a recurring invoice: select customer, define invoice lines, set frequency, start date, end date (or ongoing), and auto-send preference.' },
        { name: 'Upcoming Invoices Calendar', description: 'Calendar showing all invoices scheduled to auto-generate in the next 90 days.' },
        { name: 'Invoice History', description: 'All invoices generated from each recurring schedule with link to the actual invoice.' },
        { name: 'Pause/Resume Controls', description: 'Pause or resume a recurring schedule — e.g., when a contract is under renegotiation.' },
      ]}
      tabs={['Active Schedules', 'Upcoming', 'History', 'Paused']}
      features={[
        'Automated recurring invoice generation on schedule',
        'Flexible billing frequencies: weekly, monthly, quarterly, yearly',
        'Optional auto-send on generation',
        'Adjustable billing amount with version tracking',
        'Pause and resume capability',
        'End date or indefinite scheduling',
        'Notification of auto-generated invoices',
      ]}
      dataDisplayed={[
        'Active recurring schedules with next billing date',
        'Monthly recurring revenue (MRR) total',
        'Upcoming scheduled invoices in next 90 days',
        'Invoice history per schedule',
        'Amount changes over time per schedule',
      ]}
      userActions={[
        'Create a new recurring invoice schedule',
        'Edit billing amount or frequency',
        'Pause a recurring schedule',
        'Resume a paused schedule',
        'End/cancel a recurring billing',
        'View all invoices generated from a schedule',
        'Send a manually triggered invoice from schedule',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'Recurring Transactions', href: '/automation/scheduled-jobs/recurring-transactions' },
      ]}
    />
  )
}

