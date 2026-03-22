'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cash Pooling"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / Cash Pooling"
      badge="ENT"
      purpose="Cash Pooling (also called notional pooling or zero-balance cash sweeping) is an enterprise treasury technique where cash balances across multiple bank accounts or entities are virtually or physically consolidated to optimize interest income, reduce overdraft costs, and maximize investable cash. This page configures and monitors the cash pooling arrangement — defining the pool structure, notional header accounts, participant accounts, and the resulting interest offset calculations."
      components={[
        { name: 'Pool Structure Diagram', description: 'Visual tree showing the header account and all participant accounts in the pool with their daily balances.' },
        { name: 'Pool Performance Summary', description: 'Net pool position, effective interest rate, interest earned/offset per period, and cost savings vs. standalone.' },
        { name: 'Sweep Configuration', description: 'Configure zero-balance auto-sweep rules: sweep frequency, minimum balance threshold, and target account.' },
        { name: 'Pool Balance History', description: 'Daily pool position history with participant account breakdown.' },
      ]}
      tabs={['Pool Structure', 'Pool Performance', 'Sweep Config', 'Balance History']}
      features={[
        'Notional and zero-balance pooling support',
        'Multi-entity and multi-account pool structures',
        'Projected interest income calculation',
        'Auto-sweep configuration management',
        'Pool performance vs. standalone comparison',
        'Daily pool position tracking',
      ]}
      dataDisplayed={[
        'Net pool position by day',
        'Participant account balances',
        'Interest earned on net pool position',
        'Sweep events and amounts',
        'Cost savings from pooling',
      ]}
      userActions={[
        'View current pool position',
        'Configure sweep thresholds and frequency',
        'Add or remove accounts from pool',
        'View pool performance analytics',
        'Export pool report for bank review',
      ]}
      relatedPages={[
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Intercompany Transfers', href: '/banking-cash/treasury/intercompany-transfers' },
        { label: 'Credit Lines', href: '/financial-services/credit-facilities/credit-lines' },
      ]}
    />
  )
}

