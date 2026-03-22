'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function OutputTaxLedgerPage() {
  return (
    <PageDocumentation
      title="Output Tax Ledger"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Sales & Output Tax / Output Tax Ledger"
      purpose="Output Tax Ledger is the master record of all VAT and other output taxes charged on sales transactions, providing a comprehensive audit trail for tax authority review. Every sales invoice generates output tax entries automatically based on the applicable tax rate and customer exemption status. The ledger supports period-end VAT return preparation by providing pre-aggregated totals by rate and transaction category."
      components={[
        { name: 'Output Tax Transactions Table', description: 'Detailed ledger of all sales transactions with invoice number, customer, gross amount, VAT rate, and output VAT.' },
        { name: 'Period Aggregation Summary', description: 'Collapsible summary rows grouping output tax by rate bucket (12%, 0%, exempt) for the selected period.' },
        { name: 'Customer Exemption Filter', description: 'Filter to isolate zero-rated or VAT-exempt transactions separately from standard-rated sales.' },
        { name: 'Invoice Drill-Through', description: 'Click invoice number to navigate to the originating sales invoice record.' },
        { name: 'Return Data Export', description: 'Export output VAT data in the format required for BIR VAT return schedule preparation.' },
      ]}
      tabs={['All Output Tax', 'Standard Rate 12%', 'Zero-Rated', 'Exempt', 'Period Summary']}
      features={[
        'View all output VAT entries generated from sales transactions',
        'Separate standard-rated, zero-rated, and VAT-exempt sales',
        'Aggregate output tax by rate for VAT return filing',
        'Drill through to originating invoice from ledger entry',
        'Export output VAT schedule in BIR-compatible format',
        'Reconcile output tax ledger against VAT return filed amounts',
      ]}
      dataDisplayed={[
        'Customer name and invoice date',
        'Gross sales amount and output VAT computed',
        'VAT rate applied and transaction category',
        'Invoice number and official receipt reference',
        'Period aggregate totals by rate',
      ]}
      userActions={[
        'Filter ledger by period or VAT rate category',
        'Drill through to originating invoice',
        'Export output VAT schedule',
        'Review period aggregation for VAT return',
        'Search for specific customer or invoice',
      ]}
    />
  )
}

