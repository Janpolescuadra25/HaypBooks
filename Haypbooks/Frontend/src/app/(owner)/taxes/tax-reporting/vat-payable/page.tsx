'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function VatPayablePage() {
  return (
    <PageDocumentation
      title="VAT Payable Report"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Tax Reporting / VAT Payable"
      purpose="VAT Payable Report computes and displays the net VAT due to the tax authority for each reporting period, derived from output VAT collected on sales minus input VAT credits on qualifying purchases. The report mirrors the computation flow of the BIR Form 2550Q quarterly VAT return, making it the primary working paper for VAT return preparation. It includes rolling carryforward of excess input VAT credits from prior periods."
      components={[
        { name: 'Output VAT Summary', description: 'Total output VAT from all standard-rated, zero-rated, and exempt sales for the period.' },
        { name: 'Input VAT Credits Table', description: 'Deductible input VAT from qualifying purchases, importations, and capital goods amortization.' },
        { name: 'Net VAT Computation', description: 'Computed net VAT payable or excess input VAT credit (refundable or carryforward).' },
        { name: 'Prior Period Carryforward', description: 'Display of unused input VAT credit brought forward from prior quarters.' },
        { name: 'Return Preparation Export', description: 'Export the computation as a working paper or in BIR 2550Q schedule format.' },
      ]}
      tabs={['VAT Computation', 'Output VAT Detail', 'Input VAT Detail', 'Carryforward History']}
      features={[
        'Compute net VAT payable from output minus input VAT',
        'Show output VAT split by transaction category',
        'List deductible input VAT with amortization for capital goods',
        'Incorporate prior period input VAT carryforward',
        'Flag excess input VAT as refundable or carryforward',
        'Export computation as BIR Form 2550Q working paper',
      ]}
      dataDisplayed={[
        'Total output VAT by rate category',
        'Total input VAT claimed',
        'Net VAT payable or excess credit',
        'Prior period carryforward amount',
        'Tax period covered',
      ]}
      userActions={[
        'Select tax quarter for computation',
        'Review and adjust output and input VAT totals',
        'Confirm carryforward amount from prior period',
        'Export VAT payable report',
        'Link to quarterly return preparation',
      ]}
    />
  )
}

