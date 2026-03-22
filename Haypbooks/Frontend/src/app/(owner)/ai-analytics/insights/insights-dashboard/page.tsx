'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="AI Insights Dashboard"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Insights / Insights Dashboard"
      purpose="The AI Insights Dashboard is the central hub for AI-generated business intelligence surfaced from Haypbooks financial data. The AI engine continuously analyzes all transactions, compares patterns against historical data and benchmarks, and surfaces actionable insights: unusual expense spikes, delinquent receivables patterns, cash flow risk alerts, revenue growth opportunities, and cost reduction suggestions. The dashboard presents insights ranked by impact and urgency, so the business owner and CFO know exactly where to focus their attention."
      components={[
        { name: 'Insight Cards', description: 'Each AI insight as a card: title, category (cash flow / revenue / expense / tax), impact level (high/medium/low), supporting data, and recommended action.' },
        { name: 'Insight Categories', description: 'Filter insights by type: Cash Flow Alerts, Revenue Trends, Expense Anomalies, AR/AP Risks, Tax Opportunities, Compliance Alerts.' },
        { name: 'Impact Summary', description: 'Financial impact of all open insights: total estimated value at risk or opportunity.' },
        { name: 'Insight History', description: 'Past insights with resolution status and actual outcome vs. AI prediction.' },
        { name: 'AI Confidence Score', description: 'Each insight shows AI confidence level (based on data completeness and pattern strength).' },
      ]}
      tabs={['All Insights', 'Cash Flow', 'Revenue', 'Expenses', 'Collections', 'Tax', 'Dismissed']}
      features={[
        'AI-generated business insights from financial data',
        'Anomaly detection with explanations',
        'Ranked by financial impact and urgency',
        'Recommended actions for each insight',
        'Insight history and outcome tracking',
        'AI confidence scoring',
        'Integration with all Haypbooks data sources',
      ]}
      dataDisplayed={[
        'All active AI insights with impact and category',
        'Estimated financial impact of each insight',
        'Insight generation date and last updated',
        'AI confidence score per insight',
        'Total portfolio of insight value',
      ]}
      userActions={[
        'Review all AI insights',
        'Filter by insight category',
        'View detail and supporting data for an insight',
        'Act on recommendation',
        'Dismiss or mark insight as resolved',
        'Provide feedback on insight accuracy',
      ]}
      relatedPages={[
        { label: 'Anomaly Detection', href: '/ai-analytics/insights/anomaly-detection' },
        { label: 'AI Recommendations', href: '/ai-analytics/insights/ai-recommendations' },
        { label: 'Cash Flow Forecast', href: '/ai-analytics/predictions/cash-flow-forecast' },
      ]}
    />
  )
}

