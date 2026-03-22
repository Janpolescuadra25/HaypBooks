'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Revenue Trends'
      module='SALES'
      breadcrumb='Sales / Sales Insights / Revenue Trends'
      purpose='Provides long-range revenue trend analysis across multiple dimensions including time period, customer, product, geography, and sales channel. Identifies growth patterns, seasonal cycles, and anomalies to inform revenue forecasting and strategic planning.'
      components={[
        { name: 'Revenue Trend Line Chart', description: 'Multi-period revenue line chart with selectable granularity: daily, weekly, monthly, quarterly' },
        { name: 'Dimension Breakdown Panel', description: 'Break revenue trend by customer, product, geography, or sales channel' },
        { name: 'Seasonality Analyzer', description: 'Identifies recurring seasonal patterns in revenue data' },
        { name: 'Growth Rate Calculator', description: 'Period-over-period and CAGR calculations displayed alongside trend' },
        { name: 'Revenue Forecast Model', description: 'Statistical trend-based forecast for future periods with confidence intervals' },
      ]}
      tabs={['Revenue Trends', 'By Dimension', 'Seasonality', 'Forecast']}
      features={['Multi-dimension revenue trend analysis', 'Configurable time granularity (daily to annual)', 'Growth rate and CAGR calculation', 'Seasonal pattern detection', 'Statistical revenue forecasting', 'Anomaly detection and highlight', 'Export trend data for financial planning']}
      dataDisplayed={['Revenue by period', 'Period-over-period growth rate', 'Compound annual growth rate (CAGR)', 'Revenue by dimension (customer/product/geo)', 'Seasonal index per period', 'Revenue forecast for next 3-12 months', 'Confidence interval on forecast']}
      userActions={['Analyze revenue trend over time', 'Break down by customer or product', 'Identify seasonal patterns', 'Review revenue forecast', 'Compare growth rates across dimensions', 'Export revenue trend data', 'Share trend analysis with leadership']}
      relatedPages={[
        { label: 'Sales Performance', href: '/sales/sales-insights/sales-performance' },
        { label: 'Customer Profitability', href: '/sales/sales-insights/customer-profitability' },
        { label: 'Performance Center', href: '/reporting/performance-center' },
      ]}
    />
  )
}

