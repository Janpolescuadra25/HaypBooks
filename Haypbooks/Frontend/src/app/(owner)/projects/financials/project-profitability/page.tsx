'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Profitability'
      module='PROJECTS'
      breadcrumb='Projects / Financials / Project Profitability'
      purpose='Comprehensive profitability report for individual projects and the entire project portfolio, combining revenue, cost, overhead allocation, and indirect expenses to produce true project profit figures. Supports strategic decisions on project selection, pricing, and resource allocation.'
      components={[
        { name: 'Profitability Summary Table', description: 'Project-by-project comparison of revenue, cost, and profit with sorting and filtering' },
        { name: 'P&L Statement per Project', description: 'Mini income statement for each project showing all revenue and cost lines' },
        { name: 'Overhead Allocation Panel', description: 'Distributes shared company overhead to projects based on configured allocation keys' },
        { name: 'Portfolio Profitability Chart', description: 'Bar chart comparing profit across all active and completed projects' },
        { name: 'Profitability Drill-Down', description: 'Expand any project to see revenue by billing type and cost by category' },
      ]}
      tabs={['Portfolio View', 'Project P&L', 'Overhead Allocation', 'Completed Projects']}
      features={['True project P&L with overhead allocation', 'Configurable overhead allocation keys', 'Portfolio-level profitability aggregation', 'Completed project profitability history', 'Client-level profitability rollup', 'Project manager performance comparison', 'Export for management reporting']}
      dataDisplayed={['Revenue per project (billed and unbilled)', 'Direct costs (labor, materials, subs)', 'Allocated overhead', 'Gross profit and net profit', 'Profit margin percentage', 'ROI per project', 'Client lifetime profitability']}
      userActions={['View portfolio profitability', 'Analyze individual project P&L', 'Configure overhead allocation keys', 'Compare project manager performance', 'Filter by client or project type', 'Export profitability report', 'Identify loss-making projects']}
      relatedPages={[
        { label: 'Margin Analysis', href: '/projects/financials/margin-analysis' },
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
        { label: 'Customer Profitability', href: '/sales/sales-insights/customer-profitability' },
      ]}
    />
  )
}

