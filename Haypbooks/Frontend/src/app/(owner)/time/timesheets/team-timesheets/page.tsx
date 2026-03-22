'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Team Timesheets"
      module="TIME"
      breadcrumb="Time / Timesheets / Team Timesheets"
      purpose="Team Timesheets provides the manager's view of timesheet submissions across their team. Managers see all team members' timesheets for the week — who has submitted, who hasn't, who has entries pending approval, and the breakdown of hours by project and billable status. Managers approve or reject timesheets with comments. This page drives accountability for time recording compliancy, especially in consulting and professional services firms."
      components={[
        { name: 'Team Timesheet Overview', description: 'Grid: team members as rows, days as columns. Shows total hours per person per day. Color-coded: green (submitted), amber (draft/late), red (missing/not started).' },
        { name: 'Individual Timesheet Review', description: 'Click any team member to see their full timesheet detail for the week.' },
        { name: 'Approval Queue', description: 'All submitted timesheets pending approval by the manager.' },
        { name: 'Utilization Summary', description: 'Team utilization: billable hours as % of total recorded hours by each team member.' },
      ]}
      tabs={['My Team', 'Pending Approval', 'Approved', 'Utilization Summary', 'Missing Timesheets']}
      features={[
        'Team-wide timesheet submission status overview',
        'Individual timesheet review and approval',
        'Late/missing timesheet identification',
        'Team utilization analysis',
        'Batch approval for multiple timesheets',
        'Rejection with feedback to employee',
        'Notification of outstanding timesheet approvals',
      ]}
      dataDisplayed={[
        'All team members with timesheet status per week',
        'Hours per team member (billable vs. non-billable)',
        'Timesheets pending approval',
        'Missing or late timesheet submissions',
        'Team utilization rate',
      ]}
      userActions={[
        "Review a team member's timesheet",
        'Approve or reject a timesheet',
        'Request correction with comments',
        'Remind team member to submit outstanding timesheet',
        'View team utilization metrics',
        'Export team timesheet summary',
      ]}
      relatedPages={[
        { label: 'My Timesheet', href: '/time/timesheets/my-timesheet' },
        { label: 'Project Timesheets', href: '/projects/time-billing/timesheets' },
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
      ]}
    />
  )
}

