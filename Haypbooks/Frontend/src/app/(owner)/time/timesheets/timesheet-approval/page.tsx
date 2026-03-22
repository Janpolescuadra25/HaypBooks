'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Timesheet Approval"
      module="TIME"
      breadcrumb="Time / Timesheets / Timesheet Approval"
      purpose="Timesheet Approval is the dedicated approval management page — centralizing all timesheet submissions that need action. Approvers see all submitted timesheets across all teams they are authorized to approve, with summary stats (total hours, billable %, project breakdown) for each. Bulk approval is supported for routine timesheet reviews. Rejected timesheets return to the employee with mandatory feedback. The approval audit trail supports payroll and billing compliance."
      components={[
        { name: 'Approval Queue', description: 'All submitted timesheets queued for approval with employee, period, total hours, and submission date.' },
        { name: 'Timesheet Review Panel', description: 'Per-timesheet full detail: days worked, project breakdown, billable highlights, and any notes from the employee.' },
        { name: 'Batch Approval Controls', description: 'Approve all selected timesheets at once with a single action and timestamp.' },
        { name: 'Rejection Form', description: 'Reject a timesheet with mandatory reason and specific correction instructions.' },
        { name: 'Approval History', description: 'Archive of all approved timesheets with approval timestamp, approver, and any notes.' },
      ]}
      tabs={['Pending Approval', 'Approved', 'Rejected', 'Approval History']}
      features={[
        'Centralized timesheet approval queue',
        'Full timesheet detail review in approval interface',
        'Batch approval for high-volume periods',
        'Mandatory rejection feedback',
        'Approval timestamp and audit trail',
        'Integration with payroll on approval',
        'Notification to employee on approval or rejection',
      ]}
      dataDisplayed={[
        'All timesheets pending approval',
        'Employee, period, and hour summary per submission',
        'Billable hours per timesheet',
        'Approval history with timestamps',
        'Rejection reasons log',
      ]}
      userActions={[
        'Review a submitted timesheet',
        'Approve a timesheet',
        'Batch approve multiple timesheets',
        'Reject with feedback',
        'View approval history',
        'Filter by team, project, or employee',
      ]}
      relatedPages={[
        { label: 'Team Timesheets', href: '/time/timesheets/team-timesheets' },
        { label: 'My Timesheet', href: '/time/timesheets/my-timesheet' },
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
      ]}
    />
  )
}

