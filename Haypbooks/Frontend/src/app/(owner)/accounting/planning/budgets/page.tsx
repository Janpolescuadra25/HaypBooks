'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Budgets"
      module="ACCOUNTING"
      breadcrumb="Accounting / Planning / Budgets"
      purpose="The Budgets page is the annual budget input and management tool. Finance teams create detailed operating budgets by account, department, cost center, and month. Budgets can be built from scratch, based on prior year actuals with adjustments, or by allocating top-down targets to departments. Once approved, the budget locks and flows through to the Budget vs. Actual report for ongoing performance monitoring throughout the year."
      components={[
        { name: 'Budget Input Grid', description: 'Spreadsheet-style input grid: rows are accounts/departments, columns are months. Direct cell entry with totals row and column.' },
        { name: 'Budget Version Manager', description: 'Manage multiple budget versions: Draft, Under Review, Approved, Revised. Toggle between versions for comparison.' },
        { name: 'Copy From Prior Year', description: 'Pre-populate budget grid from prior year actuals with an optional growth/adjustment percentage.' },
        { name: 'Top-Down Allocation', description: 'Enter a total budget target and allocate it across departments using configured allocation drivers.' },
        { name: 'Approval Workflow', description: 'Submit budget for review and approval. Each department submits their budget section; controller consolidates and approves.' },
      ]}
      tabs={['Budget Input', 'Versions', 'Department View', 'Approval', 'Summary']}
      features={[
        'Spreadsheet-like budget input interface',
        'Multi-version budget management',
        'Copy from prior year with growth assumptions',
        'Department-level budget submission and consolidation',
        'Budget approval workflow',
        'Revenue and expense budget by account and month',
        'Headcount and payroll budget section',
      ]}
      dataDisplayed={[
        'Monthly budget amounts by account and department',
        'Annual total per budget line',
        'Budget totals by P&L category',
        'Version history and approval status',
        'Headcount assumption inputs',
        'Revenue and cost assumptions',
      ]}
      userActions={[
        'Enter monthly budget amounts per account',
        'Copy prior year actuals as budget starting point',
        'Apply growth percentage to copied actuals',
        'Submit department budget for approval',
        'Approve consolidated company budget',
        'Create a revised or supplemental budget',
        'Export budget to Excel',
      ]}
      relatedPages={[
        { label: 'Budget vs. Actual', href: '/accounting/planning/budget-vs-actual' },
        { label: 'Forecasts', href: '/accounting/planning/forecasts' },
        { label: 'Scenario Planning', href: '/accounting/planning/scenario-planning' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

