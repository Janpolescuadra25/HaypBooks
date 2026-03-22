'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxSummaryPage() {
  return (
    <PageDocumentation
      title="Tax Summary"
      module="TAXES"
      breadcrumb="Taxes / Tax Reporting / Tax Summary"
      purpose="Tax Summary provides an at-a-glance high-level overview of the business's total tax position across all tax categories for management reporting. Unlike detailed transaction-level reports, the Tax Summary consolidates key metrics — total tax expense, effective rate, payments made, and amounts outstanding — into a compact executive-facing format. This report is typically shared with the CFO, board, or external advisors during periodic business reviews."
      components={[
        { name: 'Executive Summary Cards', description: 'KPI cards showing total tax expense, tax paid YTD, tax outstanding, and effective rate.' },
        { name: 'Tax by Category Pie Chart', description: 'Donut chart distributing total tax expense between income tax, VAT, payroll tax, and other categories.' },
        { name: 'Monthly Tax Expense Bar Chart', description: 'Month-by-month bar chart of total tax expense for the current fiscal year.' },
        { name: 'Compliance Status Indicators', description: 'Green/amber/red status per tax type showing whether filings and payments are current.' },
        { name: 'Period Selector', description: 'Quarter or year selector to scope the summary to any fiscal reporting period.' },
      ]}
      tabs={['Overview', 'Monthly Trend', 'By Category', 'Compliance Status']}
      features={[
        'Executive KPI summary of total tax position',
        'Visual breakdown of tax expense by category',
        'Month-by-month tax expense trend chart',
        'Compliance status per tax type at a glance',
        'Year-over-year comparison toggle',
        'Export summary as PDF for management packets',
      ]}
      dataDisplayed={[
        'Total tax expense for period',
        'Tax paid vs. outstanding amounts',
        'Effective tax rate',
        'Tax split by category (income, VAT, payroll, other)',
        'Compliance status per tax type',
      ]}
      userActions={[
        'Select reporting period (quarter or year)',
        'Toggle year-over-year comparison',
        'Drill into any category for detail',
        'Export summary as PDF',
        'View compliance status details',
      ]}
    />
  )
}

