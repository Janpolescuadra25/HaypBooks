'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recurring Bills"
      module="EXPENSES"
      breadcrumb="Expenses / Bills / Recurring Bills"
      purpose="Recurring Bills automates the creation of bills for regular, predictable vendor charges — monthly rent, utility bills, subscription services, insurance premiums, and maintenance contracts. A recurring bill template is set up once with the vendor, bill items, amount, and frequency. On the scheduled date, the system generates the bill automatically (and optionally routes it for approval). This eliminates the need to manually enter the same bills every month."
      components={[
        { name: 'Recurring Bill Schedules', description: 'All active recurring bill templates with vendor, frequency, amount, next bill date, and status.' },
        { name: 'Template Builder', description: 'Set up a recurring bill: vendor, description, line items, amounts, frequency, start date, end date (optional), and approval routing.' },
        { name: 'Upcoming Bills Calendar', description: 'Calendar showing all bills scheduled to auto-generate in the next 90 days.' },
        { name: 'History', description: 'All bills generated from each recurring template with a link to the actual bill.' },
      ]}
      tabs={['Active Schedules', 'Upcoming', 'History', 'Paused']}
      features={[
        'Automated recurring vendor bill generation',
        'Multiple frequencies: weekly, monthly, quarterly, annually',
        'Auto-route for approval on generation',
        'Pause and resume capability',
        'Auto-notify accounts payable team on generation',
        'Budget forecast integration: recurring bills appear in projected AP',
      ]}
      dataDisplayed={[
        'Active recurring bill schedules',
        'Next bill date per schedule',
        'Monthly recurring payables total',
        'History of bills generated per schedule',
      ]}
      userActions={[
        'Set up a new recurring bill template',
        'Edit bill amount or frequency',
        'Pause a recurring schedule',
        'Resume a paused schedule',
        'Cancel a recurring bill schedule',
        'View bills generated from a template',
      ]}
      relatedPages={[
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Recurring Transactions', href: '/automation/scheduled-jobs/recurring-transactions' },
      ]}
    />
  )
}

