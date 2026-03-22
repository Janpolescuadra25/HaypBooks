'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Performance Center'
      module='REPORTING'
      breadcrumb='Reporting / Performance Center'
      purpose='An executive-level analytics hub that aggregates KPIs, financial ratios, and performance metrics across all business functions into customizable dashboards. Enables leadership to monitor business health, track strategic goals, and identify performance trends in real time.'
      components={[
        { name: 'KPI Dashboard Builder', description: 'Drag-and-drop canvas for arranging KPI cards, charts, and metrics' },
        { name: 'Financial Ratio Calculator', description: 'Computes liquidity, solvency, profitability, and efficiency ratios automatically' },
        { name: 'Goal Tracker', description: 'Set financial and operational targets and track actual performance against them' },
        { name: 'Trend Analysis Charts', description: 'Long-range trend lines for revenue, costs, margins, and cash flow' },
        { name: 'Benchmarking Panel', description: 'Compares business performance against industry averages or prior periods' },
        { name: 'Drill-Through Navigation', description: 'Click any KPI to navigate to the underlying report for detail' },
      ]}
      tabs={['Executive Dashboard', 'Financial Ratios', 'Goal Tracking', 'Trends', 'Benchmarks']}
      features={['Fully customizable KPI dashboard', 'Automatic financial ratio computation', 'Target-vs-actual goal tracking', 'Long-range historical trend charts', 'Industry benchmarking integration', 'Drill-through to source reports', 'Share dashboard with stakeholders']}
      dataDisplayed={['Revenue, gross profit, and net income KPIs', 'Liquidity ratios (current, quick)', 'Profitability ratios (ROA, ROE, EBITDA margin)', 'Efficiency ratios (AR days, AP days, inventory turnover)', 'Goal progress percentage', 'Period-over-period variance', 'Benchmark comparison deltas']}
      userActions={['Build custom KPI dashboard', 'Add financial ratio cards', 'Set performance goals', 'Analyze trend charts', 'Compare to benchmarks', 'Drill into any KPI', 'Share dashboard with leadership']}
      relatedPages={[
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Custom Reports', href: '/reporting/custom-reports' },
        { label: 'Financial Statements', href: '/reporting/reports-center/financial-statements' },
      ]}
    />
  )
}

