'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Templates'
      module='PROJECTS'
      breadcrumb='Projects / Project Setup / Project Templates'
      purpose='Provides a library of reusable project templates that standardize the creation of new projects for common project types. Templates can include predefined WBS, task lists, budget structures, and billing configurations, significantly reducing project setup time.'
      components={[
        { name: 'Template Library', description: 'Catalog of available templates organized by project type and industry' },
        { name: 'Template Builder', description: 'Visual editor for defining WBS, tasks, budget structure, and settings' },
        { name: 'Template Application Wizard', description: 'Guided workflow to apply a template when creating a new project' },
        { name: 'Template Version Manager', description: 'Track and manage template versions and updates' },
        { name: 'Template Sharing Controls', description: 'Define visibility: personal, team, or organization-wide' },
      ]}
      tabs={['Template Library', 'My Templates', 'Organization Templates', 'Template Builder']}
      features={['Visual template builder with WBS editor', 'Template categories by project type', 'Budget structure templates linked to templates', 'Automatic task and milestone creation on template apply', 'Template sharing and permissions', 'Template import/export', 'Template usage analytics']}
      dataDisplayed={['Template name and description', 'Project type and industry', 'Predefined phases and tasks', 'Default budget structure', 'Default billing method', 'Usage count and last used date', 'Created by and sharing scope']}
      userActions={['Create new template', 'Define WBS and task structure', 'Set default budget categories', 'Apply template to new project', 'Update existing template', 'Share template with team', 'Export template for backup']}
      relatedPages={[
        { label: 'Projects', href: '/projects/project-setup/projects' },
        { label: 'Project Tasks', href: '/projects/planning/project-tasks' },
        { label: 'Budgets', href: '/projects/project-setup/budgets' },
      ]}
    />
  )
}

