'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Integration Logs"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / My Integrations / Integration Logs"
      purpose="Detailed event logs for every integration sync operation. See exactly what was synced, what errors occurred, how many records were transferred, and full request/response payloads for debugging."
      components={[
        { name: "Log Table", description: "Chronological list of all sync events across all integrations" },
        { name: "Event Detail Drawer", description: "Full event details including payload, response, duration, and error message" },
        { name: "Filter Controls", description: "Filter by integration, status, date range, and event type" },
        { name: "Export Log", description: "Download filtered log entries as CSV for audit or support purposes" },
      ]}
      tabs={["All Events","Errors","By Integration","Export"]}
      features={["Full request/response capture","Advanced filtering","Payload inspection","CSV export for audit","Retention of 90 days"]}
      dataDisplayed={["Event timestamp and duration","Integration name and event type","Records created/updated/deleted","HTTP status code","Error message if applicable"]}
      userActions={["Search and filter logs","View event payload details","Export logs to CSV","Identify and diagnose errors"]}
    />
  )
}

