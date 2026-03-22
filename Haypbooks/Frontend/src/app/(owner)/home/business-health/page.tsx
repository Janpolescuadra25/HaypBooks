'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Business Health"
      module="HOME"
      breadcrumb="Home / Business Health"
      purpose="The Business Health page provides a comprehensive multi-KPI health score dashboard that synthesizes data from all modules into a single at-a-glance view of your company's financial and operational wellbeing. It surfaces a composite Financial Health Score, tracks cash flow health, profitability trends, compliance status, and highlights areas requiring attention — giving owners and executives an instant read on the overall state of the business."
      components={[
        { name: 'Health Score Card', description: 'Composite score (0–100) calculated from cash flow, profitability, AR/AP ratios, compliance standing, and growth trajectory. Color-coded: green (healthy), yellow (caution), red (critical).' },
        { name: 'KPI Tiles Row', description: 'Six metric tiles: Cash Runway (months), Current Ratio, Gross Margin %, DSO (Days Sales Outstanding), DPO (Days Payable Outstanding), and Net Profit Margin.' },
        { name: 'Trend Charts', description: 'Spark-line trend charts for revenue, expenses, and net profit over the trailing 12 months.' },
        { name: 'Alerts & Recommendations', description: 'AI-generated action items ranked by priority: overdue invoices, low cash runway, upcoming tax deadlines, unreconciled accounts.' },
        { name: 'Module Health Breakdown', description: 'Per-module health indicators (Sales, Expenses, Banking, Payroll, Taxes) with drill-through links.' },
      ]}
      tabs={['Overview', 'Cash Health', 'Profitability', 'Compliance', 'Trend History']}
      features={[
        'Composite health score updated daily from all modules',
        'Configurable KPI thresholds and alert rules',
        'Historical health score trending with period comparison',
        'One-click drill-down to issue source',
        'Export health report as PDF for stakeholder sharing',
        'Benchmark against industry averages (ENT)',
      ]}
      dataDisplayed={[
        'Financial Health Score (0–100)',
        'Cash runway in months at current burn rate',
        'Current ratio and quick ratio',
        'Gross margin % and net profit margin %',
        'Days Sales Outstanding (DSO)',
        'Days Payable Outstanding (DPO)',
        'Revenue and expense trend for trailing 12 months',
        'Upcoming compliance deadlines (next 30 days)',
        'Number of unresolved alerts by severity',
      ]}
      userActions={[
        'Drill into any KPI tile for detailed breakdown',
        'Customize which KPIs appear on the dashboard',
        'Set threshold values that trigger caution/critical alerts',
        'Export the health report as PDF or share link',
        'Snooze or dismiss specific alerts',
        'Navigate to source module directly from alert card',
      ]}
      relatedPages={[
        { label: 'Dashboard', href: '/home/dashboard' },
        { label: 'Performance', href: '/home/performance' },
        { label: 'Cash Position', href: '/home/cash-position' },
        { label: 'AI Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
      ]}
    />
  )
}

