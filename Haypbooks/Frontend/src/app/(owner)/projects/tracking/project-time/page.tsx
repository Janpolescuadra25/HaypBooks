'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Time'
      module='PROJECTS'
      breadcrumb='Projects / Tracking / Project Time'
      purpose='Captures and manages all time entries logged against project tasks and phases. Provides the data foundation for project cost tracking, billing, and utilization analysis. Enables review, approval, and correction of time entries before they flow into billing and payroll.'
      components={[
        { name: 'Time Entry Log', description: 'Chronological list of all time entries across projects with filtering by date, project, and staff' },
        { name: 'Weekly Timesheet View', description: 'Grid view of hours entered by team member per day and project' },
        { name: 'Billable vs. Non-Billable Summary', description: 'Aggregated view distinguishing billable and non-billable hours by project' },
        { name: 'Time Entry Approval Queue', description: 'Pending time entries awaiting manager review and approval' },
        { name: 'Time Correction Tool', description: 'Edit time entries with audit trail and reason for change' },
      ]}
      tabs={['All Time Entries', 'Pending Approval', 'Billable Summary', 'By Team Member']}
      features={['Multi-level time entry approval workflow', 'Billable and non-billable classification', 'Overtime and special rate detection', 'Time entry lock after billing', 'Linked to project tasks and phases', 'Export to CSV for payroll processing', 'Timer integration for real-time capture']}
      dataDisplayed={['Staff name and role', 'Project and task name', 'Date and hours worked', 'Billable flag and billing rate', 'Bill amount for each entry', 'Approval status', 'Notes and activity description']}
      userActions={['View time entries by project', 'Approve or reject time entries', 'Edit and correct time entries', 'Filter by billable status', 'Export time report for billing', 'View timesheet by team member', 'Lock approved entries']}
      relatedPages={[
        { label: 'Billable Review', href: '/projects/tracking/billable-review' },
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Time Entries', href: '/time/entry/time-entries' },
      ]}
    />
  )
}

