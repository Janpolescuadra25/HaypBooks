'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function BaseCurrencyPage() {
  return (
    <PageDocumentation
      title="Base Currency"
      module="SETTINGS"
      breadcrumb="Settings / Entity Management / Base Currency"
      purpose="Base Currency sets the primary functional currency for the business entity — the currency in which all financial statements, ledger balances, and reports are denominated. This is a foundational setting that affects every transaction, report, and tax filing. Changing the base currency after transactions have been recorded requires a currency revaluation process and should be done with care."
      components={[
        { name: 'Current Base Currency Display', description: 'Prominent display of the currently active base currency with ISO code and symbol.' },
        { name: 'Currency Change Form', description: 'Controlled form to request a base currency change with warning about impact on historical data.' },
        { name: 'Impact Preview', description: 'Summary of how many transactions and accounts will be affected by a currency change.' },
        { name: 'Revaluation Notice', description: 'Informational notice explaining the revaluation journal entries that will be generated on change.' },
        { name: 'Administrator Confirmation Gate', description: 'Mandatory confirmation with account owner authentication before any currency change is applied.' },
      ]}
      tabs={['Current Setting', 'Change Currency', 'Revaluation History']}
      features={[
        'View and confirm the currently active base (functional) currency',
        'Request a base currency change with full impact preview',
        'Understand revaluation effects before committing to change',
        'Authenticate as account owner before change is allowed',
        'Review past currency revaluation history',
        'Link to currency settings for exchange rate configuration',
      ]}
      dataDisplayed={[
        'Current base currency (code, name, symbol)',
        'Number of transactions denominated in current currency',
        'Date currency was last set',
        'Revaluation history with gain/loss amounts',
        'Available currencies for change request',
      ]}
      userActions={[
        'View current base currency details',
        'Initiate a base currency change request',
        'Confirm identity before applying currency change',
        'Review impact preview and revaluation notice',
        'View revaluation journal history',
      ]}
    />
  )
}

