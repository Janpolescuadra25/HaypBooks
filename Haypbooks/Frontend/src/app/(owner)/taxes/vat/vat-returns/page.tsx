'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="VAT Returns"
      module="TAXES"
      breadcrumb="Taxes / VAT / VAT Returns"
      purpose="VAT Returns is the central hub for managing all Value-Added Tax filings — monthly (2550M) and quarterly (2550Q) VAT declarations. It shows the current VAT position (output VAT from sales minus input VAT from purchases), links to the BIR form generators, and tracks filing status for all periods. The VAT return module draws data from the sales invoices, purchase bills, and all VATable transactions in the accounting system. It provides the reconciliation between the VAT in the GL and the filed VAT returns."
      components={[
        { name: 'VAT Summary Dashboard', description: 'Current period and YTD output VAT, input VAT, and net VAT payable or excess input carry-forward.' },
        { name: 'Filing Period List', description: 'All VAT filing periods with status: pending, filed, overdue. Links to form 2550M and 2550Q.' },
        { name: 'Output VAT Detail', description: 'All sales transactions with output VAT: invoice, customer, amount, VAT rate, and VAT amount.' },
        { name: 'Input VAT Detail', description: 'All purchase transactions with input VAT: bill, vendor, amount, VAT amount, and creditable status.' },
        { name: 'GL Reconciliation', description: 'Reconcile computed VAT return totals against the VAT GL account balances.' },
      ]}
      tabs={['VAT Summary', 'Monthly Filings', 'Quarterly Filings', 'Output VAT', 'Input VAT', 'GL Reconciliation']}
      features={[
        'Central VAT return management hub',
        'Monthly 2550M and quarterly 2550Q filing status',
        'Output and input VAT detail by transaction',
        'VAT GL reconciliation',
        'Excess input VAT carry-forward tracking',
        'VAT-exempt and zero-rated transaction classification',
      ]}
      dataDisplayed={[
        'Output VAT per period',
        'Input VAT per period (creditable)',
        'Net VAT payable or excess input',
        'Filing status per period',
        'GL vs. return reconciliation variance',
      ]}
      userActions={[
        'View VAT position for any period',
        'Navigate to 2550M or 2550Q generation',
        'Review output VAT by invoice',
        'Review input VAT by vendor',
        'Reconcile GL vs. computed return',
        'Export VAT detail report',
      ]}
      relatedPages={[
        { label: 'Form 2550M', href: '/philippine-tax/bir-forms/form-2550m' },
        { label: 'Form 2550Q', href: '/philippine-tax/bir-forms/form-2550q' },
        { label: 'Input VAT', href: '/taxes/vat/input-vat' },
        { label: 'Output VAT', href: '/taxes/vat/output-vat' },
      ]}
    />
  )
}

