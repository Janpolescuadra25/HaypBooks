'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Cost Breakdown'
      module='PROJECTS'
      breadcrumb='Projects / Financials / Cost Breakdown'
      purpose='Provides a granular decomposition of all project costs by category, including labor, materials, subcontractors, equipment, and overhead. Enables project managers and finance teams to understand cost composition and identify areas of cost concentration or inefficiency.'
      components={[
        { name: 'Cost Category Tree', description: 'Hierarchical tree view of cost categories with expandable sub-categories' },
        { name: 'Cost Distribution Chart', description: 'Pie or donut chart showing percentage of total cost per category' },
        { name: 'Line-Item Cost Table', description: 'Detailed table listing every cost transaction with date, vendor, and amount' },
        { name: 'Committed vs. Incurred Panel', description: 'Separates costs already invoiced from purchase orders and commitments' },
        { name: 'Period Comparison View', description: 'Compare cost breakdown across multiple reporting periods' },
      ]}
      tabs={['By Category', 'By Vendor', 'By Phase', 'By Team Member']}
      features={['Multi-level cost category hierarchy', 'Committed cost tracking (POs and contracts)', 'Labor cost vs. non-labor cost split', 'Overhead allocation display', 'Cost per unit calculations', 'Month-over-month cost trend', 'Export detailed cost report']}
      dataDisplayed={['Total project cost to date', 'Cost by category (labor, materials, subs, equipment, overhead)', 'Percentage of total per category', 'Committed but not yet invoiced amounts', 'Top 5 vendors by cost', 'Cost per deliverable or phase', 'Average daily burn rate']}
      userActions={['View cost breakdown by category', 'Drill into cost category detail', 'Compare incurred vs. committed costs', 'Export cost breakdown report', 'Filter by date range or phase', 'Analyze vendor cost concentration', 'Identify largest cost drivers']}
      relatedPages={[
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
        { label: 'Margin Analysis', href: '/projects/financials/margin-analysis' },
        { label: 'Project Expenses', href: '/projects/tracking/project-expenses' },
      ]}
    />
  )
}

