'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Project Budget"
      module="PROJECTS"
      breadcrumb="Projects / Budgets / Project Budget"
      purpose="Project Budget manages the cost budget and revenue target for each project. The budget is defined by cost category (labor hours × rate, subcontractors, materials, overheads) and is compared against actual costs as the project progresses. The project budget drives the profitability forecast and is the basis for variance analysis. Budget entries can be phase-specific for multi-phase projects, enabling phase-level cost control and billing milestone alignment."
      components={[
        { name: 'Budget Entry Grid', description: 'Per project: budget line items by cost category with budgeted amount, actual to date, and variance.' },
        { name: 'Revenue Budget', description: 'Target billings: contract value, phased billing targets, and actual billed-to-date vs. target.' },
        { name: 'Phase Budget Breakdown', description: 'For multi-phase projects: budget allocated per phase and actual costs per phase.' },
        { name: 'Budget vs. Actual Chart', description: 'Visual bar chart of budget vs. actual cost by category for quick management review.' },
        { name: 'Budget Revision Log', description: 'History of budget revisions with reason, date, and approval.' },
      ]}
      tabs={['Budget vs. Actual', 'Phase Budget', 'Revenue Budget', 'Revision History']}
      features={[
        'Project cost budget by category',
        'Revenue target and contract value tracking',
        'Phase-level budget allocation',
        'Real-time budget vs. actual comparison',
        'Budget revision management with approval',
        'Profitability forecast based on budget',
        'Budget utilization alerts',
      ]}
      dataDisplayed={[
        'Budget vs. actual per cost category',
        'Remaining budget per category',
        'Revenue target vs. billed-to-date',
        'Estimated final cost vs. budget',
        'Budget utilization %',
      ]}
      userActions={[
        'Create project budget',
        'Enter budget by phase and cost category',
        'Update revenue target',
        'Submit budget revision with reason',
        'Approve budget revision',
        'View profitability forecast',
        'Export budget report',
      ]}
      relatedPages={[
        { label: 'Project List', href: '/projects/projects/project-list' },
        { label: 'Cost Tracking', href: '/projects/budgets/cost-tracking' },
        { label: 'Profitability Report', href: '/projects/reports/profitability-report' },
        { label: 'Project Invoicing', href: '/projects/time-billing/project-invoicing' },
      ]}
    />
  )
}

