'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxCodesPage() {
  return (
    <PageDocumentation
      title="Tax Codes"
      module="TAXES"
      breadcrumb="Taxes / Tax Setup / Tax Codes"
      purpose="Tax Codes are the system identifiers that classify how each transaction is treated for tax purposes — combining the tax type, applicable rate, and nature of the transaction into a single referenceable code. Every transaction line item in Haypbooks references a tax code, which drives automatic tax calculation and groups transactions correctly in tax reports. A well-structured tax code hierarchy simplifies compliance and reduces the risk of misclassification."
      components={[
        { name: 'Tax Codes List', description: 'Master list of all tax codes with code, description, tax type, rate, and active status.' },
        { name: 'Code Detail Form', description: 'Form to define a new tax code: code identifier, description, linked tax type, rate, and account mapping.' },
        { name: 'Rate Association', description: 'Dropdown to link the tax code to a configured tax rate that determines the calculation basis.' },
        { name: 'GL Account Mapping', description: 'Assign debit and credit GL accounts for the tax entry generated when this code is used.' },
        { name: 'Default Code per Transaction', description: 'Configuration to set which tax code auto-populates for specific transaction and item types.' },
      ]}
      tabs={['All Codes', 'Active Codes', 'System Codes', 'Custom Codes']}
      features={[
        'Create and manage tax codes combining type, rate, and purpose',
        'Link each tax code to a configured tax rate',
        'Map tax codes to their GL debit and credit accounts',
        'Set default tax codes for product/service categories',
        'Deprecate old codes without deleting historical usage',
        'Search and filter codes by type, rate, or usage',
      ]}
      dataDisplayed={[
        'Tax code identifier and description',
        'Associated tax type and rate',
        'GL account assignment (debit/credit)',
        'Active/inactive status',
        'Number of transactions using this code',
      ]}
      userActions={[
        'Create a new tax code',
        'Link code to tax rate and GL accounts',
        'Set default code per transaction/item type',
        'Deprecate an obsolete tax code',
        'Export tax codes for documentation',
      ]}
    />
  )
}

