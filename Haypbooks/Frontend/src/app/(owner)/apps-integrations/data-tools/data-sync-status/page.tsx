'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Data Sync Status"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Data Tools / Data Sync Status"
      purpose="Monitor the synchronization status of all connected data sources and integrations. View last sync times, record counts, and errors to ensure data is current and complete."
      components={[
        { name: "Status Dashboard", description: "Overview of all integrations with color-coded health indicators" },
        { name: "Sync Detail Table", description: "Per-integration row showing name, last sync, records transferred, and status" },
        { name: "Error Log Panel", description: "Expandable error list with full error messages and timestamps" },
        { name: "Manual Refresh Controls", description: "Trigger an immediate sync for any connected source" },
      ]}
      tabs={["All Sources","Errors Only","Scheduled","History"]}
      features={["Real-time status badges","Auto-refresh polling","Error drill-down","Sync history chart","Email alerts on failure"]}
      dataDisplayed={["Integration name and type","Last successful sync timestamp","Records synced count","Error count and message","Next scheduled sync time"]}
      userActions={["Trigger manual sync","View error details","Configure sync schedule","Enable or disable sync"]}
    />
  )
}

