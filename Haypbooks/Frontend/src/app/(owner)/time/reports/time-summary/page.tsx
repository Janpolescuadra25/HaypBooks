'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Time Summary"
      module="TIME"
      breadcrumb="Time / Reports / Time Summary"
      purpose="The Time Summary Report provides organization-wide visibility of how time is being spent — by employee, by project, by department, by client, and by billable category. Finance and operations leaders use this report to analyze billability rates, identify non-billable time drains, assess team productivity, and compare actual time vs. planned (budgeted) time per project. The report supports client billing verification and internal resource management decisions."
      components={[
        { name: 'Summary Table', description: 'Time totals grouped by project, employee, or department for the selected period.' },
        { name: 'Billable Rate Chart', description: 'Visual: billable hours as % of total hours per employee or team, benchmarked against target utilization rate.' },
        { name: 'Project Time Breakdown', description: 'Hours per project with billable and non-billable split.' },
        { name: 'Period Comparison', description: 'Current period vs. prior period: are we more or less billable than last month?' },
      ]}
      tabs={['By Project', 'By Employee', 'By Department', 'Billable Analysis', 'Period Comparison']}
      features={[
        'Flexible time summary by project, employee, department, or client',
        'Billability rate analysis',
        'Period comparison trends',
        'Export for executive reporting or client reporting',
        'Hours vs. budgeted hours per project',
        'Overtime hours identification',
      ]}
      dataDisplayed={[
        'Total hours by grouping for the period',
        'Billable vs. non-billable breakdown',
        'Utilization rate per employee',
        'Top projects by hours consumed',
        'Employees with hours below minimum or above capacity',
      ]}
      userActions={[
        'Run time summary for a date range',
        'Switch between groupings (by project, by employee)',
        'Filter by department or client',
        'Export to Excel',
        'Compare to prior period',
      ]}
      relatedPages={[
        { label: 'My Timesheet', href: '/time/timesheets/my-timesheet' },
        { label: 'Team Timesheets', href: '/time/timesheets/team-timesheets' },
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
        { label: 'Project Reports', href: '/projects/reports/project-reports' },
      ]}
    />
  )
}

