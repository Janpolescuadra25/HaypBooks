'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Sync Logs"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Connections / Sync Logs"
      purpose="Detailed log of every bank feed sync event showing records imported, duplicate skips, warnings, and errors. Essential for troubleshooting feed issues and auditing transaction imports."
      components={[
        { name: "Log Table", description: "All sync events with bank name, timestamp, records imported, and status" },
        { name: "Event Detail Drawer", description: "Full details for a single sync event including transaction list" },
        { name: "Filter Controls", description: "Filter by bank account, date range, and status" },
        { name: "Error Summary", description: "Aggregated error counts and most common error types" },
      ]}
      tabs={["All Events","Errors","By Account"]}
      features={["Complete sync audit trail","Per-event record counts","Error code details","Filter by bank and date","CSV export"]}
      dataDisplayed={["Bank account and sync direction","Sync start and end time","Records imported/skipped/errored","Error codes and messages","Feed provider response"]}
      userActions={["View sync event details","Filter and search logs","Export log to CSV","Identify and diagnose errors"]}
    />
  )
}

