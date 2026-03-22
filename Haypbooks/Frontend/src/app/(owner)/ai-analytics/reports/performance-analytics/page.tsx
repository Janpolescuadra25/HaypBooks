'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Performance Analytics"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Reports / Performance Analytics"
      purpose="Performance Analytics provides a comprehensive view of the company's financial performance through AI-enhanced dashboards — revenue growth, profitability trends, margin analysis, working capital efficiency (DSO, DPO, inventory turns), and operational expense ratios. The AI layer highlights which KPIs are trending positive or negative, benchmarks performance against industry averages (if data is available), and provides narrative-style explanations of performance drivers — translating financial numbers into plain-language business intelligence for owners and non-finance stakeholders."
      components={[
        { name: 'KPI Dashboard', description: 'Top KPIs: Revenue, Gross Margin, Net Margin, EBITDA, DSO, DPO, Quick Ratio, Current Ratio — with trend vs. prior period.' },
        { name: 'Revenue Analysis', description: 'Detailed revenue breakdown: by period, product line, customer, and geography. YoY and MoM growth rates.' },
        { name: 'Profitability Analysis', description: 'Gross profit, operating profit, and net profit margin trends. Variance drivers: price vs. volume vs. mix.' },
        { name: 'Expense Ratio Analysis', description: 'Operating expense as % of revenue by category. Compare to prior periods and budget.' },
        { name: 'Working Capital Analysis', description: 'DSO, DPO, inventory days trend. Cash conversion cycle tracking.' },
        { name: 'AI Narrative', description: 'Plain-language AI-generated summary of the period\'s performance: what drove growth or decline, what to watch.' },
      ]}
      tabs={['KPI Summary', 'Revenue', 'Profitability', 'Expenses', 'Working Capital', 'AI Narrative']}
      features={[
        'Comprehensive financial KPI dashboard',
        'Revenue and profitability trend analysis',
        'Operating efficiency metrics (DSO, DPO)',
        'AI-generated plain-language performance narrative',
        'Industry benchmarking (where data available)',
        'Period-over-period comparison',
        'Exportable analytics report',
      ]}
      dataDisplayed={[
        'Core financial KPIs with trend arrows',
        'Revenue by period and segment',
        'Gross and net margin trends',
        'Operating expense ratios',
        'Working capital efficiency ratios',
        'AI-generated narrative explanation',
      ]}
      userActions={[
        'View comprehensive performance dashboard',
        'Drill down into revenue or expense detail',
        'Select comparison period',
        'Read AI performance narrative',
        'Export analytics report',
        'Share dashboard with stakeholders',
      ]}
      relatedPages={[
        { label: 'Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
        { label: 'Trend Analysis', href: '/ai-analytics/reports/trend-analysis' },
        { label: 'Cash Flow Forecast', href: '/ai-analytics/predictions/cash-flow-forecast' },
      ]}
    />
  )
}

