'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Annual ITR"
      module="TAXES"
      breadcrumb="Taxes / Income Tax / Annual ITR"
      purpose="Annual ITR manages the preparation of the yearly corporate income tax return (BIR Form 1702RT for Regular Corporations). This is the final and comprehensive income tax return for the full fiscal year, reconciling book income to taxable income, applying all allowable deductions, crediting all 2307s received during the year and all quarterly ITR payments (1702Q), and arriving at the final income tax payable or overpayment to be refunded or applied in the next year. It is due April 15 (or the 60th day after fiscal year end)."
      components={[
        { name: 'Annual Income Computation', description: 'Full-year gross revenues, cost of sales/services, gross profit, operating expenses, other income/expense, and net income before tax.' },
        { name: 'Book-to-Tax Reconciliation', description: 'Adjustments for non-deductible items (entertainment over limit, penalties, fines) and non-taxable items (tax-exempt income).' },
        { name: 'Tax Credit Summary', description: 'All 2307s received in the year + all quarterly 1702Q payments credited against the annual tax due.' },
        { name: 'Final Tax Computation', description: 'Taxable income × rate = tax due, less credits = final tax payable or overpayment.' },
        { name: 'MCIT Comparison', description: 'Compare RCIT with MCIT (minimum corporate income tax = 2% of gross income applicable in first 3 years and any year where RCIT < MCIT).' },
      ]}
      tabs={['Income Computation', 'Book-to-Tax Reconciliation', 'Tax Credits', 'Final Tax', 'MCIT Comparison', 'Filing History']}
      features={[
        'Comprehensive annual corporate income tax computation',
        'Book-to-tax income reconciliation',
        'Full annual 2307 credit application',
        'Quarterly 1702Q payment credit',
        'MCIT vs. RCIT comparison',
        'EFPS filing format generation',
        'Optional income tax authority to apply overpayment',
      ]}
      dataDisplayed={[
        'Full year income and expense summary',
        'Taxable income after reconciliation adjustments',
        'Total tax credits applied',
        'Final income tax payable or overpayment',
        'MCIT amount for comparison',
      ]}
      userActions={[
        'Build annual income tax computation',
        'Enter reconciliation adjustment items',
        'Apply all 2307 credits',
        'Apply quarterly payment credits',
        'Generate EFPS filing file',
        'Mark as filed',
      ]}
      relatedPages={[
        { label: 'Quarterly ITR', href: '/taxes/income-tax/quarterly-itr' },
        { label: 'Form 1702RT', href: '/philippine-tax/bir-forms/form-1702rt' },
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

