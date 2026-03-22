'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Project Reports"
      module="PROJECTS"
      breadcrumb="Projects / Reports / Project Reports"
      purpose="Project Reports provides all standard management reports for project portfolio visibility — project status summary, budget utilization across all projects, WIP aging, team utilization, milestone completion, and billing pipeline. Finance directors and operations managers use this report set for board reporting, resource forecasting, and identifying at-risk projects before they significantly overshoot budget or timeline."
      components={[
        { name: 'Project Portfolio Dashboard', description: 'Overview of all active projects: health status, budget utilization %, billing pipeline, and team headcount.' },
        { name: 'Budget Utilization Report', description: 'All projects with budget, actual-to-date, remaining budget, and % utilized.' },
        { name: 'WIP Aging Report', description: 'Unbilled work-in-progress by project sorted by age — identifies revenue recognition or billing delays.' },
        { name: 'Team Utilization Report', description: 'Percentage of billable vs. total logged hours per team member across all projects.' },
        { name: 'Milestone Status Report', description: 'All milestones across projects: planned date, actual completion date, and status.' },
      ]}
      tabs={['Portfolio Overview', 'Budget Utilization', 'WIP Aging', 'Team Utilization', 'Milestones']}
      features={[
        'Portfolio-level project health dashboard',
        'Budget vs. actual across all projects',
        'WIP aging to identify delayed billing',
        'Team utilization and billability metrics',
        'Milestone delivery tracking',
        'Export to Excel/PDF for board reporting',
      ]}
      dataDisplayed={[
        'All active projects with health indicator',
        'Budget utilization % per project',
        'WIP value by project age',
        'Team member billability %',
        'Milestone completion rate',
      ]}
      userActions={[
        'Run project portfolio overview',
        'Drill into individual project reports',
        'Filter reports by project, manager, or client',
        'Export reports to Excel or PDF',
        'Schedule recurring project report delivery',
      ]}
      relatedPages={[
        { label: 'Project List', href: '/projects/projects/project-list' },
        { label: 'Profitability Report', href: '/projects/reports/profitability-report' },
        { label: 'Project Budget', href: '/projects/budgets/project-budget' },
      ]}
    />
  )
}

