'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Calendar"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll / Payroll Calendar"
      purpose="The Payroll Calendar defines the schedule of all payroll runs for the year — when each payroll period starts and ends, when payroll is processed, and when salaries are disbursed. It accounts for holidays affecting payroll processing and ensures payroll is always disbursed on the correct banking day. The calendar is the planning tool for the HR/Payroll team — they can see all upcoming payroll processing dates and adjust for bank holidays or year-end."
      components={[
        { name: 'Annual Payroll Calendar', description: 'All payroll cycles for the year displayed in calendar and table format: period, cut-off date, processing date, payout date.' },
        { name: 'Holiday Manager', description: 'Regular and special non-working holidays that affect payroll calculation and processing dates.' },
        { name: 'Pay Frequency Settings', description: 'Configure payroll frequency: monthly (1 run), semi-monthly (1st-15th / 16th-end), weekly, or bi-weekly.' },
        { name: 'Processing Reminders', description: 'Automated email reminders to payroll team on upcoming payroll processing dates.' },
      ]}
      tabs={['Calendar View', 'Processing Schedule', 'Holidays', 'Settings']}
      features={[
        'Annual payroll calendar generation',
        'Holiday impact on payroll processing dates',
        'Semi-monthly and monthly payroll support',
        'Processing deadline reminders',
        'Bank payout date management',
        'Calendar adjustment for ad-hoc pay runs (13th month, bonuses)',
      ]}
      dataDisplayed={[
        'All payroll periods and payout dates for the year',
        'Upcoming payroll processing deadlines',
        'Holiday schedule affecting payroll',
        'Pay frequency settings',
      ]}
      userActions={[
        'View full year payroll calendar',
        'Adjust processing date for a specific run',
        'Add company or public holidays',
        'Configure payroll frequency',
        'Set payroll processing reminders',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Pay Slips', href: '/payroll-workforce/payroll/pay-slips' },
        { label: 'Leave Policy', href: '/payroll-workforce/leaves/leave-policy' },
      ]}
    />
  )
}

