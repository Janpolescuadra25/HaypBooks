'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Revaluation History"
      module="ACCOUNTING"
      breadcrumb="Accounting / Revaluations / Revaluation History"
      purpose="Revaluation History provides an archive of all FX revaluation runs performed — showing the period, rates used, accounts impacted, exchange gains/losses posted, and journal entry references. This is an essential audit trail showing the history of how foreign currency balances were restated at each period-end. It also tracks reversals of revaluations with reasons."
      components={[
        { name: 'Revaluation Run Table', description: 'All past FX revaluation runs with period, run date, currencies revalued, total gain, total loss, and journal reference.' },
        { name: 'Run Detail Drill-Down', description: 'Per-run breakdown showing accounts impacted, book rate vs. closing rate, and gain/loss per account.' },
        { name: 'Exchange Rate Log', description: 'Rates entered for each period by currency, with source/basis noted.' },
        { name: 'Reversal Log', description: 'Any reversed revaluation runs with reversal date, reason, and reversal journal reference.' },
      ]}
      tabs={['Run History', 'Exchange Rates Log', 'Reversals']}
      features={[
        'Complete archive of all FX revaluation runs',
        'Drill-through to journal entries',
        'Exchange rate history for all currencies',
        'Reversal tracking with reason documentation',
        'Export revaluation history for audit',
      ]}
      dataDisplayed={[
        'All FX revaluation runs by period',
        'Exchange rates used per currency per period',
        'Exchange gain/loss posted per run and per account',
        'Reversal records with reasons',
        'Cumulative FX gain/loss by currency',
      ]}
      userActions={[
        'View details of a prior revaluation run',
        'Check exchange rates used in a prior period',
        'Export revaluation history for audit package',
        'Link to journal entries from a revaluation run',
      ]}
      relatedPages={[
        { label: 'FX Revaluation', href: '/accounting/revaluations/fx-revaluation' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Trial Balance', href: '/accounting/core-accounting/trial-balance' },
      ]}
    />
  )
}

