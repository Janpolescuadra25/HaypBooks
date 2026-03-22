'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Task Board"
      module="PROJECTS"
      breadcrumb="Projects / Tasks / Task Board"
      purpose="The Task Board is the project team's visual collaboration tool — a Kanban board displaying tasks by status (To Do, In Progress, Review, Done). Each card shows the task assignee, due date, priority, and project. Team members can drag and drop cards between columns to update status, open a task to log time or update details, and see at a glance which tasks are overdue or blocked. The Task Board bridges project management with the time-recording and billing workflow."
      components={[
        { name: 'Kanban Board', description: 'Tasks organized in columns by status: To Do → In Progress → Review → Done. Drag-and-drop status update.' },
        { name: 'Task Card', description: 'Each task shows: title, assignee avatar, due date, priority (High/Medium/Low), and a time logged indicator.' },
        { name: 'Task Detail Drawer', description: 'Open a task: full description, comments, attachments, time log, checklist, and history.' },
        { name: 'Filter and Grouping Controls', description: 'Filter by project, assignee, due date, priority, or tag. Group by project or phase.' },
        { name: 'Sprint/Phase View', description: 'Group tasks by project phase or sprint for structured project delivery teams.' },
      ]}
      tabs={['Board', 'List', 'Timeline', 'My Tasks', 'Backlog']}
      features={[
        'Visual kanban task status management',
        'Drag-and-drop status transitions',
        'Time logging directly from task card',
        'Task filtering and grouping',
        'Priority and due date tracking',
        'Phase/sprint grouping',
        'Task comments and file attachments',
      ]}
      dataDisplayed={[
        'Tasks by status column',
        'Overdue tasks highlighted',
        'Time logged vs. estimated per task',
        'Assignee workload indicator',
        'Task priority and deadline',
      ]}
      userActions={[
        'Create a new task',
        'Assign task to team member',
        'Move task between status columns',
        'Log time spent on a task',
        'Add comments or attachments',
        'Update priority and due date',
        'Mark task as completed',
      ]}
      relatedPages={[
        { label: 'Project List', href: '/projects/projects/project-list' },
        { label: 'Task List', href: '/projects/tasks/task-list' },
        { label: 'Timesheets', href: '/time/timesheets/my-timesheet' },
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
      ]}
    />
  )
}

