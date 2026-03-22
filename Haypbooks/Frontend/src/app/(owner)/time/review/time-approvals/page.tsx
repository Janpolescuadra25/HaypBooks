'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TimeApprovalsPage() {
  return (
    <PageDocumentation
      title="Time Approvals"
      module="TIME"
      breadcrumb="Time / Review / Time Approvals"
      purpose="Time Approvals is the manager's queue for reviewing and actioning submitted timesheets and individual time entries pending approval. Managers can approve or reject entries with comments, ensuring all logged time is accurate before it flows into billing and payroll calculations. The queue is filtered to show only entries assigned to the logged-in manager's team or direct reports."
      components={[
        { name: 'Approval Queue Table', description: 'List of all pending submissions with employee, period, total hours, submission date, and action buttons.' },
        { name: 'Timesheet Detail Viewer', description: 'Side panel showing the full weekly timesheet or individual entry submitted for review.' },
        { name: 'Approve / Reject Controls', description: 'Per-row approve and reject buttons with mandatory comment field for rejections.' },
        { name: 'Comment Thread', description: 'Discussion thread per submission for manager-employee back-and-forth on corrections needed.' },
        { name: 'Bulk Approve', description: 'Checkbox selection and bulk approve action for managers handling large teams.' },
      ]}
      tabs={['Pending Approval', 'Recently Approved', 'Rejected']}
      features={[
        'Review submitted timesheets and individual entries in one queue',
        'Approve or reject with mandatory rejection comment',
        'Communicate corrections via comment thread on each submission',
        'Bulk approve multiple submissions at once',
        'Filter queue by employee, period, or submission date',
        'Track approval history and response time metrics',
      ]}
      dataDisplayed={[
        'Employee name and submission date',
        'Period covered and total hours submitted',
        'Project/task breakdown within submission',
        'Approval status history',
        'Manager comments and response timestamps',
      ]}
      userActions={[
        'Approve a submitted timesheet or entry',
        'Reject with a required comment',
        'Reply to employee via comment thread',
        'Bulk approve multiple submissions',
        'Filter queue by employee or period',
      ]}
    />
  )
}

