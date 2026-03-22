'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Scheduled Reports"
      module="REPORTING"
      breadcrumb="Reporting / Custom Reports / Scheduled Reports"
      purpose="Scheduled Reports allows users to configure automatic report generation and email delivery on a recurring schedule. A business owner or CFO can set up a weekly P&L, monthly cash flow summary, or daily AR aging to be emailed every Monday morning. Once configured, reports run automatically without manual action — ensuring stakeholders always have current financial data without having to log in and pull reports manually. All standard and custom reports can be scheduled."
      components={[
        { name: 'Scheduled Report List', description: 'All active schedules: report name, frequency, next run, recipient list, and format (PDF/Excel/CSV).' },
        { name: 'Create Schedule Form', description: 'Select report, set frequency (daily/weekly/monthly/quarterly), configure date, time, and email recipients.' },
        { name: 'Delivery History', description: 'Per schedule: log of all delivery runs with date, status (success/failure), and recipient list.' },
        { name: 'Report Parameters', description: 'Configure period (current month, prior month, YTD), filters that apply to each run of the scheduled report.' },
      ]}
      tabs={['Active Schedules', 'Delivery History', 'Create New Schedule', 'Paused']}
      features={[
        'Automated recurring report generation and delivery',
        'Daily, weekly, monthly, and quarterly schedules',
        'Email delivery to multiple recipients',
        'PDF, Excel, and CSV format options',
        'Report parameter configuration for each run',
        'Delivery failure notification',
        'Pause and resume schedule',
      ]}
      dataDisplayed={[
        'All active report schedules',
        'Next scheduled run per report',
        'Recipient list per schedule',
        'Delivery success/failure history',
      ]}
      userActions={[
        'Create a new scheduled report',
        'Edit an existing schedule',
        'Add or remove email recipients',
        'Pause or resume a schedule',
        'Manually trigger an immediate run',
        'View delivery history',
      ]}
      relatedPages={[
        { label: 'Report Builder', href: '/reporting/custom-reports/report-builder' },
        { label: 'Notification Preferences', href: '/settings/notifications/notification-preferences' },
        { label: 'Analytics Dashboards', href: '/reporting/analytics/analytics-dashboards' },
      ]}
    />
  )
}

