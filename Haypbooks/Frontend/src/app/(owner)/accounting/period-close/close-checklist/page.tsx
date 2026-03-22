'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Close Checklist"
      module="ACCOUNTING"
      breadcrumb="Accounting / Period Close / Close Checklist"
      purpose="The Close Checklist is the master workflow management tool for the month-end and year-end close process. It organizes all closing tasks into a sequential checklist with deadlines, owners, status tracking, and dependencies. The checklist ensures completeness: all transactions recorded, adjustments posted, sub-ledgers reconciled, financial statements generated, and period locked. It significantly reduces close time by providing a transparent, trackable, team-coordinated close workflow."
      components={[
        { name: 'Close Progress Summary', description: 'Progress bar showing: tasks completed / total tasks, current close status, and estimated close date based on remaining tasks.' },
        { name: 'Task Checklist', description: 'Step-by-step checklist with task name, category, assigned owner, due date/time, and status (Not Started, In Progress, Completed, Blocked).' },
        { name: 'Dependency Map', description: 'Visual dependency tree showing which tasks must be completed before others can begin.' },
        { name: 'Issues Log', description: 'Track blocked items and open questions preventing close task completion with responsible party and resolution updates.' },
        { name: 'Close History', description: 'Archive of prior month closes with actual close date, time taken, and issues encountered.' },
      ]}
      tabs={['Checklist', 'Dependencies', 'Issues Log', 'History', 'Settings']}
      features={[
        'Configurable close workflow with task templates',
        'Multi-user task assignment with deadlines',
        'Dependency-aware task ordering',
        'Issue/blocker tracking with resolution workflow',
        'Close progress tracking and broadcast',
        'Prior period comparison for efficiency',
        'Automated task triggers (e.g., auto-start depreciation task)',
      ]}
      dataDisplayed={[
        'Complete close task list with status',
        'Task owner and due deadline',
        'Overall close completion percentage',
        'Open issues blocking close',
        'Close timeline vs. target date',
        'Prior month close performance metrics',
      ]}
      userActions={[
        'Mark a close task as complete',
        'Assign task to a team member',
        'Log a close issue or blocker',
        'Resolve an issue and unblock dependent tasks',
        'Reopen a task for correction',
        'View dependency map before starting',
        'Initiate the lock-period action when all tasks complete',
      ]}
      relatedPages={[
        { label: 'Journal Post', href: '/accounting/period-close/journal-post' },
        { label: 'Lock Periods', href: '/accounting/period-close/lock-periods' },
        { label: 'Period Reports', href: '/accounting/period-close/period-reports' },
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
      ]}
    />
  )
}

