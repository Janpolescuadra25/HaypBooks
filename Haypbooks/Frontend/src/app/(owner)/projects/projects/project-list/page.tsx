'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Project List"
      module="PROJECTS"
      breadcrumb="Projects / Projects / Project List"
      purpose="Project List is the master directory of all active and completed projects. Each project record tracks the project name, client, project manager, start date, target end date, budget, actual costs-to-date, billing status, and overall project health. Projects serve as cost centers for time, expenses, and purchase tracking. Project profitability is calculated by comparing total billing against total costs. This is the starting point for project-based accounting and management."
      components={[
        { name: 'Project Table', description: 'All projects with name, client, manager, status, budget, actual cost, billed amount, and health indicator.' },
        { name: 'Project Dashboard Card', description: 'For each project: key metrics at a glance — budget remaining, % completion, days to deadline, unbilled time, open tasks.' },
        { name: 'Project Status Pipeline', description: 'Kanban-style view: Planning → Active → On Hold → Completing → Completed.' },
        { name: 'Profitability Summary', description: 'For each project: total revenue billed vs. total costs incurred = gross profit and margin %.' },
      ]}
      tabs={['All Projects', 'Active', 'Planning', 'On Hold', 'Completed']}
      features={[
        'Comprehensive project registry and status tracking',
        'Budget vs. actual cost monitoring',
        'Profitability calculation per project',
        'Project health indicator (on-track/at-risk/over-budget)',
        'Client and project manager assignment',
        'Project filtering by client, manager, or status',
        'Export project list for reporting',
      ]}
      dataDisplayed={[
        'All projects with status and health',
        'Budget vs. actual costs',
        'Revenue billed vs. target',
        'Project timeline and deadline',
        'Unbilled hours summary per project',
      ]}
      userActions={[
        'Create a new project',
        'Update project status',
        'Assign project manager and team members',
        'Set project budget',
        'View project dashboard',
        'Archive a completed project',
        'Export project list',
      ]}
      relatedPages={[
        { label: 'Project Budgets', href: '/projects/budgets/project-budget' },
        { label: 'Project Invoicing', href: '/projects/time-billing/project-invoicing' },
        { label: 'Task Board', href: '/projects/tasks/task-board' },
        { label: 'Profitability Report', href: '/projects/reports/profitability-report' },
      ]}
    />
  )
}

