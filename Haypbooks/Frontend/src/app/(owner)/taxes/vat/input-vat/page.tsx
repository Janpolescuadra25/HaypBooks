'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Input VAT"
      module="TAXES"
      breadcrumb="Taxes / VAT / Input VAT"
      purpose="Input VAT tracks all VAT paid on purchases that is creditable against output VAT. Not all input VAT is creditable — only input VAT from transactions directly related to the company's VATable activities. Input VAT from purchases related to VAT-exempt activities cannot be credited. This page shows all creditable input VAT transactions, their source (vendor invoice, import entry), whether they meet the substantiation requirements (valid VAT OR/invoice from a BIR-registered supplier), and their inclusion in VAT returns."
      components={[
        { name: 'Input VAT Register', description: 'All purchase transactions with input VAT: date, vendor, invoice reference, amount, VAT rate, VAT amount, and creditable status.' },
        { name: 'Creditable vs. Non-Creditable', description: 'Classification of input VAT per transaction: creditable (reduces VAT payable) or non-creditable (expensed or capitalized).' },
        { name: 'Deferred Input VAT', description: 'Input VAT on capital goods (amortized over 60 months per BIR rules) — tracking balance and monthly claim.' },
        { name: 'Input VAT Substantiation', description: 'Flag input VAT without valid supporting documentation (BIR OR/invoice).' },
      ]}
      tabs={['Input VAT Register', 'Creditable vs. Non-Creditable', 'Deferred (Capital Goods)', 'Excess Input Carry-Forward']}
      features={[
        'Complete input VAT transaction register',
        'Creditable vs. non-creditable classification',
        'Capital goods deferred input VAT (60-month amortization)',
        'Excess input VAT carry-forward tracking',
        'Substantiation requirement flagging',
        'Input VAT aging by vendor',
      ]}
      dataDisplayed={[
        'All input VAT transactions',
        'Creditable input VAT available for offset',
        'Deferred capital goods VAT with monthly claim schedule',
        'Excess input VAT carried forward',
        'Input VAT not substantiated',
      ]}
      userActions={[
        'View all input VAT transactions',
        'Reclassify a transaction (creditable/non-creditable)',
        'View deferred capital goods VAT schedule',
        'Mark input VAT as included in a return',
        'Export input VAT register',
      ]}
      relatedPages={[
        { label: 'VAT Returns', href: '/taxes/vat/vat-returns' },
        { label: 'Output VAT', href: '/taxes/vat/output-vat' },
        { label: 'Form 2550M', href: '/philippine-tax/bir-forms/form-2550m' },
      ]}
    />
  )
}

