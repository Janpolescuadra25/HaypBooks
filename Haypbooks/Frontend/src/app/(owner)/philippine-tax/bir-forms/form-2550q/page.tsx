'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 2550Q"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 2550Q"
      badge="PH ONLY"
      purpose="BIR Form 2550Q (Quarterly Value-Added Tax Return) is filed at the end of each fiscal quarter (Q3 of each quarter) and covers the cumulative VAT position for the full quarter, incorporating amounts from the two monthly 2550M filings. The 2550Q reconciles total output and input VAT for the full quarter, applies prior payments from 2550M filings as credits, and computes the net VAT still due (or excess input VAT to carry forward). Haypbooks builds the 2550Q automatically from the three months of quarterly data plus prior 2550M payments."
      components={[
        { name: '2550Q Computation', description: 'Quarterly cumulative: total output VAT all 3 months, total input VAT, prior 2550M payments, and net amount due.' },
        { name: 'Monthly Breakdown', description: 'Month 1, Month 2, Month 3 breakdown contributing to the quarter totals.' },
        { name: 'Excess Input VAT Carry-Forward', description: 'If input > output: compute excess input VAT for carry-forward to the next quarter.' },
        { name: 'Form Preview', description: 'Full BIR-format preview of 2550Q.' },
        { name: 'EFPS File Generator', description: 'EFPS XML/text file for electronic filing.' },
      ]}
      tabs={['Compute Quarter', 'Monthly Breakdown', 'Carry-Forward Credits', 'Form Preview', 'EFPS File', 'Filing History']}
      features={[
        'Full quarterly VAT return computation',
        'Integration with monthly 2550M payments as credits',
        'Excess input VAT carry-forward calculation',
        'Quarterly EFPS filing format',
        'Quarterly VAT reconciliation',
        'Amended return support',
      ]}
      dataDisplayed={[
        'Quarterly output and input VAT totals',
        'Credits from monthly 2550M payments',
        'Net VAT due for the quarter',
        'Excess input VAT carry-forward',
        'Filing history',
      ]}
      userActions={[
        'Compute quarterly 2550Q',
        'Review monthly breakdown',
        'Apply 2550M payment credits',
        'Generate EFPS file',
        'Mark as filed',
      ]}
      relatedPages={[
        { label: 'Form 2550M', href: '/philippine-tax/bir-forms/form-2550m' },
        { label: 'VAT Returns', href: '/taxes/vat/vat-returns' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

