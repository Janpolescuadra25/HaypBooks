'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Intercompany Transactions"
      module="ORGANIZATION"
      breadcrumb="Organization / Entity Structure / Intercompany Transactions"
      purpose="Intercompany Transactions manages the recording, tracking, and reconciliation of financial transactions between related legal entities within the same corporate group. This includes intercompany loans, services rendered between entities, shared cost allocations, and fund transfers. Proper intercompany accounting ensures that these transactions eliminate correctly in consolidated financial statements."
      components={[
        { name: 'Intercompany Transaction List', description: 'All intercompany transactions with entity pair (from/to), amount, type, date, and reconciliation status.' },
        { name: 'Create Intercompany Entry', description: 'Record an intercompany transaction that creates mirror entries in both entities simultaneously.' },
        { name: 'Intercompany Balance Summary', description: 'Matrix grid showing outstanding intercompany balances between each pair of entities.' },
        { name: 'Reconciliation Panel', description: 'Side-by-side comparison of intercompany balances across entity pairs to identify discrepancies.' },
        { name: 'Elimination Rules', description: 'Configure which intercompany account pairs are eliminated during consolidation.' },
      ]}
      tabs={['All Transactions', 'Pending Reconciliation', 'Balances Matrix', 'Elimination Rules']}
      features={[
        'Dual-entry creation across multiple entities',
        'Intercompany balance reconciliation tools',
        'Elimination rule configuration for consolidation',
        'Currency translation for cross-currency intercompany',
        'Automated netting of intercompany balances',
        'Audit trail of all intercompany adjustments',
      ]}
      dataDisplayed={[
        'Intercompany transaction pairs with entity names',
        'Transaction amount and currency',
        'Transaction type (loan, service, transfer, cost allocation)',
        'Reconciliation status (matched / unmatched)',
        'Outstanding intercompany balances by entity pair',
        'Elimination entries generated for consolidation',
      ]}
      userActions={[
        'Create a new intercompany transaction',
        'Reconcile intercompany balances between entities',
        'Generate reconciliation report',
        'Configure elimination rules for consolidation',
        'Reverse an erroneous intercompany transaction',
        'Export intercompany balance matrix',
      ]}
      relatedPages={[
        { label: 'Legal Entities', href: '/organization/entity-structure/legal-entities' },
        { label: 'Consolidation', href: '/organization/entity-structure/consolidation' },
        { label: 'Intercompany Transfers', href: '/banking-cash/treasury/intercompany-transfers' },
      ]}
    />
  )
}

