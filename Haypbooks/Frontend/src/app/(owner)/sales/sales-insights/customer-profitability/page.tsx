'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Customer Profitability'
      module='SALES'
      breadcrumb='Sales / Sales Insights / Customer Profitability'
      purpose='Analyzes the true profitability of each customer by comparing revenue generated against all direct costs, service costs, support costs, and allocated overheads. Enables strategic decisions on customer retention, pricing adjustments, and resource investment per customer relationship.'
      components={[
        { name: 'Customer Profitability Ranking', description: 'Ranked table of customers by gross profit, net profit, and margin percentage' },
        { name: 'Customer P&L View', description: 'Mini income statement per customer showing revenue, direct costs, and profit' },
        { name: 'Cost Attribution Model', description: 'Allocates support, account management, and indirect costs to each customer' },
        { name: 'Profitability Trend Chart', description: 'Customer-level margin trend over past 12 months' },
        { name: 'Segment Heatmap', description: 'Heatmap of profitability across customer segments and regions' },
      ]}
      tabs={['Customer Ranking', 'Customer P&L', 'Cost Attribution', 'Trends', 'Segment View']}
      features={['True customer profitability with cost allocation', 'Customer-level P&L statement', 'Configurable cost attribution model', 'Profitability trend analysis', 'Customer segment heatmap', 'Lifetime value (LTV) calculation', 'Export customer profitability report']}
      dataDisplayed={['Revenue per customer', 'Direct cost of service', 'Allocated overhead and support cost', 'Gross and net profit per customer', 'Profit margin percentage', 'Lifetime value (LTV)', 'Revenue and margin trend over 12 months']}
      userActions={['View customer profitability ranking', 'Analyze customer P&L', 'Configure cost attribution', 'Identify unprofitable customers', 'Review customer margin trends', 'Export profitability analysis', 'Make pricing recommendations']}
      relatedPages={[
        { label: 'Revenue Trends', href: '/sales/sales-insights/revenue-trends' },
        { label: 'Sales Performance', href: '/sales/sales-insights/sales-performance' },
        { label: 'Customer Groups', href: '/sales/customers/customer-groups' },
      ]}
    />
  )
}

