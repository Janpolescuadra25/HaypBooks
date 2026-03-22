'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Budget vs. Actual'
      module='PROJECTS'
      breadcrumb='Projects / Financials / Budget vs. Actual'
      purpose='Compares planned project budgets against actual costs incurred to date, providing variance analysis at the project, phase, and cost-category level. Enables proactive cost control by surfacing budget overruns early and forecasting final cost at completion.'
      components={[
        { name: 'BvA Variance Grid', description: 'Side-by-side table of budget, actual, variance amount, and variance percentage per cost category' },
        { name: 'Forecast at Completion (FAC)', description: 'Projects final cost based on current burn rate and remaining work' },
        { name: 'Variance Waterfall Chart', description: 'Visual breakdown of where budget was gained or lost across cost categories' },
        { name: 'Period Filter', description: 'Switch between cumulative and period-specific comparisons' },
        { name: 'Drill-Down Detail', description: 'Expand any cost category to see underlying transactions driving the variance' },
      ]}
      tabs={['Summary', 'By Phase', 'By Cost Category', 'Forecast']}
      features={['Cumulative and period-specific BvA', 'Forecast at completion (FAC) calculation', 'Percentage and absolute variance display', 'Phase-level and category-level drill-down', 'Favorable/unfavorable variance color coding', 'Export to Excel for client reporting', 'Budget revision tracking']}
      dataDisplayed={['Original budget per cost category', 'Revised budget (if change orders applied)', 'Actual costs to date', 'Committed costs (PO and subcontractor)', 'Variance amount and percentage', 'Forecast at completion', 'Cost performance index (CPI)']}
      userActions={['View budget vs. actual summary', 'Drill into variance detail', 'Review forecast at completion', 'Export BvA report', 'Apply budget revision from change order', 'Filter by project phase', 'Compare multiple periods']}
      relatedPages={[
        { label: 'Project Budgets', href: '/projects/project-setup/budgets' },
        { label: 'Cost Breakdown', href: '/projects/financials/cost-breakdown' },
        { label: 'Project Profitability', href: '/projects/financials/project-profitability' },
      ]}
    />
  )
}

