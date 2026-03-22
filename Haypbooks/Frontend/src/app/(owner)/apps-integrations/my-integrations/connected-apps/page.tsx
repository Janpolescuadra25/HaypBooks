'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Connected Apps"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / My Integrations / Connected Apps"
      purpose="Manage all installed third-party integrations: view sync status, configure settings, trigger manual sync, or disconnect apps you no longer need."
      components={[
        { name: "Connected Apps List", description: "All installed integrations with logo, status badge, and last sync time" },
        { name: "App Settings Panel", description: "Per-integration configuration: sync frequency, field mapping, filters" },
        { name: "Sync History", description: "Log of recent sync events for each connected app" },
        { name: "Disconnect Button", description: "Remove integration and delete associated sync configuration" },
      ]}
      tabs={["Active","Paused","Errors","All"]}
      features={["Per-app sync configuration","Manual sync trigger","Field mapping customization","Connection health alerts","Bulk disconnect"]}
      dataDisplayed={["Connected app name and logo","Connection status (active/error/paused)","Last sync time and record count","Configuration summary","Permissions granted"]}
      userActions={["Configure sync settings","Trigger manual sync","View sync history","Disconnect integration","Re-authorize expired connection"]}
    />
  )
}

