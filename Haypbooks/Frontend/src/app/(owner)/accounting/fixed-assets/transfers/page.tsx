'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetTransfersPage() {
  return (
    <PageDocumentation
      title="Asset Transfers"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Transfers"
      purpose="Initiate and track transfers of fixed assets between locations, departments, subsidiaries, or entities."
      components={[
        { name: "Transfer List", description: "All active and completed transfer records" },
        { name: "Transfer Form", description: "Asset selector, from/to location or entity, transfer date" },
        { name: "Journal Preview", description: "System-generated intercompany transfer journal" },
      ]}
      tabs={[
        "All Transfers",
        "In Progress",
        "Completed",
      ]}
      features={[
        "Intercompany transfer journal",
        "Department reassignment",
        "Multi-location support",
        "Approval gates",
        "Transfer completion confirmation",
      ]}
      dataDisplayed={[
        "Asset name and code",
        "From and to location/entity",
        "Transfer date and reason",
        "Approval status",
        "Journal entry reference",
      ]}
      userActions={[
        "Create new transfer",
        "Approve pending transfer",
        "Complete transfer",
        "View journal entry",
        "Export transfer history",
      ]}
    />
  )
}

