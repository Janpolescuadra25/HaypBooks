'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxLiabilityReportPage() {
  return (
    <PageDocumentation
      title="Tax Liability Report"
      module="TAXES"
      breadcrumb="Taxes / Tax Reporting / Tax Liability Report"
      purpose="Tax Liability Report summarizes the total tax obligations accrued and payable across all tax types for a selected period, providing the data needed for balance sheet disclosure and tax cash flow forecasting. The report shows opening balance, new charges, payments made, and closing liability balance per tax type in a reconciling format. It is commonly used as input for the tax section of annual financial statement notes."
      components={[
        { name: 'Liability Reconciliation Table', description: 'Roll-forward table: opening balance + charges - payments = closing balance per tax type.' },
        { name: 'Tax Type Filter', description: 'Multi-select filter to include or exclude specific tax categories in the report view.' },
        { name: 'Period Comparative', description: 'Side-by-side columns for current period and prior period/year for trend comparison.' },
        { name: 'Payment Details Link', description: 'Each payment row links to the underlying payment transaction in the tax payments module.' },
        { name: 'Export Options', description: 'PDF or Excel export formatted for financial statement note disclosure.' },
      ]}
      tabs={['Summary', 'By Tax Type', 'Period Comparison', 'Payment Detail']}
      features={[
        'Roll-forward liability schedule per tax type for the period',
        'Show opening balance, new charges, payments, and closing balance',
        'Compare current period to prior period or prior year',
        'Link payments to source payment records',
        'Export in financial statement note format',
        'Reconcile closing balance to the GL tax liability accounts',
      ]}
      dataDisplayed={[
        'Tax type and liability account',
        'Opening liability balance',
        'New charges accrued during period',
        'Payments made during period',
        'Closing liability balance',
      ]}
      userActions={[
        'Select reporting period',
        'Filter by tax type',
        'Toggle prior period comparison',
        'Drill through to payment records',
        'Export report to PDF or Excel',
      ]}
    />
  )
}

