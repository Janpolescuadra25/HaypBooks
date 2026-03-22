'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Currencies"
      module="SETTINGS"
      breadcrumb="Settings / Company / Currencies"
      purpose="Currencies manages the multi-currency configuration of the system — the functional (base) currency used for all financial reporting, and all foreign currencies that can be used in transactions. For each enabled foreign currency, exchange rates can be manually entered or auto-fetched from a live rate provider. Exchange rates are dated, so the system uses the rate in effect on each transaction date. At period-end, FX revaluation converts outstanding foreign-currency balances to the functional currency at the current rate."
      components={[
        { name: 'Functional Currency Display', description: 'The reporting currency (e.g., Philippine Peso PHP) — cannot be changed after initial setup without a full system reset.' },
        { name: 'Active Currency List', description: 'All enabled foreign currencies with current exchange rate, last updated date, and usage count.' },
        { name: 'Exchange Rate Table', description: 'Manual entry or historical record of exchange rates per currency per date.' },
        { name: 'Auto-Rate Feed Settings', description: 'Configure live exchange rate data source (BSP rates, Open Exchange Rates, or manual).' },
      ]}
      tabs={['Active Currencies', 'Exchange Rates', 'Rate Feed Settings', 'Rate History']}
      features={[
        'Multi-currency transaction support',
        'Functional currency setting',
        'Manual or auto exchange rate management',
        'Dated exchange rates for historical accuracy',
        'FX revaluation integration',
        'BSP and open market rate feeds',
        'Currency gain/loss auto-computation',
      ]}
      dataDisplayed={[
        'All active currencies with current rate',
        'Exchange rate history per currency',
        'Last rate update timestamp',
        'Currencies used in current open transactions',
      ]}
      userActions={[
        'Enable a new foreign currency',
        'Enter manual exchange rate',
        'Set up auto-rate feed',
        'View exchange rate history',
        'Disable an unused currency',
      ]}
      relatedPages={[
        { label: 'FX Revaluation', href: '/accounting/revaluations/fx-revaluation' },
        { label: 'FX Management', href: '/banking-cash/treasury/fx-management' },
        { label: 'Company Profile', href: '/settings/company/company-profile' },
      ]}
    />
  )
}

