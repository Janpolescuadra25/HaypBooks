'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function InputVatPage() {
  return (
    <PageDocumentation
      title="Input VAT"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Purchase & Input Tax / Input VAT"
      purpose="Input VAT tracks the 12% VAT paid on qualifying purchases of goods and services from VAT-registered suppliers, which can be credited against output VAT due to reduce the net VAT payable. This module accumulates input VAT from purchase invoices, validates supporting documents, and prepares the input VAT schedule needed for the quarterly VAT return. Accurate input VAT tracking is critical for maximizing VAT credits and avoiding disallowances."
      components={[
        { name: 'Input VAT Ledger', description: 'Transaction-level ledger of all purchases with input VAT, supplier name, TIN, OR number, and date.' },
        { name: 'Input VAT Summary', description: 'Period summary of total input VAT claimed vs. carried forward vs. applied against output VAT.' },
        { name: 'Supplier TIN Validator', description: 'Real-time TIN validation to ensure only VAT-registered suppliers generate creditable input VAT.' },
        { name: 'Deferred Input VAT', description: 'Tracks input VAT on capital goods that must be claimed over 60 months rather than all at once.' },
        { name: 'Disallowed Input VAT', description: 'Flags and reports input VAT that cannot be claimed (non-VAT supplier, private use, missing OR).' },
      ]}
      tabs={['Input VAT Ledger', 'Summary', 'Deferred (Capital Goods)', 'Disallowed', 'Carryforward']}
      features={[
        'Accumulate input VAT from all qualifying purchase transactions',
        'Validate supplier TIN and VAT registration status',
        'Track deferred input VAT on capital goods over 60-month amortization',
        'Flag and report disallowed input VAT entries',
        'Compute period-end input VAT balance for VAT return',
        'Carry forward excess input VAT to subsequent quarters',
      ]}
      dataDisplayed={[
        'Supplier name, TIN, and transaction date',
        'Purchase amount, input VAT, and official receipt number',
        'Input VAT claim status (claimable, deferred, disallowed)',
        'Cumulative input VAT balance for the period',
        'Carryforward input VAT from prior quarters',
      ]}
      userActions={[
        'Review and validate input VAT entries',
        'Flag or exclude disallowed input VAT',
        'Configure capital goods deferred VAT schedule',
        'View input VAT balance for VAT return',
        'Export input VAT schedule for quarterly filing',
      ]}
    />
  )
}

