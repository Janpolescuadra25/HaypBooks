'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Revenue Predictions"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Predictions / Revenue Predictions"
      purpose="Revenue Predictions uses trend analysis and machine learning to forecast future revenue for the next 3–12 months, by product line, customer segment, or overall. The model is trained on historical invoicing data and adjusted for known seasonality, contracted recurring revenue, sales pipeline inputs, and macroeconomic signals. Revenue predictions enable the business to set realistic budgets, plan resource hiring, and identify if the company is trending ahead or behind revenue targets."
      components={[
        { name: 'Revenue Forecast Chart', description: 'Monthly revenue forecast for next 12 months vs. current year actuals and prior year comparison.' },
        { name: 'By Segment Breakdown', description: 'Revenue predictions disaggregated by product/service line or customer segment.' },
        { name: 'Growth Rate Analysis', description: 'Predicted YoY growth rate vs. historical growth rate and target.' },
        { name: 'Forecast Accuracy Tracker', description: 'Rolling comparison of prior forecasts vs. actual revenue achieved — model accuracy metric.' },
        { name: 'Revenue Risk Factors', description: 'AI-identified risks: customers with declining order frequency, churn risk, contract renewal timing.' },
      ]}
      tabs={['Revenue Forecast', 'By Segment', 'Growth Analysis', 'Forecast Accuracy', 'Risk Factors']}
      features={[
        'AI revenue prediction for 3–12 months',
        'Segment-level revenue forecast',
        'Seasonality awareness in predictions',
        'YoY growth trend analysis',
        'Forecast accuracy tracking over time',
        'Revenue risk factor identification',
        'Integration with budget and targets',
      ]}
      dataDisplayed={[
        '12-month revenue forecast by month',
        'Forecast vs. actual rolling comparison',
        'Revenue by segment forecast',
        'Growth rate trend',
        'AI prediction confidence bands',
      ]}
      userActions={[
        'View 12-month revenue forecast',
        'Filter by product line or segment',
        'Adjust forecast assumptions',
        'Compare forecast to annual budget',
        'Export revenue forecast report',
        'View forecast accuracy history',
      ]}
      relatedPages={[
        { label: 'Cash Flow Forecast', href: '/ai-analytics/predictions/cash-flow-forecast' },
        { label: 'Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

