'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Sales Performance'
      module='SALES'
      breadcrumb='Sales / Sales Insights / Sales Performance'
      purpose='Evaluates the performance of the sales team by tracking revenue by salesperson, conversion rates, average deal size, and win/loss ratios. Provides the data needed for commissions calculation, performance reviews, and sales strategy optimization.'
      components={[
        { name: 'Salesperson Leaderboard', description: 'Ranked table of salesperson performance by revenue, deals closed, and quota attainment' },
        { name: 'Quota vs. Actuals', description: "Comparison of each salesperson's quota target against actual revenue for the period" },
        { name: 'Pipeline Conversion Funnel', description: 'Visual funnel showing leads to quotes to orders conversion rates' },
        { name: 'Average Deal Size Trend', description: 'Tracks changes in average deal size over time per salesperson or team' },
        { name: 'Win/Loss Analysis', description: 'Breakdown of won vs. lost deals with reason codes and competitive insights' },
      ]}
      tabs={['Leaderboard', 'Quota vs. Actual', 'Pipeline Funnel', 'Win/Loss Analysis']}
      features={['Salesperson revenue leaderboard', 'Quota attainment percentage per salesperson', 'Pipeline conversion funnel metrics', 'Average deal size trending', 'Win/loss ratio and reason analysis', 'Commission calculation data export', 'Team and individual performance comparison']}
      dataDisplayed={['Revenue per salesperson', 'Quota set and attainment percentage', 'Number of deals closed and average size', 'Pipeline conversion rates by stage', 'Win rate and loss rate', 'Top win and loss reasons', 'Commission earned this period']}
      userActions={['View salesperson leaderboard', 'Check quota attainment', 'Analyze pipeline conversion funnel', 'Review win/loss analysis', 'Generate commission report', 'Compare team performance', 'Export sales performance report']}
      relatedPages={[
        { label: 'Revenue Trends', href: '/sales/sales-insights/revenue-trends' },
        { label: 'Customer Profitability', href: '/sales/sales-insights/customer-profitability' },
        { label: 'Sales Orders', href: '/sales/sales-operations/sales-orders' },
      ]}
    />
  )
}

