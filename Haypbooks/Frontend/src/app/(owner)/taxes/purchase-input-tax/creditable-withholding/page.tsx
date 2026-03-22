'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CreditableWithholdingPage() {
  return (
    <PageDocumentation
      title="Creditable Withholding"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Purchase & Input Tax / Creditable Withholding"
      purpose="Creditable Withholding manages the taxes withheld by customers on payments to the business, which serve as advance income tax payments that can be credited against the company's annual income tax liability. This module tracks all creditable withholding tax (CWT) certificates received from customers, validates the amounts, and accumulates the credit balance for use in the annual ITR computation. Proper CWT management reduces year-end tax due amounts."
      components={[
        { name: 'CWT Certificate Register', description: 'Table of all 2307 certificates received from customers with payor, period, income, and tax withheld.' },
        { name: 'Monthly CWT Summary', description: 'Aggregated view of CWT received per month showing total income payments and total tax certificates.' },
        { name: 'Credit Utilization Tracker', description: 'Running tally of total CWT balance available for credit against income tax due.' },
        { name: 'Certificate Validation Flags', description: 'Flags for certificates with missing TIN, incorrect rates, or amount mismatches against recorded income.' },
        { name: 'Annual Credit Computation', description: 'Year-end summary computing total CWT credits to be applied against the annual income tax return.' },
      ]}
      tabs={['Certificate Register', 'Monthly Summary', 'Credit Balance', 'Validation Issues', 'Annual Computation']}
      features={[
        'Register all BIR Form 2307 certificates received from customers',
        'Validate certificate details against recorded income transactions',
        'Track cumulative creditable withholding tax balance',
        'Flag certificates with data quality issues for correction',
        'Compute total CWT credit available for annual ITR',
        'Export CWT summary for income tax return preparation',
      ]}
      dataDisplayed={[
        'Payor name and TIN',
        'Income payment amount and applicable period',
        'Tax withheld (CWT) per certificate',
        'BIR Form 2307 reference number',
        'Cumulative CWT credit balance',
      ]}
      userActions={[
        'Record a new 2307 certificate received',
        'Validate certificate against transaction records',
        'Review and resolve validation flags',
        'View total available CWT credit balance',
        'Export CWT register for ITR preparation',
      ]}
    />
  )
}

