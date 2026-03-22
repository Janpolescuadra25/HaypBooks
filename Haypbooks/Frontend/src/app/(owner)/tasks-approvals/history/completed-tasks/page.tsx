'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Completed Tasks"
      module="TASKS"
      breadcrumb="Tasks & Approvals / History / Completed Tasks"
      purpose="Completed Tasks is the historical archive of all tasks that have been marked as complete, showing who completed them, when, and any notes recorded at completion. It provides accountability and audit trail for task-based work, and allows users to reference how recurring tasks were previously handled."
      components={[
        { name: 'Completed Task List', description: 'Filterable list of all completed tasks with title, completor, completion date, and original due date.' },
        { name: 'Completion Detail', description: 'Full task history including original assignment, due date, actual completion date, completion notes, and linked record.' },
        { name: 'Export', description: 'Export completed tasks list to CSV or PDF filtered by date range, user, or module.' },
      ]}
      tabs={['All Completed', 'By Me', 'By Team', 'This Month', 'By Module']}
      features={[
        'Complete audit trail of finished tasks',
        'Filter by completor, date range, or module',
        'On-time vs. late completion analysis',
        'Reopen a completed task if incorrectly closed',
        'Export to CSV for process analysis',
      ]}
      dataDisplayed={[
        'Task title and description',
        'Original assignee and completor',
        'Original due date and actual completion date',
        'On-time indicator (completed before/after due date)',
        'Completion notes and linked record',
      ]}
      userActions={[
        'Search for specific completed task',
        'Filter by date range or team member',
        'View task completion detail and notes',
        'Reopen a task that was incorrectly completed',
        'Export completion history',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Team Tasks', href: '/tasks-approvals/management/team-tasks' },
        { label: 'Approval History', href: '/tasks-approvals/history/approval-history' },
      ]}
    />
  )
}

