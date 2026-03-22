'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Profitability Report"
      module="PROJECTS"
      breadcrumb="Projects / Reports / Profitability Report"
      purpose="The Project Profitability Report calculates the financial performance of each project — revenue billed vs. total costs incurred = gross profit and gross margin %. It identifies which projects are most profitable, which are over budget, and which have billing gaps (costs incurred but not yet billed). This is a critical report for management to assess the commercial performance of the project portfolio and inform future pricing and resource decisions."
      components={[
        { name: 'Profitability Table', description: 'Per project: contract value, revenue billed, total costs (labor + materials + overhead), gross profit, gross margin %.' },
        { name: 'Margin Trend Chart', description: 'Gross margin trend over time for each project or the portfolio.' },
        { name: 'Comparison View', description: 'Compare profitability across multiple projects side by side.' },
        { name: 'Cost Breakdown per Project', description: 'Cost breakdown by category (labor, materials, subcontract, overhead) showing which cost item most impacts margin.' },
        { name: 'Unbilled WIP Impact', description: 'Shows the effect of including or excluding unbilled WIP in the revenue figure for conservative vs. full revenue presentation.' },
      ]}
      tabs={['Project Profitability', 'Portfolio Summary', 'Trend Analysis', 'Cost Breakdown']}
      features={[
        'Per-project gross profit and margin calculation',
        'Portfolio-level profitability summary',
        'Cost category breakdown per project',
        'Unbilled WIP sensitivity analysis',
        'Trend of margin over project lifetime',
        'Export for CFO/management reporting',
      ]}
      dataDisplayed={[
        'Revenue billed, total costs, and gross profit per project',
        'Gross margin % per project',
        'Best and worst performing projects',
        'Portfolio total margin',
        'Unbilled WIP value per project',
      ]}
      userActions={[
        'Run profitability report for a period',
        'Sort projects by margin high-to-low',
        'Drill into cost breakdown for a project',
        'Compare profitability vs. prior period',
        'Export to Excel or PDF for management',
      ]}
      relatedPages={[
        { label: 'Project Budget', href: '/projects/budgets/project-budget' },
        { label: 'Cost Tracking', href: '/projects/budgets/cost-tracking' },
        { label: 'Project Reports', href: '/projects/reports/project-reports' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

