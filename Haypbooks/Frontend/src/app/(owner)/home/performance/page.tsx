'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Performance"
      module="HOME"
      breadcrumb="Home / Performance"
      purpose="The Performance page is a dedicated business performance analytics hub presenting KPI dashboards, period-over-period comparisons, revenue and profitability trends, and benchmark analysis across the company's key financial and operational metrics. It gives owners and executives a data-rich view for strategic decision-making, going deeper than the Business Health overview to show the underlying trends and drivers."
      components={[
        { name: 'KPI Dashboard Grid', description: 'Configurable grid of KPI tiles including Revenue, Gross Profit, EBITDA, Net Profit, Operating Costs, Customer Count, Average Invoice Value, and Collections Rate.' },
        { name: 'Period Comparison Chart', description: 'Line/bar chart comparing selected periods: MoM, QoQ, YoY, custom range — with variance column showing % change.' },
        { name: 'Revenue Waterfall Chart', description: 'Waterfall visualization showing revenue breakdown by product/service with cost deductions to arrive at net profit.' },
        { name: 'Target vs. Actual Gauges', description: 'Gauge charts for each KPI showing progress toward period targets with % attainment.' },
        { name: 'Benchmark Panel', description: 'Industry benchmark comparisons for gross margin, operating ratio, and DSO (ENT feature).' },
      ]}
      tabs={['KPI Overview', 'Revenue Analysis', 'Profitability', 'Operations', 'Benchmarks']}
      features={[
        'Fully configurable KPI selection and layout',
        'Multi-period comparison with variance analysis',
        'Target-setting per KPI with attainment tracking',
        'Revenue waterfall decomposition',
        'Industry benchmark overlays (ENT)',
        'Export performance report as PDF or Excel',
        'Scheduled email delivery of performance report',
      ]}
      dataDisplayed={[
        'Revenue (actual vs. target, vs. prior period)',
        'Gross profit and gross margin %',
        'EBITDA and EBITDA margin',
        'Net profit and net margin',
        'Operating expense ratio',
        'Customer count and average transaction value',
        'Collections rate and DSO',
        'Period-over-period variance amounts and percentages',
      ]}
      userActions={[
        'Select and configure displayed KPIs',
        'Change comparison period (MoM / QoQ / YoY / Custom)',
        'Set performance targets per KPI',
        'Drill into a KPI for underlying transaction detail',
        'Export performance dashboard as PDF',
        'Schedule automated performance report delivery',
      ]}
      relatedPages={[
        { label: 'Business Health', href: '/home/business-health' },
        { label: 'Dashboard', href: '/home/dashboard' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
        { label: 'AI Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
      ]}
    />
  )
}

