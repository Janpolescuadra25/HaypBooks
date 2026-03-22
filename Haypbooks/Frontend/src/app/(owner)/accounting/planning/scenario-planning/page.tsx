'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Scenario Planning"
      module="ACCOUNTING"
      breadcrumb="Accounting / Planning / Scenario Planning"
      purpose="Scenario Planning enables finance teams to build and compare multiple financial scenarios — Base Case, Upside Case, and Downside Case — to stress-test the business model and understand P&L and cash flow sensitivity to key variables. Each scenario is built by defining different revenue growth rates, cost assumptions, headcount plans, and capital expenditure levels. Scenario outputs include projected P&L, balance sheet, and cash flow statements."
      components={[
        { name: 'Scenario Manager', description: 'List of all saved scenarios with name, type (base/upside/downside), last updated, and creator.' },
        { name: 'Scenario Builder', description: 'Define scenario assumptions: revenue growth %, margin targets, cost categories, headcount plan, and CapEx budget.' },
        { name: 'Scenario Comparison View', description: 'Side-by-side P&L, Balance Sheet, and Cash Flow comparison across 2–4 scenarios.' },
        { name: 'Sensitivity Analysis', description: 'Single-variable sensitivity: change one assumption (e.g., revenue ±10%) and see impact on net income and cash.' },
        { name: 'Scenario Output Reports', description: 'Generate full projected financial statements for each scenario for management or board presentation.' },
      ]}
      tabs={['Scenarios', 'Build Scenario', 'Compare Scenarios', 'Sensitivity Analysis', 'Output Reports']}
      features={[
        'Multi-scenario financial modeling (Base/Upside/Downside)',
        'Assumption-driven income statement and cash flow projection',
        'Side-by-side scenario comparison',
        'Single-variable sensitivity analysis',
        'Scenario output report generation (PDF/Excel)',
        'Share scenario link with management team',
        'Save and version scenarios over time',
      ]}
      dataDisplayed={[
        'All scenarios with key headline metrics',
        'Per-scenario projected revenue, EBITDA, net income, and EBITDA margin',
        'Projected year-end cash balance by scenario',
        'Side-by-side comparison across scenarios for all line items',
        'Sensitivity: impact of key variable changes',
      ]}
      userActions={[
        'Create a new financial scenario',
        'Set revenue and cost assumptions per scenario',
        'Compare 2–4 scenarios side by side',
        'Run sensitivity analysis on a key variable',
        'Export scenario comparison report',
        'Share scenario link with executive team',
        'Save scenario snapshot as a named version',
      ]}
      relatedPages={[
        { label: 'Forecasts', href: '/accounting/planning/forecasts' },
        { label: 'Budgets', href: '/accounting/planning/budgets' },
        { label: 'Business Health', href: '/home/business-health' },
        { label: 'Cash Flow Report', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
      ]}
    />
  )
}

