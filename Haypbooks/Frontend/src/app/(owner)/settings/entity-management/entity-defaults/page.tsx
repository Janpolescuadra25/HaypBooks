'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function EntityDefaultsPage() {
  return (
    <PageDocumentation
      title="Entity Defaults"
      module="SETTINGS"
      breadcrumb="Settings / Entity Management / Entity Defaults"
      purpose="Entity Defaults configures system-wide default behaviors for the business entity — including default payment terms, transaction rounding, tax inclusiveness, and language preferences. These defaults flow into every new transaction and contact record, reducing repetitive data entry and ensuring consistency. Defaults can be overridden at the transaction or contact level when exceptions are needed."
      components={[
        { name: 'Payment Terms Default', description: 'Dropdown to select the standard payment terms (Net 30, Net 60, Due on Receipt) applied to new invoices.' },
        { name: 'Tax Defaults', description: 'Toggle for whether prices are entered as tax-inclusive or tax-exclusive, and the default tax rate applied.' },
        { name: 'Language & Locale', description: 'Selectors for default document language, date format, number format, and decimal separator.' },
        { name: 'Rounding Preferences', description: 'Controls for transaction total rounding: round half-up, half-even, or no rounding.' },
        { name: 'Default Timezone', description: 'Timezone setting for all timestamp display and date-based due date calculations.' },
      ]}
      tabs={['Transaction Defaults', 'Tax Defaults', 'Format & Locale', 'Time & Dates']}
      features={[
        'Set default payment terms for all new customers and invoices',
        'Choose between tax-inclusive and tax-exclusive price entry',
        'Configure default language and locale for document generation',
        'Set number formatting, decimal separator, and date format',
        'Define rounding rules for transaction totals',
        'Override defaults at customer, vendor, or transaction level',
      ]}
      dataDisplayed={[
        'Current default payment terms',
        'Tax inclusiveness setting and default tax rate',
        'Active language and locale configuration',
        'Date and number format preview',
        'Last modified by user and timestamp',
      ]}
      userActions={[
        'Update default payment terms',
        'Toggle tax-inclusive/exclusive pricing',
        'Set document language and locale',
        'Configure number and date formats',
        'Save changes and preview effect on new transactions',
      ]}
    />
  )
}

