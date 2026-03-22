'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Legal Entities"
      module="ORGANIZATION"
      breadcrumb="Organization / Entity Structure / Legal Entities"
      purpose="Legal Entities manages the registry of all legal business entities within the organization — parent companies, subsidiaries, branches, and holding companies. Each entity has its own tax registrations, bank accounts, chart of accounts sub-segment, and financial statements. This page is the foundation for multi-entity accounting and consolidated reporting."
      components={[
        { name: 'Entity Hierarchy Tree', description: 'Visual tree showing the parent-child relationships between all legal entities in the organizational structure.' },
        { name: 'Entity List', description: 'Table of all entities with legal name, entity type, country, tax ID, functional currency, and status.' },
        { name: 'Entity Detail Panel', description: 'Full entity profile: legal name, registration number, tax IDs, address, directors, bank accounts, and module settings.' },
        { name: 'Add Entity Form', description: 'Create a new legal entity with all required registration details, currency, and initial chart of accounts linkage.' },
        { name: 'Access Control', description: 'Configure which users have access to each entity for data segregation.' },
      ]}
      tabs={['All Entities', 'Active', 'Hierarchy View', 'By Country']}
      features={[
        'Multi-entity hierarchy management',
        'Per-entity tax registration and currency settings',
        'Intercompany balance tracking across entities',
        'Consolidated financial statements generation',
        'User access control per entity',
        'Entity-level chart of accounts configuration',
      ]}
      dataDisplayed={[
        'All registered legal entities with status',
        'Entity type (Parent / Subsidiary / Branch / JV)',
        'Country of incorporation and tax IDs',
        'Functional currency per entity',
        'Parent entity relationship',
        'Active module configuration per entity',
      ]}
      userActions={[
        'Create a new legal entity',
        'Edit entity registration details',
        'Set parent-child relationship in hierarchy',
        'Configure entity-specific settings (currency, accounts)',
        'Manage user access per entity',
        'Deactivate or archive an entity',
      ]}
      relatedPages={[
        { label: 'Intercompany Transactions', href: '/organization/entity-structure/intercompany' },
        { label: 'Consolidation', href: '/organization/entity-structure/consolidation' },
        { label: 'Intercompany Transfers', href: '/banking-cash/treasury/intercompany-transfers' },
        { label: 'Entity Defaults', href: '/settings/entity-management/entity-defaults' },
      ]}
    />
  )
}

