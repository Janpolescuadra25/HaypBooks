'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 1601EQ"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 1601EQ"
      badge="PH ONLY"
      purpose="BIR Form 1601EQ (Quarterly Remittance Return of Creditable Income Taxes Withheld – Expanded) is filed quarterly to remit all Expanded Withholding Tax (EWT/Creditable Withholding Tax) withheld from vendor payments during the quarter. The form summarizes total withheld by ATC (Alphanumeric Tax Code) and income type. Haypbooks auto-computes the 1601EQ from all EWT transactions (AP bills, payments, creditable withholding) and generates the EFPS submission file."
      components={[
        { name: '1601EQ Computation', description: 'Quarter totals of EWT withheld grouped by ATC code: total payments subject to EWT and total tax withheld per ATC.' },
        { name: 'ATC Breakdown', description: 'Line-by-line ATC schedule: WC000, WC010, WC020, WC158, WC160, etc. — mapped from transactions.' },
        { name: 'Form Preview', description: 'Preview completed 1601EQ form in BIR format.' },
        { name: 'EFPS File Generator', description: 'Generate BIR EFPS XML or text file for electronic filing.' },
        { name: 'Filing History', description: 'Archive of all quarters filed with confirmation and payment references.' },
      ]}
      tabs={['Compute Quarter', 'ATC Breakdown', 'Form Preview', 'EFPS File', 'Filing History']}
      features={[
        'Auto-computation from EWT transactions',
        'ATC-level breakdown of withheld amounts',
        'EFPS electronic filing export',
        'Link to BIR 2307 certificates',
        'Quarterly filing deadline reminder',
        'Amended return support',
      ]}
      dataDisplayed={[
        'Total EWT withheld per ATC code',
        'Total payments subject to EWT',
        'Prior payments and credits in the quarter',
        'Amount due for remittance',
        'Filing history',
      ]}
      userActions={[
        'Compute 1601EQ for the quarter',
        'Review ATC breakdown',
        'Generate EFPS file',
        'Mark as filed',
        'Generate 2307s for the quarter from this screen',
        'View filing history',
      ]}
      relatedPages={[
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'Tax Mapping', href: '/philippine-tax/compliance/tax-mapping' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

