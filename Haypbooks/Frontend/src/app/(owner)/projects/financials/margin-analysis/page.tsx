'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Margin Analysis'
      module='PROJECTS'
      breadcrumb='Projects / Financials / Margin Analysis'
      purpose='Analyzes project gross margin and profitability ratios by comparing revenue earned to total costs incurred. Provides margin trending, benchmarking against targets, and drill-down to identify which project components are driving margin compression or expansion.'
      components={[
        { name: 'Margin Summary Cards', description: 'KPI cards for gross margin, net margin, and margin percentage at project level' },
        { name: 'Margin Trend Chart', description: 'Line chart tracking margin evolution over project lifecycle' },
        { name: 'Component Margin Table', description: 'Margin contribution by billing category: time, expenses, materials, subcontractors' },
        { name: 'Target vs. Actual Margin Gauge', description: 'Visual gauge comparing actual margin against target margin set at project setup' },
        { name: 'Margin Benchmarking Panel', description: 'Compares current project margin to portfolio average and similar past projects' },
      ]}
      tabs={['Project Margin', 'By Component', 'Trend', 'Benchmarks']}
      features={['Gross and net margin calculation', 'Margin trend over project lifecycle', 'Component-level margin contribution', 'Target margin comparison', 'Portfolio benchmarking', 'Margin at completion forecast', 'Multi-currency margin normalization']}
      dataDisplayed={['Project revenue to date', 'Total project cost to date', 'Gross margin amount and percentage', 'Target margin percentage', 'Variance from target', 'Margin at completion forecast', 'Comparison to similar projects average']}
      userActions={['View margin summary', 'Analyze margin by billing component', 'Track margin trend over time', 'Compare to target margin', 'Benchmark against portfolio', 'Forecast margin at completion', 'Export margin analysis report']}
      relatedPages={[
        { label: 'Project Profitability', href: '/projects/financials/project-profitability' },
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
        { label: 'Revenue Trends', href: '/sales/sales-insights/revenue-trends' },
      ]}
    />
  )
}

