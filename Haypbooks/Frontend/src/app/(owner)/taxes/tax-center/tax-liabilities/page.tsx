'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxLiabilitiesPage() {
  return (
    <PageDocumentation
      title="Tax Liabilities"
      module="TAXES"
      breadcrumb="Taxes / Tax Center / Tax Liabilities"
      purpose="Tax Liabilities tracks all amounts owed to tax authorities across every tax type — VAT, withholding, income tax, and local business taxes — giving the business a clear view of its total current tax obligations. Each liability is aged by due date to prioritize payment, and accruals for taxes not yet due are tracked separately. This page feeds directly into the balance sheet's current liabilities section for financial reporting."
      components={[
        { name: 'Liability Summary by Tax Type', description: 'Table grouping total liabilities by VAT, CWT, income tax, and other categories with subtotals.' },
        { name: 'Aging Analysis', description: 'Age buckets showing liabilities current, due within 30 days, 31-60 days, and overdue >60 days.' },
        { name: 'Accrual vs. Payable Split', description: 'Separation showing accrued taxes not yet due vs. taxes assessed and currently payable.' },
        { name: 'Payment Link', description: 'Action button per liability to navigate directly to the Tax Payments log to record settlement.' },
        { name: 'GL Account Reconciliation', description: 'Side-by-side comparison of tax liability per this module vs. corresponding GL account balance.' },
      ]}
      tabs={['All Liabilities', 'By Tax Type', 'Aging Analysis', 'Accruals']}
      features={[
        'View total tax liabilities consolidated across all tax types',
        'Age liabilities by due date for payment prioritization',
        'Distinguish accrued taxes from currently payable taxes',
        'Link each liability to the corresponding payment entry',
        'Reconcile displayed liabilities against GL account balances',
        'Export liability schedule for cash flow planning',
      ]}
      dataDisplayed={[
        'Tax type and authority',
        'Liability amount and due date',
        'Age category (current, due soon, overdue)',
        'Accrual vs. payable classification',
        'GL account balance vs. module balance',
      ]}
      userActions={[
        'View all current tax liabilities',
        'Filter by tax type or age bucket',
        'Navigate to payment entry from liability row',
        'Reconcile against GL account',
        'Export liabilities schedule',
      ]}
    />
  )
}

