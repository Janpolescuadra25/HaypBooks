'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Project Timesheets"
      module="PROJECTS"
      breadcrumb="Projects / Time & Billing / Timesheets"
      purpose="Project Timesheets shows time recorded against projects and tasks by all team members. This is the project manager's view of time — showing hours by team member, by project, by task, by week. It serves as the basis for billable hours calculation, resource utilization analysis, and project costing. Timesheets in this view are grouped by project (the finance-focused view), different from the employee-centered timesheet in the Time module."
      components={[
        { name: 'Project Time Summary', description: 'Total hours logged per project in the selected period, grouped by team member and task.' },
        { name: 'Weekly Timesheet Grid', description: 'Employee × project matrix showing hours per day for the week.' },
        { name: 'Billable vs. Non-Billable', description: 'Hours split between billable (charged to client) and non-billable (internal, admin, unbillable tasks).' },
        { name: 'Approval Status', description: 'Timesheet approval status: unsubmitted, submitted, approved, rejected.' },
      ]}
      tabs={['By Project', 'By Team Member', 'Billable Analysis', 'Approval Status', 'Summary']}
      features={[
        'Project-focused time analysis',
        'Billable vs. non-billable breakdown',
        'Team utilization visibility',
        'Timesheet approval tracking',
        'Export for payroll and billing',
        'Period comparison (week vs. week)',
      ]}
      dataDisplayed={[
        'Hours per project per team member',
        'Billable hours ready for invoicing',
        'Non-billable hours by category',
        'Unapproved timesheets pending action',
        'Utilization rate per team member',
      ]}
      userActions={[
        'View time logged per project',
        'Approve timesheet submissions',
        'Filter by team member or project',
        'Export billable hours for invoicing',
        'Run utilization analysis',
      ]}
      relatedPages={[
        { label: 'My Timesheet', href: '/time/timesheets/my-timesheet' },
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
        { label: 'Project Invoicing', href: '/projects/time-billing/project-invoicing' },
      ]}
    />
  )
}

