'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Intercompany Transfers"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / Intercompany Transfers"
      purpose="Intercompany Transfers manages cash movements between legal entities within the same corporate group — capital injections, intercompany loans, and management fee settlements. Each transfer records the sending entity, receiving entity, amount, currency, exchange rate (if cross-currency), and the intercompany accounting treatment. Transfers automatically post to the due-to/due-from intercompany accounts in both entities and appear in the intercompany elimination schedule at consolidation."
      components={[
        { name: 'Transfer Form', description: 'Select sending entity, receiving entity, transfer type (loan/capital/settlement), amount, currency, bank accounts, and effective date.' },
        { name: 'Intercompany Balance Dashboard', description: 'Intercompany receivable and payable balances between all entity pairs — showing which entities owe which.' },
        { name: 'Transfer History', description: 'All intercompany transfers with date, sending/receiving entities, amount, type, and status.' },
        { name: 'Settlement Proposal', description: 'Suggest netting of intercompany balances to minimize bank transfers.' },
      ]}
      tabs={['New Transfer', 'IC Balances', 'Transfer History', 'Netting']}
      features={[
        'Multi-entity intercompany cash transfer recording',
        'Automatic dual-entity journal entries (both entities)',
        'Cross-currency transfer support with FX rate',
        'Intercompany balance dashboard',
        'Netting of intercompany receivables/payables',
        'Transfer approval workflow for large amounts',
        'Integration with consolidation elimination',
      ]}
      dataDisplayed={[
        'All intercompany balances between entity pairs',
        'Transfer history with entity details',
        'Net intercompany position per entity',
        'Pending approval transfers',
        'Cross-currency transfer exchange rates',
      ]}
      userActions={[
        'Record a new intercompany transfer',
        'Approve a pending intercompany transfer',
        'View intercompany balances',
        'Propose intercompany netting',
        'Export intercompany schedule for consolidation',
      ]}
      relatedPages={[
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
        { label: 'Intercompany', href: '/organization/entity-structure/intercompany' },
        { label: 'Consolidation', href: '/organization/entity-structure/consolidation' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
      ]}
    />
  )
}

