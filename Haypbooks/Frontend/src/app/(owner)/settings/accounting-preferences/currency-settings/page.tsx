'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CurrencySettingsPage() {
  return (
    <PageDocumentation
      title="Currency Settings"
      module="SETTINGS"
      breadcrumb="Settings / Accounting Preferences / Currency Settings"
      purpose="Currency Settings configures the functional currency and any additional transaction currencies your business supports, along with exchange rate sources and rounding rules. Multi-currency businesses use this page to define how currency conversions are applied to invoices, payments, and financial reports. Exchange rate updates can be manual or automatically fetched from live market data sources."
      components={[
        { name: 'Functional Currency Selector', description: 'Dropdown to set the base reporting currency for all financial statements.' },
        { name: 'Active Currencies List', description: 'Table of all enabled transaction currencies with ISO code, symbol, and current exchange rate.' },
        { name: 'Exchange Rate Source', description: 'Options to use manual rates, auto-fetch from a live provider, or import via CSV on a schedule.' },
        { name: 'Rounding Rules', description: 'Configuration for rounding precision (2 or 4 decimal places) and rounding direction applied to conversions.' },
        { name: 'Rate History Chart', description: 'Historical exchange rate trend chart for any selected currency pair over a configurable period.' },
      ]}
      tabs={['Active Currencies', 'Exchange Rates', 'Rate History', 'Rounding Rules']}
      features={[
        'Set or change the functional (base) currency for all financial reporting',
        'Enable multiple transaction currencies for invoices, bills, and payments',
        'Connect to live exchange rate providers for real-time rate updates',
        'Upload exchange rates manually via CSV for controlled-rate environments',
        'Configure rounding rules to minimize currency conversion variances',
        'View historical rate trends to audit past conversion accuracy',
      ]}
      dataDisplayed={[
        'Functional currency and ISO code',
        'List of active currencies with current exchange rates',
        'Rate source (manual, provider, imported)',
        'Last rate update timestamp per currency',
        'Rounding precision and direction setting',
      ]}
      userActions={[
        'Add or remove active transaction currencies',
        'Set the functional currency for reporting',
        'Update exchange rates manually or configure auto-refresh',
        'Import exchange rates from CSV',
        'View rate history for any currency pair',
      ]}
    />
  )
}

