'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AnnualTaxSummaryPage() {
  return (
    <PageDocumentation
      title="Annual Tax Summary"
      module="TAXES"
      breadcrumb="Taxes / Year-End / Annual Tax Summary"
      purpose="Annual Tax Summary consolidates the full year's tax activity — income tax expense, VAT paid and collected, withholding taxes remitted, and any tax refunds received — into a single comprehensive year-end report. This summary is used as input for the tax note in annual financial statements and for executive briefings on the company's total tax contribution. It bridges the gap between detailed tax records and high-level management reporting."
      components={[
        { name: 'Full-Year Tax Expense Table', description: 'Breakdown of annual tax expense by type with monthly subtotals and full-year total.' },
        { name: 'Effective Tax Rate Analysis', description: 'Comparison of accounting profit vs. taxable income showing effective rate derivation.' },
        { name: 'Tax Paid vs. Tax Due Reconciliation', description: 'Reconciliation comparing tax payments made during the year vs. computed tax obligations.' },
        { name: 'Refunds Received', description: 'Summary of any tax refunds or credits received during the year from tax authorities.' },
        { name: 'Export for Audit', description: 'Export the full annual summary in a structured format for external audit use.' },
      ]}
      tabs={['Full Year Summary', 'ETR Analysis', 'Paid vs. Due', 'Refunds', 'Audit Package']}
      features={[
        'Consolidated annual tax expense by type and month',
        'Effective tax rate analysis vs. statutory rate',
        'Reconcile taxes paid to taxes owed during the year',
        'Summarize refunds and credits received',
        'Export audit-ready annual tax package',
        'Year-over-year comparison vs. prior fiscal year',
      ]}
      dataDisplayed={[
        'Annual tax expense total by type',
        'Monthly tax expense breakdown',
        'Effective tax rate and statutory rate comparison',
        'Total taxes paid and outstanding at year-end',
        'Refunds and credits received during year',
      ]}
      userActions={[
        'Generate full-year tax summary',
        'Toggle year-over-year comparison',
        'View ETR analysis detail',
        'Review paid vs. due reconciliation',
        'Export annual tax audit package',
      ]}
    />
  )
}

