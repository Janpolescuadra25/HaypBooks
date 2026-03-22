'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ImpairmentPage() {
  return (
    <PageDocumentation
      title="Impairments"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Lifecycle / Impairments"
      purpose="Record asset impairment losses when an asset's recoverable amount falls below its carrying value, per accounting standards (IFRS/GAAP)."
      components={[
        { name: "Impairment List", description: "Historical impairment records per asset" },
        { name: "Impairment Form", description: "Record impairment: asset, impairment date, reason, and write-down amount" },
        { name: "Impairment Reversal", description: "Reverse a previous impairment if conditions have improved" },
      ]}
      tabs={[
        "All Impairments",
        "Pending Review",
        "Posted",
        "Reversals",
      ]}
      features={[
        "Impairment loss journal auto-generation",
        "Reversal of impairment (IFRS)",
        "Asset revaluation model support",
        "Period-end impairment review checklist",
      ]}
      dataDisplayed={[
        "Asset name and carrying value",
        "Recoverable amount",
        "Impairment loss amount",
        "Reason and supporting notes",
        "Journal entry reference",
      ]}
      userActions={[
        "Record an impairment",
        "Review recoverable amount",
        "Post impairment loss",
        "Reverse a prior impairment",
        "Export impairment schedule",
      ]}
    />
  )
}

