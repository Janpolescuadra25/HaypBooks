'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Team Tasks"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Management / Team Tasks"
      purpose="Team Tasks provides managers and team leads with a bird's-eye view of all tasks across their team members. It shows current workload distribution, overdue items by person, and overall team task health. Managers can reassign tasks, create new team-wide tasks, and monitor progress without needing to log in as individual users."
      components={[
        { name: 'Team Overview Bar', description: 'Summary of total open tasks, overdue tasks, and completed tasks for the team this week.' },
        { name: 'Per-Member Task View', description: 'Collapsible list of team members each showing their open task count, overdue count, and tasks due today.' },
        { name: 'Combined Task List', description: 'Flat list of all team tasks with assignee column, sortable and filterable.' },
        { name: 'Workload Chart', description: 'Bar chart showing task count per team member to quickly identify overloaded or underutilized members.' },
        { name: 'Assign Task Button', description: 'Create a task and assign to any team member with due date and priority.' },
      ]}
      tabs={['All Team Tasks', 'By Member', 'Overdue', 'Completed This Week']}
      features={[
        'Full team task visibility for managers',
        'Workload balance visualization',
        'Reassign any task to balance workload',
        'Create tasks and assign to any team member',
        'Filter by member, priority, module, or due date',
        'Export team task report',
      ]}
      dataDisplayed={[
        'All team members and their open task counts',
        'Task titles, assignees, due dates, priorities',
        'Overdue task count per member',
        'Tasks completed this week per member',
        'Source module for each task',
      ]}
      userActions={[
        'View all tasks for a specific team member',
        'Reassign a task from one member to another',
        'Create a new task for any team member',
        'Mark a task complete on behalf of a team member',
        'Export team task list as CSV',
        'Filter team tasks by module or priority',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Approval Queue', href: '/tasks-approvals/management/approval-queue' },
        { label: 'Delegated Tasks', href: '/tasks-approvals/management/delegated-tasks' },
      ]}
    />
  )
}

