'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Sync Settings"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Data Sync / Sync Settings"
      purpose="Sync Settings configures the data synchronization rules for all installed integrations — which data objects are synced (invoices, contacts, products, payments), in which direction (Haypbooks → External, External → Haypbooks, or bidirectional), how frequently (real-time, every hour, daily), what happens to conflicts, and which data to exclude from sync. Fine-grained sync settings prevent unwanted data overwrites and ensure only relevant data flows between systems."
      components={[
        { name: 'Integration Sync Config', description: 'Per installed app: what objects are enabled for sync, direction (one-way/bidirectional), and frequency.' },
        { name: 'Conflict Resolution Rules', description: 'When the same record exists in both systems with different values: which system wins (Haypbooks always wins, external always wins, or manual resolve).' },
        { name: 'Data Filters', description: 'Exclude specific records from sync: e.g., only sync invoices above PHP 1,000, or exclude test data.' },
        { name: 'Field Mapping', description: 'Link to the field mapping tool to configure how fields in external systems map to Haypbooks fields.' },
      ]}
      tabs={['Sync Configuration', 'Conflict Rules', 'Data Filters', 'Schedule']}
      features={[
        'Per-integration sync object and direction configuration',
        'Sync frequency options (real-time to daily)',
        'Conflict resolution policy per integration',
        'Data filter rules for selective sync',
        'Link to field mapping configuration',
      ]}
      dataDisplayed={[
        'Active sync settings per integration',
        'Objects enabled for sync per integration',
        'Sync direction per object',
        'Last sync schedule run',
      ]}
      userActions={[
        'Enable or disable sync for a specific object',
        'Set sync direction',
        'Configure sync schedule',
        'Set conflict resolution policy',
        'Configure data filters',
        'Save sync configuration changes',
      ]}
      relatedPages={[
        { label: 'Installed Apps', href: '/apps-integrations/connected-apps/installed-apps' },
        { label: 'Sync History', href: '/apps-integrations/data-sync/sync-history' },
        { label: 'Field Mapping', href: '/apps-integrations/data-sync/field-mapping' },
      ]}
    />
  )
}

