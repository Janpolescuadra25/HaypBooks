'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CloseArchivePage() {
  return (
    <PageDocumentation
      title="Close Archive"
      module="ACCOUNTING — PERIOD CLOSE"
      breadcrumb="Accounting / Period Close / Close Archive"
      purpose="Browse the archive of all past closed accounting periods, access their financial snapshots, and retrieve audit-ready period reports."
      components={[
        { name: "Closed Period List", description: "All locked periods with close date and sign-off summary" },
        { name: "Period Snapshot Viewer", description: "Frozen balance sheet and income statement for each period" },
        { name: "Document Archive", description: "Attached close documents, reconciliations, and sign-offs" },
      ]}
      tabs={[
        "Closed Periods",
        "Period Snapshots",
        "Documents",
      ]}
      features={[
        "Immutable period snapshots",
        "PDF export of period financials",
        "Auditor access controls",
        "Search by date range",
        "Comparative period view",
      ]}
      dataDisplayed={[
        "Period name and fiscal year",
        "Close date and closed-by user",
        "Trial balance snapshot",
        "Attached close documents",
        "Number of adjustments in period",
      ]}
      userActions={[
        "View a closed period",
        "Download period financials",
        "Attach retroactive document",
        "Export archive list",
      ]}
    />
  )
}

