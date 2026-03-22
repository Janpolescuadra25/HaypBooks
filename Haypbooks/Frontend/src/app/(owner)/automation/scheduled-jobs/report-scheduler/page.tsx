'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Report Scheduler"
      module="AUTOMATION"
      breadcrumb="Automation / Scheduled Jobs / Report Scheduler"
      purpose="Report Scheduler manages automated report generation and delivery. Users configure schedules for any standard or custom report to be generated and emailed automatically at defined intervals (daily, weekly, monthly, quarterly). This eliminates manual report generation for recurring management reports, board packages, and compliance summaries."
      components={[
        { name: 'Scheduled Reports List', description: 'All configured scheduled reports with report name, frequency, recipients, last sent, and next scheduled send.' },
        { name: 'Schedule Builder', description: 'Configure: report selected, frequency (daily/weekly/monthly/quarterly), day of week/month to run, time, file format (PDF/Excel/CSV), and recipients.' },
        { name: 'Template Selection', description: 'Choose from any available report template across all modules or a saved custom report.' },
        { name: 'Recipient Management', description: 'Add internal users or external email addresses as report recipients.' },
      ]}
      tabs={['Scheduled Reports', 'Create Schedule', 'Delivery History']}
      features={[
        'Schedule any system report for automatic delivery',
        'Configurable frequency: daily/weekly/monthly/quarterly',
        'Multiple file format options (PDF, Excel, CSV)',
        'Multiple recipient support including external emails',
        'Send immediately vs. next scheduled run options',
        'Pause/resume schedules without deleting',
      ]}
      dataDisplayed={[
        'Report name and type',
        'Schedule frequency and next run date/time',
        'Recipients list',
        'Last sent date and delivery status',
        'Report file format',
      ]}
      userActions={[
        'Create a new report schedule',
        'Edit existing schedule (frequency, recipients, format)',
        'Pause or resume a schedule',
        'Send an immediate ad-hoc delivery of a scheduled report',
        'Delete a schedule',
        'View delivery history and failed sends',
      ]}
      relatedPages={[
        { label: 'Data Export Jobs', href: '/automation/scheduled-jobs/data-export-jobs' },
        { label: 'Reports Center', href: '/reporting/reports-center/financial-statements' },
        { label: 'Custom Reports', href: '/reporting/custom-reports/report-builder' },
        { label: 'Email Notifications', href: '/automation/workflow-engine/email-notifications' },
      ]}
    />
  )
}

