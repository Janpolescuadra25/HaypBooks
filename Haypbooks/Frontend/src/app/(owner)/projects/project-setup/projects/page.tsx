'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Projects'
      module='PROJECTS'
      breadcrumb='Projects / Project Setup / Projects'
      purpose='Master list and creation hub for all client and internal projects. Stores core project details including client, project manager, billing method, start and end dates, and financial targets. Serves as the entry point for all project management and financial tracking activities.'
      components={[
        { name: 'Project Catalog Table', description: 'Paginated table of all projects with key fields and status badges' },
        { name: 'New Project Wizard', description: 'Step-by-step form for creating a project with client, billing, budget, and team setup' },
        { name: 'Project Status Workflow', description: 'Status lifecycle management: prospect, active, on-hold, complete, closed' },
        { name: 'Project Clone Tool', description: 'Duplicates an existing project structure including budget and tasks' },
        { name: 'Project Archive Manager', description: 'Manages archival of completed projects for historical reference' },
      ]}
      tabs={['All Projects', 'Active', 'On Hold', 'Completed', 'Archived']}
      features={['Quick project creation with template support', 'Project status lifecycle management', 'Project cloning from templates or existing projects', 'Client and project manager assignment', 'Budget and billing method configuration at creation', 'Custom fields per project', 'Bulk status update']}
      dataDisplayed={['Project name and number', 'Client / customer', 'Project manager', 'Status (prospect, active, on-hold, complete)', 'Start date and projected end date', 'Contract value', 'Billing method']}
      userActions={['Create new project', 'Clone from template or existing project', 'Update project status', 'Assign project manager', 'Edit project details', 'Archive completed project', 'Export project list']}
      relatedPages={[
        { label: 'Project Templates', href: '/projects/project-setup/project-templates' },
        { label: 'Contracts', href: '/projects/project-setup/contracts' },
        { label: 'Budgets', href: '/projects/project-setup/budgets' },
      ]}
    />
  )
}

