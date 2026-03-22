'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxRatesPage() {
  return (
    <PageDocumentation
      title="Tax Rates"
      module="TAXES"
      breadcrumb="Taxes / Tax Setup / Tax Rates"
      purpose="Tax Rates defines the percentage rates applied to taxable transactions for each type of tax — VAT, withholding, sales tax, and others — organized by effective date to support rate changes without rewriting history. When a government enacts rate changes, new rates are entered here with future effective dates, and the system automatically applies the correct rate to transactions based on the transaction date. This ensures historical accuracy while supporting forward-looking compliance."
      components={[
        { name: 'Rate Registry Table', description: 'Table of all configured tax rates with tax type, rate %, country, and effective date range.' },
        { name: 'Add Rate Form', description: 'Form to define a new rate with tax type, percentage, applicable jurisdiction, and effective start date.' },
        { name: 'Rate History Timeline', description: 'Version history per tax type showing all past rates and the effective date each was active.' },
        { name: 'Future Rate Entry', description: 'Ability to enter a new rate with a future start date so it activates automatically on the correct date.' },
        { name: 'Compound Rate Config', description: 'Optional setup for stacked or compound rates where multiple taxes apply to the same base.' },
      ]}
      tabs={['All Rates', 'By Tax Type', 'Future Rates', 'Rate History']}
      features={[
        'Configure rates for all tax types with effective date ranges',
        'Enter future rate changes in advance for automatic activation',
        'Retain rate history to correctly calculate taxes on past transactions',
        'Configure compound or stacked rates for multi-layer tax scenarios',
        'Filter rates by jurisdiction, type, or effective date',
        'Export rate schedule for external review or documentation',
      ]}
      dataDisplayed={[
        'Tax type and rate percentage',
        'Jurisdiction applicable',
        'Effective start and end dates',
        'Status (active, expired, upcoming)',
        'Last modified date and user',
      ]}
      userActions={[
        'Add a new tax rate with effective date',
        'Enter a future rate change',
        'View rate history timeline',
        'Deactivate or expire an obsolete rate',
        'Export tax rate schedule',
      ]}
    />
  )
}

