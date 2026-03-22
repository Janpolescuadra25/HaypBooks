'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function WithholdingReportPage() {
  return (
    <PageDocumentation
      title="Withholding Tax Report"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Tax Reporting / Withholding Tax Report"
      purpose="Withholding Tax Report aggregates all taxes withheld from payments to employees (compensation withholding) and suppliers (expanded withholding) for the reporting period, providing the data needed for monthly alphalist filings and year-end summary reporting to the BIR. The report distinguishes compensation withholding (1601-C) from expanded withholding (1601-EQ), and supports the preparation of payee annual information returns."
      components={[
        { name: 'Withholding Summary by Type', description: 'Table grouping total withholding by type: compensation, expanded, final, and fringe benefits.' },
        { name: 'Payee Detail Register', description: 'Alphabetical list of all payees with income paid and tax withheld per period.' },
        { name: 'Monthly Remittance Tracker', description: "Shows whether each month's withholding has been remitted via the corresponding BIR form." },
        { name: 'Annual Alphalist Preparation', description: 'Aggregates the full-year payee data in the format required for the BIR alphalist submission.' },
        { name: 'Export Options', description: 'Export payee register and summary in BIR compatible format for electronic annual filing.' },
      ]}
      tabs={['Summary by Type', 'Payee Register', 'Monthly Tracker', 'Annual Alphalist']}
      features={[
        'Aggregate all withholding tax by type and period',
        'Generate payee-level withholding register for remittance forms',
        'Track whether monthly remittances have been made',
        'Prepare annual alphalist of payees for BIR submission',
        'Export in BIR-compatible electronic file format',
        'Reconcile withheld amounts against Form 2307 certificates issued',
      ]}
      dataDisplayed={[
        'Withholding tax type and monthly total',
        'Payee name, TIN, and income paid',
        'Tax withheld per payee per period',
        'Monthly remittance status',
        'Annual alphalist totals',
      ]}
      userActions={[
        'Select reporting period',
        'View payee withholding detail',
        'Check and update monthly remittance status',
        'Generate annual alphalist',
        'Export BIR-format withholding report',
      ]}
    />
  )
}

