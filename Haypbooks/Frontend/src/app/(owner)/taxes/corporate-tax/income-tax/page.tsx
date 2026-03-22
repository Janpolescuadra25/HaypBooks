'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function IncomeTaxPage() {
  return (
    <PageDocumentation
      title="Income Tax"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Corporate Tax / Income Tax"
      purpose="Income Tax tracks the company's current income tax expense, tax payable, and effective tax rate across reporting periods. This module bridges the accounting profit with taxable income by applying permanent and temporary adjustments, enabling accurate current tax provision calculations. It generates the income tax provision schedule needed for financial statement disclosures and supports quarterly estimated tax payment planning."
      components={[
        { name: 'Tax Provision Summary', description: 'Summary table showing accounting profit, taxable income adjustments, taxable income, and current tax expense.' },
        { name: 'Permanent Difference Entries', description: 'Input table for non-deductible expenses and exempt income that cause permanent book-tax differences.' },
        { name: 'Effective Tax Rate Calculator', description: 'Computed metric showing effective tax rate vs. statutory rate with ETR bridge chart.' },
        { name: 'Estimated Tax Payment Schedule', description: 'Calendar of quarterly estimated tax payment due dates with amounts and payment status.' },
        { name: 'Jurisdiction Allocation', description: 'Apportion income and tax across multiple jurisdictions for multi-state or multi-country entities.' },
      ]}
      tabs={['Tax Provision', 'Book-Tax Differences', 'Effective Tax Rate', 'Estimated Payments', 'Jurisdiction Allocation']}
      features={[
        'Calculate current income tax provision from accounting profit',
        'Record and track permanent book-tax difference adjustments',
        'Compute effective tax rate and generate ETR bridge analysis',
        'Schedule and track quarterly estimated tax payments',
        'Allocate income across jurisdictions for multi-entity filing',
        'Generate tax provision note for financial statement disclosure',
      ]}
      dataDisplayed={[
        'Pre-tax accounting profit per period',
        'Tax adjustment items (permanent and temporary)',
        'Taxable income and current tax expense',
        'Effective tax rate vs. statutory rate',
        'Estimated payment amounts and due dates',
      ]}
      userActions={[
        'Enter or import accounting profit figures',
        'Add permanent difference line items',
        'Review and adjust effective tax rate',
        'Record estimated tax payment',
        'Generate tax provision schedule report',
      ]}
    />
  )
}

