'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="FX Management"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / FX Management"
      purpose="FX Management handles the treasury function of managing foreign currency exposure — tracking open FX positions, recording FX contracts and hedges, monitoring realized and unrealized FX gains/losses, and maintaining FX rate tables. Companies with significant foreign currency transactions use this page to manage currency risk by entering forward contracts, spot purchases, and currency swaps, with the resulting accounting treatment flowing automatically to the GL."
      components={[
        { name: 'FX Exposure Summary', description: 'Net long/short position per foreign currency across all monetary items (AR, AP, bank accounts, deposits).' },
        { name: 'FX Rate Table', description: 'Current exchange rates used in the system for each active currency, with last updated timestamp.' },
        { name: 'FX Contract Register', description: 'All FX forward contracts and hedging instruments with contract date, maturity, rate, notional amount, and fair value.' },
        { name: 'FX Transaction Log', description: 'All FX conversion transactions recorded in the system with rates applied.' },
        { name: 'Gain/Loss Summary', description: 'Realized and unrealized FX gains and losses by period and currency.' },
      ]}
      tabs={['FX Exposure', 'FX Rates', 'FX Contracts', 'Transactions', 'Gain/Loss']}
      features={[
        'Net FX exposure tracking per currency',
        'FX rate table management for all active currencies',
        'Hedging instrument (FX forward) recording',
        'Realized and unrealized FX gain/loss calculation',
        'FX revaluation trigger from this page',
        'FX contract maturity alerts',
        'Audit trail for all FX rate changes',
      ]}
      dataDisplayed={[
        'Net exposure per foreign currency',
        'Current exchange rates',
        'Open FX contracts with fair values',
        'Realized FX PnL by period',
        'Unrealized FX PnL on open positions',
        'Currency breakdown of all monetary balances',
      ]}
      userActions={[
        'Update FX exchange rates',
        'Enter a new FX forward contract',
        'Record FX currency purchase/conversion',
        'View net exposure by currency',
        'Trigger FX revaluation for period-end',
        'Export FX position report',
      ]}
      relatedPages={[
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
        { label: 'FX Revaluation', href: '/accounting/revaluations/fx-revaluation' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Investment Portfolio', href: '/financial-services/investments/investment-portfolio' },
      ]}
    />
  )
}

