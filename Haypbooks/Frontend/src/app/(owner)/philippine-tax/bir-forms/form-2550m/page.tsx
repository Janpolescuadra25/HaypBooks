'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 2550M"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 2550M"
      badge="PH ONLY"
      purpose="BIR Form 2550M (Monthly Value-Added Tax Declaration) is filed monthly by VAT-registered businesses for the first two months of each quarter to remit monthly VAT. It reports total sales (output VAT), total purchases (input VAT), and the net VAT payable or excess input VAT for the month. Haypbooks auto-computes 2550M from the VAT GL transaction data. This form is due on the 20th of the following month for non-eFPS filers, and 25th for eFPS filers (Group E)."
      components={[
        { name: '2550M Computation', description: 'Monthly computation: total output VAT from sales invoices, total input VAT from purchases, and net VAT due.' },
        { name: 'VAT Schedule', description: 'Supporting schedule of VATable, VAT-exempt, and zero-rated transactions for the month.' },
        { name: 'Form Preview', description: 'Preview the 2550M form in BIR layout.' },
        { name: 'EFPS File Generator', description: 'Generate EFPS-compatible file for electronic submission.' },
        { name: 'Filing History', description: 'Archive of all monthly 2550M filings.' },
      ]}
      tabs={['Compute Month', 'VAT Schedule', 'Form Preview', 'EFPS File', 'Filing History']}
      features={[
        'Monthly VAT computation from GL data',
        'Output and input VAT breakdown',
        'Zero-rated and exempt transaction tracking',
        'EFPS electronic filing format',
        'Monthly filing calendar integration',
        'Link to quarterly 2550Q',
      ]}
      dataDisplayed={[
        'Output VAT from sales for the month',
        'Input VAT from purchases for the month',
        'Net VAT payable or excess input',
        'VAT-able transactions schedule',
        'Filing history',
      ]}
      userActions={[
        'Compute monthly VAT',
        'Review output and input VAT detail',
        'Generate EFPS file',
        'Mark filing as submitted',
        'View filing history',
      ]}
      relatedPages={[
        { label: 'Form 2550Q', href: '/philippine-tax/bir-forms/form-2550q' },
        { label: 'VAT Returns', href: '/taxes/vat/vat-returns' },
        { label: 'EFPS Setup', href: '/philippine-tax/compliance/efps-setup' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

