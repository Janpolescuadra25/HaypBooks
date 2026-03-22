'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Consolidation"
      module="ORGANIZATION"
      breadcrumb="Organization / Entity Structure / Consolidation"
      badge="ENT"
      purpose="Consolidation generates combined financial statements across all selected legal entities, eliminating intercompany transactions to present the group as a single economic unit. It produces consolidated Balance Sheet, Profit & Loss, and Cash Flow statements showing the financial position of the entire corporate group. The consolidation engine handles currency translation, intercompany eliminations, minority interest calculations, and acquisition accounting adjustments."
      components={[
        { name: 'Consolidation Group Setup', description: 'Define consolidation groups: which entities to include, ownership percentages, minority interest treatment.' },
        { name: 'Run Consolidation', description: 'Execute consolidation for a selected period: translate currencies, apply eliminations, calculate minority interest.' },
        { name: 'Elimination Journal', description: 'View and adjust the auto-generated intercompany elimination journal entries.' },
        { name: 'Consolidated Statements', description: 'Output consolidated Balance Sheet, P&L, and Cash Flow with entity-level contribution columns.' },
        { name: 'Currency Translation Summary', description: 'CTA (Cumulative Translation Adjustment) balance showing exchange differences from translating foreign entity financials.' },
      ]}
      tabs={['Consolidation Groups', 'Run Consolidation', 'Eliminations', 'Consolidated Reports', 'CTA']}
      features={[
        'Multi-entity consolidated financial statements',
        'Automatic intercompany elimination',
        'Foreign currency translation (ASC 830 / IAS 21)',
        'Minority interest / non-controlling interest calculation',
        'Acquisition cost allocation and goodwill tracking',
        'Period-over-period consolidated comparison',
        'Drill-down from consolidated to entity-level detail',
      ]}
      dataDisplayed={[
        'Consolidated Balance Sheet with entity columns',
        'Consolidated P&L with entity contributions',
        'Intercompany elimination journal entries',
        'Currency translation adjustments (CTA)',
        'Minority interest/non-controlling interest amounts',
        'Consolidation adjustments and reclassifications',
      ]}
      userActions={[
        'Define and configure consolidation groups',
        'Set ownership percentages per entity',
        'Run consolidation for selected period',
        'Review and adjust elimination entries',
        'Publish consolidated financial statements',
        'Export consolidated reports to Excel/PDF',
      ]}
      relatedPages={[
        { label: 'Legal Entities', href: '/organization/entity-structure/legal-entities' },
        { label: 'Intercompany Transactions', href: '/organization/entity-structure/intercompany' },
        { label: 'Financial Statements', href: '/reporting/reports-center/financial-statements' },
      ]}
    />
  )
}

