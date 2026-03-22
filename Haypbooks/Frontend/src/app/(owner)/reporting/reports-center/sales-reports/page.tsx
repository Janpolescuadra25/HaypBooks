'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Sales Reports'
      module='REPORTING'
      breadcrumb='Reporting / Reports Center / Sales Reports'
      purpose='Comprehensive sales reporting covering revenue by customer, product, salesperson, and period. Includes invoice aging, collection effectiveness, and sales trend analysis to support revenue management, sales team performance evaluation, and cash flow forecasting.'
      components={[
        { name: 'Revenue Summary', description: 'Total revenue by period with year-over-year comparison' },
        { name: 'Sales by Customer', description: 'Revenue ranking and trend per customer with invoice count' },
        { name: 'Sales by Product/Service', description: 'Revenue breakdown by product or service category' },
        { name: 'Invoice Aging Report', description: 'Outstanding receivables aged into current and overdue buckets' },
        { name: 'Collection Effectiveness Report', description: 'Days sales outstanding (DSO) and collection rate metrics' },
        { name: 'Salesperson Performance', description: 'Revenue attribution by salesperson for commission and performance review' },
      ]}
      tabs={['Revenue Summary', 'By Customer', 'By Product', 'Invoice Aging', 'Collections', 'By Salesperson']}
      features={['Multi-dimension revenue analysis', 'Year-over-year revenue comparison', 'Days sales outstanding (DSO) calculation', 'Collection rate and effectiveness metrics', 'Invoice aging with drill-down', 'Salesperson revenue attribution', 'Export for CRM and sales management']}
      dataDisplayed={['Total revenue for period', 'Top 10 customers by revenue', 'Revenue by product/service', 'Total outstanding receivables (current and aged)', 'Days sales outstanding (DSO)', 'Collection rate percentage', 'Revenue by salesperson']}
      userActions={['View revenue summary report', 'Analyze top customers', 'Review invoice aging', 'Assess collection effectiveness', 'Evaluate salesperson performance', 'Export sales reports', 'Drill into customer or product detail']}
      relatedPages={[
        { label: 'Financial Statements', href: '/reporting/reports-center/financial-statements' },
        { label: 'Expense Reports', href: '/reporting/reports-center/expense-reports' },
        { label: 'Revenue Trends', href: '/sales/sales-insights/revenue-trends' },
      ]}
    />
  )
}

