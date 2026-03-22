'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Expanded Withholding Tax"
      module="TAXES"
      breadcrumb="Taxes / Withholding Tax / EWT"
      purpose="Expanded Withholding Tax (EWT, also called Creditable Withholding Tax) is the withholding tax deducted by the payor from certain income payments to vendors and payees: professional fees (15%/10%), rental (5%), goods (1%), services (2%), and other ATC-classified payment types. As the withholding agent, the company must deduct the correct EWT on bill payment, issue BIR Form 2307 to the payee, file BIR Form 1601EQ quarterly, and remit the withheld tax. This page manages EWT across all vendor transactions."
      components={[
        { name: 'EWT Transaction Register', description: 'All transactions where EWT was withheld: date, vendor, invoice, payment, ATC code, income payment amount, rate, and tax withheld.' },
        { name: 'Vendor EWT Summary', description: 'Per vendor: total income payments made and total EWT withheld year-to-date.' },
        { name: 'ATC Summary', description: 'Total withholding per ATC code — feeds into 1601EQ.' },
        { name: 'Unremitted EWT Balance', description: 'EWT withheld but not yet remitted to BIR (outstanding payable to BIR).' },
      ]}
      tabs={['EWT Register', 'By Vendor', 'By ATC Code', 'Remittance Status']}
      features={[
        'Complete EWT transaction tracking',
        'ATC code classification for 1601EQ',
        'Vendor-level EWT summary for 2307 generation',
        'Unremitted EWT payable tracking',
        'Integration with Form 1601EQ and 2307',
        'Annual EWT summary for Alphalist',
      ]}
      dataDisplayed={[
        'All EWT transactions with ATC code',
        'EWT withheld per vendor year-to-date',
        'EWT by ATC code (for 1601EQ)',
        'Remitted vs. unremitted EWT balance',
      ]}
      userActions={[
        'View EWT transactions by vendor',
        'View EWT by ATC code',
        'Generate 2307 for a vendor',
        'Navigate to 1601EQ generation',
        'Mark EWT as remitted',
        'Export EWT register',
      ]}
      relatedPages={[
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'Form 1601EQ', href: '/philippine-tax/bir-forms/form-1601eq' },
        { label: 'Tax Mapping', href: '/philippine-tax/compliance/tax-mapping' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
      ]}
    />
  )
}

