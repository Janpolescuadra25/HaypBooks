'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Forecasts"
      module="ACCOUNTING"
      breadcrumb="Accounting / Planning / Forecasts"
      purpose="Forecasts provides rolling financial forecasting — projecting the company's expected financial performance for the remainder of the fiscal year based on year-to-date actuals plus forward-looking assumptions. Unlike the static annual budget, forecasts are updated monthly or quarterly as new information emerges. The Rolling Forecast model (typically 12 or 18 months forward) gives management an always-current view of where the business is headed."
      components={[
        { name: 'Forecast Input Grid', description: 'For each remaining month of the year, enter forecast revenue and expense amounts. Completed months auto-fill with actuals.' },
        { name: 'Forecast vs. Budget', description: 'Side-by-side comparison: original budget, updated forecast, and latest actuals. Shows how the full-year forecast compares to original plan.' },
        { name: 'Assumption Manager', description: 'Document the key assumptions driving the forecast (revenue growth rate, headcount plan, major cost changes).' },
        { name: 'Rolling Forecast Setup', description: 'Configure the rolling forecast horizon (12 or 18 months) that extends beyond fiscal year end.' },
        { name: 'Forecast Versions', description: 'Maintain multiple forecast snapshots (Q1 Forecast, Q2 Forecast, Q3 Forecast) for comparison over time.' },
      ]}
      tabs={['Forecast Input', 'Forecast vs. Budget', 'Assumptions', 'Forecast Versions', 'Rolling View']}
      features={[
        'Rolling or period-specific forecast models',
        'Forecast vs. budget vs. actuals three-way view',
        'Key assumption documentation',
        'Multi-version forecast management',
        'Auto-populate with YTD actuals for completed periods',
        'Projected year-end P&L from current forecast',
        'Cash flow forecast derived from P&L forecast',
      ]}
      dataDisplayed={[
        'Monthly forecast amounts for remaining periods',
        'Forecast vs. original budget (annual and monthly)',
        'Year-end projected outcome based on forecast',
        'Key assumptions driving the forecast',
        'Forecast accuracy vs. prior forecast version',
        'YTD actuals for completed periods',
      ]}
      userActions={[
        'Enter forecast amounts for future periods',
        'Update forecast for the current month',
        'Document forecast assumptions',
        'Compare current forecast to prior version',
        'Save a forecast version snapshot',
        'Export full-year forecast to Excel',
      ]}
      relatedPages={[
        { label: 'Budgets', href: '/accounting/planning/budgets' },
        { label: 'Budget vs. Actual', href: '/accounting/planning/budget-vs-actual' },
        { label: 'Scenario Planning', href: '/accounting/planning/scenario-planning' },
        { label: 'Cash Flow Report', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
      ]}
    />
  )
}

