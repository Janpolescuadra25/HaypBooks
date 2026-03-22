'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="My Timesheet"
      module="TIME"
      breadcrumb="Time / Timesheets / My Timesheet"
      purpose="My Timesheet is the employee's weekly time recording interface. Each employee logs hours worked per day per project/task. Hours are tagged as billable or non-billable, and can be allocated to specific project tasks or to internal categories (admin, training, leave). At the end of the week, the employee submits the timesheet for manager approval. Approved timesheets flow into billing (for billable hours) and payroll (for hours-based pay)."
      components={[
        { name: 'Weekly Time Grid', description: 'Monday-to-Sunday grid: rows are project/task, columns are days. Enter hours in each cell.' },
        { name: 'Project/Task Selector', description: 'Add rows for projects and tasks assigned to you. Pin frequently used projects for fast access.' },
        { name: 'Billable Toggle', description: 'Mark each row as billable (charged to client) or non-billable (internal time).' },
        { name: 'Time Entry Notes', description: 'Add a description/note to each time entry for billing narrative.' },
        { name: 'Submit for Approval', description: 'Review the completed week and submit for manager approval.' },
        { name: 'Weekly Summary', description: 'Summary: total hours, billable hours, non-billable hours, and breakdown by project.' },
      ]}
      tabs={['This Week', 'Last Week', 'Custom Range', 'History']}
      features={[
        'Weekly grid-based time entry',
        'Billable/non-billable tagging per row',
        'Project and task-level time allocation',
        'Time entry notes for billing narrative',
        'Submit for manager approval workflow',
        'Draft save for in-progress week',
        'Historical timesheet review',
      ]}
      dataDisplayed={[
        'Current week time entries',
        'Hours by project and day',
        'Billable vs. non-billable split',
        'Week total and remaining capacity',
        'Timesheet approval status',
      ]}
      userActions={[
        'Enter hours per project per day',
        'Add billing note per time entry',
        'Toggle billable/non-billable',
        'Submit completed timesheet',
        'Recall submitted timesheet for correction',
        'View prior week timesheet history',
      ]}
      relatedPages={[
        { label: 'Team Timesheets', href: '/time/timesheets/team-timesheets' },
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
        { label: 'Task Board', href: '/projects/tasks/task-board' },
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
      ]}
    />
  )
}

