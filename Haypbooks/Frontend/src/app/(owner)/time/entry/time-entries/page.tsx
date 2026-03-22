'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TimeEntriesPage() {
  return (
    <PageDocumentation
      title="Time Entries"
      module="TIME"
      breadcrumb="Time / Entry / Time Entries"
      purpose="Time Entries is the master log of all individual time records submitted across the organization, giving managers a comprehensive view of who logged time, against which project and task, and the billing status of each entry. This page serves as the primary management interface for reviewing, editing, approving, or rejecting time entries before they are billed to clients. Entries flow from timesheets or the live timer and are categorized as billable or non-billable."
      components={[
        { name: 'Time Entry Table', description: 'Paginated table of all entries with employee, date, project, task, hours, rate, status, and billing flag.' },
        { name: 'Inline Edit', description: 'Click-to-edit capability on any row to update hours, description, or billing classification.' },
        { name: 'Status Filter Bar', description: 'Quick filters for Draft, Submitted, Approved, Billed, and Rejected entry statuses.' },
        { name: 'Bulk Approve / Reject', description: 'Checkbox multi-select with bulk approve or reject action for manager review efficiency.' },
        { name: 'Billing Status Update', description: 'Mark approved entries as billable or non-billable in preparation for invoice generation.' },
      ]}
      tabs={['All Entries', 'Pending Approval', 'Approved', 'Billed', 'Rejected']}
      features={[
        'View and search all time entries across all employees and projects',
        'Filter by employee, project, task, date, and billing status',
        'Inline-edit hours, description, or rate on any entry',
        'Bulk approve or reject submitted time entries',
        'Mark approved entries as billable/non-billable',
        'Link entries to project tasks and billing records',
      ]}
      dataDisplayed={[
        'Employee name and submission date',
        'Project and task associated with entry',
        'Hours logged and hourly rate',
        'Billing classification (billable/non-billable)',
        'Approval status and reviewer name',
      ]}
      userActions={[
        'Filter entries by employee, project, or status',
        'Edit time entry details inline',
        'Approve or reject individual or bulk entries',
        'Change billing classification',
        'Export time entries for billing or payroll',
      ]}
    />
  )
}

