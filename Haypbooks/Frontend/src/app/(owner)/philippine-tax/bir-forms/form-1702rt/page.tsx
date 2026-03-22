'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 1702RT"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 1702RT"
      badge="PH ONLY"
      purpose="BIR Form 1702RT (Annual Income Tax Return for Corporations/Partnerships — Regular) is the annual corporate income tax return for regular corporations subject to the regular corporate income tax (RCIT) rate (currently 25% for large corporations, 20% for small corporations with net taxable income not exceeding PHP 5 million). It summarizes the year's gross income, allowable deductions, net taxable income, income tax due, tax credits (including 2307s received), and prior quarterly payments. It is due on April 15 of the following year (or 60th day after fiscal year end)."
      components={[
        { name: 'Income Statement Summary', description: 'Pull from financial books: gross revenues, cost of sales, gross profit, operating expenses, and net income before tax.' },
        { name: 'Tax Reconciliation Schedule', description: 'Book income to taxable income reconciliation: add back non-deductible items, deduct non-taxable items.' },
        { name: 'Tax Credit Schedule', description: '2307s received from clients credited against annual income tax due. Quarterly tax payments (1702Q) credited.' },
        { name: 'Tax Computation Summary', description: 'Final tax due: taxable income × rate - credits + surcharges if applicable.' },
        { name: 'EFPS File Generator', description: 'EFPS-compatible filing format.' },
      ]}
      tabs={['Income Computation', 'Reconciliation', 'Tax Credits', 'Tax Due', 'EFPS File', 'Filing History']}
      features={[
        'Annual corporate income tax return computation',
        'Book-to-tax income reconciliation',
        '2307 tax credit application',
        'Quarterly income tax payment credit',
        'EFPS electronic filing format',
        'MCIT (minimum corporate income tax) comparison',
      ]}
      dataDisplayed={[
        'Gross revenues and allowable deductions',
        'Net taxable income',
        'Income tax due at applicable rate',
        'Total tax credits (2307s + quarterly payments)',
        'Final amount payable or overpayment',
      ]}
      userActions={[
        'Pull income summary from financial data',
        'Enter tax adjustment items',
        'Apply 2307 credits',
        'Apply quarterly payment credits',
        'Compute annual income tax',
        'Generate EFPS file',
        'Mark as filed',
      ]}
      relatedPages={[
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

