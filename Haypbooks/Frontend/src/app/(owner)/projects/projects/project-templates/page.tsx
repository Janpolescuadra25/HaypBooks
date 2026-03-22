'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Project Templates"
      module="PROJECTS"
      breadcrumb="Projects / Projects / Project Templates"
      purpose="Project Templates allows creation of reusable project structures — standard task lists, phases, default budgets, billing arrangements, and resource role requirements that are common to a certain type of project (e.g., Audit Engagement, Software Implementation, Construction Phase 1). When creating a new project from a template, all the standard tasks, phases, and budget lines are pre-created, significantly reducing project setup time and ensuring consistency across similar projects."
      components={[
        { name: 'Template Library', description: 'All available project templates with name, type, standard task count, and last used date.' },
        { name: 'Template Builder', description: 'Create a template: name, project type, phases, task list with dependencies, default billing type, and standard resource roles.' },
        { name: 'Create Project from Template', description: 'Select a template and create a new project: enter project-specific details (client, dates) while inheriting all template structure.' },
      ]}
      tabs={['All Templates', 'Create Template', 'Template Details']}
      features={[
        'Reusable project structure templates',
        'Phase and task list in templates',
        'Standard billing type per template (T&M, fixed fee, milestone)',
        'One-click new project from template',
        'Template sharing across the organization',
        'Template version management',
      ]}
      dataDisplayed={[
        'All templates with structure summary',
        'Number of phases and tasks per template',
        'Projects created from each template',
        'Template last modified date',
      ]}
      userActions={[
        'Create a new project template',
        'Add phases and tasks to template',
        'Set default billing type in template',
        'Create a project from a template',
        'Edit or archive a template',
        'Copy and customize an existing template',
      ]}
      relatedPages={[
        { label: 'Project List', href: '/projects/projects/project-list' },
        { label: 'Task Board', href: '/projects/tasks/task-board' },
      ]}
    />
  )
}

