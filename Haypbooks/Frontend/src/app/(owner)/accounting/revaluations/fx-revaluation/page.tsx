'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="FX Revaluation"
      module="ACCOUNTING"
      breadcrumb="Accounting / Revaluations / FX Revaluation"
      purpose="FX Revaluation performs the period-end revaluation of foreign currency monetary balances — accounts receivable, accounts payable, bank accounts, intercompany loans, and other monetary items denominated in foreign currencies. It restates these balances at the closing rate as at period-end and posts exchange gain/loss journal entries to the GL per PAS 21. This is a required closing procedure for companies with foreign currency transactions."
      components={[
        { name: 'FX Rate Input', description: 'Enter period-end closing exchange rates for each foreign currency (USD, EUR, SGD, etc.) used in the company.' },
        { name: 'Revaluation Preview', description: 'Shows all foreign currency balances, their book rate, new closing rate, and resulting exchange gain/(loss) per account.' },
        { name: 'Post FX Journals Button', description: 'Post all revaluation journal entries to recognize exchange gains/losses for the period.' },
        { name: 'Exchange Gain/Loss Summary', description: 'Total exchange gain and total exchange loss for the period posted to the FX account.' },
        { name: 'FX Rate History', description: 'Archive of all period-end exchange rates used historically for each currency.' },
      ]}
      tabs={['Run Revaluation', 'FX Rate History', 'Posted Journals']}
      features={[
        'Multi-currency balance revaluation per PAS 21',
        'Closing rate entry for all active currencies',
        'Preview exchange gains/losses before posting',
        'Automatic journal entry generation for all impacted accounts',
        'Net FX gain/loss summary per currency',
        'Prior period FX rates archive for reference',
      ]}
      dataDisplayed={[
        'All foreign currency monetary balances',
        'Book rate (transaction rate) vs. closing rate',
        'Exchange gain or (loss) per account',
        'Total FX gain and total FX loss for the period',
        'FX rate history for auditors',
      ]}
      userActions={[
        'Enter closing exchange rates for each currency',
        'Preview FX revaluation impact',
        'Post FX revaluation journal entries',
        'View historical exchange rates by period',
        'Reverse FX revaluation and re-run if rates change',
      ]}
      relatedPages={[
        { label: 'Revaluation History', href: '/accounting/revaluations/revaluation-history' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Period Close', href: '/accounting/period-close/close-checklist' },
        { label: 'FX Management', href: '/banking-cash/treasury/fx-management' },
      ]}
    />
  )
}

