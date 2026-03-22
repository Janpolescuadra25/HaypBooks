'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Quarterly ITR"
      module="TAXES"
      breadcrumb="Taxes / Income Tax / Quarterly ITR"
      purpose="Quarterly ITR manages the preparation and filing of BIR Form 1702Q (Quarterly Income Tax Return for Corporations). Corporations must file quarterly ITR for the first 3 quarters (Q1, Q2, Q3) — covering cumulative income and deductions from the start of the fiscal year to each quarter's end — and then file the annual 1702RT as the final return. The quarterly ITR requires a Q3-of-quarter corporate income tax payment. Haypbooks computes the quarterly ITR from the financial books and generates the EFPS filing."
      components={[
        { name: 'Quarterly ITR Computation', description: 'YTD income, deductions, net taxable income, income tax at applicable rate, less credits (2307s received + prior quarterly payments).' },
        { name: 'Tax Credit Schedule', description: 'Summary of 2307s received in the quarter to credit against the quarterly income tax.' },
        { name: 'Form 1702Q Preview', description: '1702Q form in BIR layout preview.' },
        { name: 'EFPS File', description: 'EFPS-ready filing format generation.' },
        { name: 'Quarterly ITR History', description: 'All filed 1702Qs with period, amount, and confirmation.' },
      ]}
      tabs={['Compute Quarter', 'Tax Credits', 'Form Preview', 'EFPS File', 'Filing History']}
      features={[
        'Quarterly corporate income tax computation',
        'Cumulative YTD income and deduction summary',
        '2307 tax credit application',
        'Prior quarterly payment credit',
        'EFPS format generation',
        'Link to annual 1702RT for final reconciliation',
      ]}
      dataDisplayed={[
        'YTD gross revenue and deductions',
        'Net taxable income',
        'Income tax due at applicable rate',
        'Tax credits applied',
        'Net amount due for the quarter',
        'Prior quarters\' filings',
      ]}
      userActions={[
        'Compute quarterly ITR for a quarter',
        'Apply 2307 credits',
        'Generate EFPS file',
        'Mark as filed with confirmation',
        'View all quarterly ITR filings',
      ]}
      relatedPages={[
        { label: 'Annual ITR', href: '/taxes/income-tax/annual-itr' },
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

