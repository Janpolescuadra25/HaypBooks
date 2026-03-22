'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cost Tracking"
      module="PROJECTS"
      breadcrumb="Projects / Budgets / Cost Tracking"
      purpose="Cost Tracking monitors all actual costs incurred by a project — labor costs from time entries, direct material purchases, vendor bills, employee expenses, and overhead allocations. All costs coded to a project code are captured here, giving the project manager full visibility into total WIP costs. This is the aggregate view of the project P&L: estimated revenue vs. total costs traceable to the project."
      components={[
        { name: 'Cost Ledger by Category', description: 'Total actual costs per project grouped by category: Labor, Materials, Subcontractors, Expenses, Overhead.' },
        { name: 'Transaction Detail', description: 'Drill into each category to see individual transactions: timesheet entries, PO lines, bills, expense reports charged to this project.' },
        { name: 'Cost-to-Revenue Ratio', description: 'Total costs vs. total billings: the project P&L showing gross margin.' },
        { name: 'Committed Costs', description: 'Costs committed but not yet incurred: open POs, unapproved expense reports coded to the project.' },
      ]}
      tabs={['By Category', 'Transaction Detail', 'Labor Costs', 'Material Costs', 'Committed Costs']}
      features={[
        'Consolidated project cost view from all transaction types',
        'Labor cost from timesheets at billing or cost rates',
        'Direct material from POs and bills',
        'Expense reimbursements coded to project',
        'Committed cost tracking (open POs)',
        'Project gross margin calculation',
      ]}
      dataDisplayed={[
        'Actual costs by category and transaction',
        'Committed (not-yet-incurred) costs',
        'Total project cost vs. revenue',
        'Cost per phase or milestone',
        'Cost trend over project timeline',
      ]}
      userActions={[
        'View all costs for a project',
        'Drill into cost category transactions',
        'View labor hours at cost vs. billing rate',
        'Track committed costs (open POs)',
        'Export project cost report',
      ]}
      relatedPages={[
        { label: 'Project Budget', href: '/projects/budgets/project-budget' },
        { label: 'Project Invoicing', href: '/projects/time-billing/project-invoicing' },
        { label: 'Profitability Report', href: '/projects/reports/profitability-report' },
      ]}
    />
  )
}

