'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Installed Apps"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Connected Apps / Installed Apps"
      purpose="Installed Apps shows all currently connected third-party integrations with their active sync status, last sync time, error count (if any), and data flow summary. From here, users can reconfigure an integration's sync settings, temporarily pause a sync, view the sync history and error log, or disconnect an integration entirely. This is the operational hub for managing live integrations."
      components={[
        { name: 'Installed App Cards', description: 'Card per installed app: name, logo, sync status (active/paused/error), last sync, data synced count.' },
        { name: 'Sync Status Indicator', description: 'Real-time status: syncing (spinner), last successful, sync error (count and details).' },
        { name: 'App Settings Panel', description: 'Per app: configure sync direction (one-way/bidirectional), sync frequency, and field mapping.' },
        { name: 'Disconnect Button', description: 'Revoke the Haypbooks OAuth authorization and remove the integration. Does not delete already-synced data.' },
      ]}
      tabs={['All Installed', 'Active Syncs', 'Paused', 'Errors']}
      features={[
        'Installed app management',
        'Real-time sync status monitoring',
        'Per-app error log access',
        'Sync pause and resume',
        'Re-authorize expired connections',
        'App-level sync settings',
      ]}
      dataDisplayed={[
        'All installed apps with sync status',
        'Last sync timestamp per app',
        'Sync errors requiring attention',
        'Data volumes synced per app',
      ]}
      userActions={[
        'View all installed apps',
        'Pause or resume a sync',
        'View sync history and errors',
        'Update sync settings',
        'Re-authorize an expired connection',
        'Disconnect an integration',
      ]}
      relatedPages={[
        { label: 'Marketplace', href: '/apps-integrations/connected-apps/marketplace' },
        { label: 'Sync History', href: '/apps-integrations/data-sync/sync-history' },
        { label: 'Webhooks', href: '/apps-integrations/api/webhooks' },
      ]}
    />
  )
}

