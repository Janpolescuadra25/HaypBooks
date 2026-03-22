'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Trend Analysis"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Reports / Trend Analysis"
      purpose="Trend Analysis visualizes long-term financial trends over rolling 12, 24, or 36-month periods — revenue trajectory, expense growth rate, margin compression or expansion, headcount cost growth vs. revenue growth, and customer concentration trend. By understanding multi-year trends, business owners can identify structural shifts early: a gradual margin erosion, an increasing dependency on a single customer, or a rising fixed cost base. The AI highlights trend inflection points and assesses their business significance."
      components={[
        { name: 'Trend Line Charts', description: 'Rolling 12–36 month charts for: revenue, gross margin, net margin, OPEX, and headcount costs.' },
        { name: 'Trend Statistical Analysis', description: 'Linear regression trend line, growth rate (CAGR), and volatility (coefficient of variation) per metric.' },
        { name: 'Inflection Point Detector', description: 'AI-flagged points where a trend changed direction — with context about what happened.' },
        { name: 'Customer Concentration Trend', description: 'Top 5 customer revenue % over time — rising concentration is a business risk.' },
        { name: 'Cost Structure Evolution', description: 'How the mix of costs has changed: fixed vs. variable, people costs vs. non-people.' },
      ]}
      tabs={['Revenue Trends', 'Margin Trends', 'Expense Trends', 'Customer Concentration', 'Cost Structure']}
      features={[
        '12/24/36-month rolling trend analysis',
        'Statistical trend line and growth rate',
        'AI inflection point detection',
        'Customer revenue concentration trend',
        'Cost structure evolution analysis',
        'Margin expansion/compression trend',
        'Export trend analysis report',
      ]}
      dataDisplayed={[
        'Multi-year revenue trend',
        'Gross and net margin trend over time',
        'Operating expense trend by category',
        'Revenue concentration by top customers',
        'Fixed vs. variable cost trend',
        'AI-flagged inflection points',
      ]}
      userActions={[
        'Select trend period (12/24/36 months)',
        'Filter to specific financial metrics',
        'View inflection point explanations',
        'Compare customer concentration over time',
        'Export trend analysis charts',
      ]}
      relatedPages={[
        { label: 'Performance Analytics', href: '/ai-analytics/reports/performance-analytics' },
        { label: 'Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

