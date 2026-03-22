'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Task Templates"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Management / Task Templates"
      purpose="Task Templates allows managers to create reusable task checklists that can be assigned as a bundle rather than creating tasks individually. Templates are useful for recurring workflows like onboarding a new employee, month-end close procedures, or vendor setup. Applying a template creates all tasks at once with correct assignees, due dates, and dependencies."
      components={[
        { name: 'Template Library', description: 'Grid of all saved task templates with name, task count, category, and last used date.' },
        { name: 'Template Builder', description: 'Form to create templates: task list with titles, default assignee roles, relative due dates (e.g., "+3 days from start"), and dependencies.' },
        { name: 'Apply Template Form', description: 'When applying a template: set start date, select specific assignees, and preview the resulting task list before creating.' },
        { name: 'Template Categories', description: 'Organize templates by process type: HR, Accounting, Month-End, Vendor, Customer, etc.' },
      ]}
      tabs={['All Templates', 'HR & Onboarding', 'Accounting', 'Month-End', 'Custom']}
      features={[
        'Reusable task bundle templates',
        'Relative due dates computed from start date',
        'Default assignee role mapping',
        'Task dependency definitions within template',
        'One-click template application creating all tasks',
        'Duplicate and modify existing templates',
      ]}
      dataDisplayed={[
        'Template name, description, and category',
        'Number of tasks in each template',
        'Last applied date and by whom',
        'Default assignee roles per task',
        'Relative due date offsets',
      ]}
      userActions={[
        'Create a new task template',
        'Edit an existing template',
        'Apply a template to create a task bundle',
        'Duplicate a template to modify',
        'Delete obsolete templates',
        'Export template definition',
      ]}
      relatedPages={[
        { label: 'Team Tasks', href: '/tasks-approvals/management/team-tasks' },
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Automation Workflows', href: '/automation/workflow-engine/workflow-builder' },
      ]}
    />
  )
}

