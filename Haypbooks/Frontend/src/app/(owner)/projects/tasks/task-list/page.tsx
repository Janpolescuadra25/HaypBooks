'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Task List"
      module="PROJECTS"
      breadcrumb="Projects / Tasks / Task List"
      purpose="The Task List is the tabular view of all project tasks — an alternative to the Kanban board for teams who prefer a list format. All tasks from all projects are visible, filterable, and sortable. Project managers use the task list to track overall delivery status, identify overdue tasks, reassign tasks, and view time-logged vs. estimated effort per task. The list view is also the export format for project status reporting to clients or management."
      components={[
        { name: 'Task Table', description: 'All tasks with project, task name, assignee, due date, status, priority, estimated hours, and logged hours.' },
        { name: 'Bulk Edit Panel', description: 'Select multiple tasks and update assignee, due date, priority, or status in batch.' },
        { name: 'Gantt Timeline Option', description: 'Switch to Gantt chart view: shows tasks as bars on a timeline with dependencies.' },
        { name: 'Export Controls', description: 'Export filtered task list to Excel or print as project status report for client.' },
      ]}
      tabs={['All Tasks', 'My Tasks', 'Overdue', 'By Project', 'Completed']}
      features={[
        'Tabular list of all project tasks',
        'Filter and sort by project, assignee, due date, status',
        'Bulk task updates',
        'Gantt chart view option',
        'Estimation vs. actual hours per task',
        'Export to Excel for client reporting',
        'Task dependency management',
      ]}
      dataDisplayed={[
        'All tasks with status, assignee, due date',
        'Estimated vs. logged hours per task',
        'Overdue tasks flagged',
        'Task completion percentage per project',
        'Blocked tasks (waiting on dependencies)',
      ]}
      userActions={[
        'Create a new task from list view',
        'Reassign a task to another team member',
        'Update task status in bulk',
        'Sort and filter task list',
        'View Gantt chart of project timeline',
        'Export task list',
        'Delete or archive completed tasks',
      ]}
      relatedPages={[
        { label: 'Task Board', href: '/projects/tasks/task-board' },
        { label: 'Project List', href: '/projects/projects/project-list' },
        { label: 'Timesheets', href: '/time/timesheets/my-timesheet' },
      ]}
    />
  )
}

