'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetInsurancePage() {
  return (
    <PageDocumentation
      title="Asset Insurance"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Insurance / Asset Insurance"
      purpose="Record and manage insurance policies linked to specific fixed assets, ensuring adequate coverage and timely renewal."
      components={[
        { name: "Insurance Policy List", description: "All active and expired policies with linked assets" },
        { name: "Policy Form", description: "Create/edit insurance policy with insurer, coverage amount, and expiry" },
        { name: "Asset-Policy Link", description: "Associate multiple assets to a single policy or vice versa" },
        { name: "Renewal Alerts", description: "Upcoming expiry notifications" },
      ]}
      tabs={[
        "All Policies",
        "Active",
        "Expiring Soon",
        "Expired",
      ]}
      features={[
        "Policy expiry alerts",
        "Asset replacement value tracking",
        "Bulk renewal",
        "Coverage gap analysis",
        "Document upload for policy docs",
      ]}
      dataDisplayed={[
        "Policy number and insurer",
        "Coverage amount and type",
        "Linked assets and their values",
        "Policy start and expiry dates",
        "Premium amount",
      ]}
      userActions={[
        "Add a new insurance policy",
        "Link assets to policy",
        "Set renewal reminder",
        "Upload policy document",
        "Mark policy as renewed",
      ]}
    />
  )
}

