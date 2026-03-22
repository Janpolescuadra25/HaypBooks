'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetRevaluationsPage() {
  return (
    <PageDocumentation
      title="Revaluations"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Lifecycle / Revaluations"
      purpose="Record upward or downward revaluations of fixed assets under the revaluation model per IFRS IAS 16, with automatic journal entries to the revaluation reserve."
      components={[
        { name: "Revaluation History", description: "Past revaluations per asset with date and amount" },
        { name: "Revaluation Form", description: "Input fair value and effective date; system calculates surplus or deficit" },
        { name: "Revaluation Reserve", description: "Running balance of the revaluation reserve account" },
      ]}
      tabs={[
        "Revaluation History",
        "New Revaluation",
        "Revaluation Reserve",
      ]}
      features={[
        "Surplus/deficit auto-calculation",
        "Revaluation reserve tracking",
        "IFRS revaluation model support",
        "Journal entry auto-generation",
        "Audit trail",
      ]}
      dataDisplayed={[
        "Asset name and current carrying value",
        "New fair value",
        "Revaluation surplus or deficit",
        "Revaluation reserve balance",
        "Journal entry reference",
      ]}
      userActions={[
        "Record a new revaluation",
        "Review revaluation surplus",
        "Post revaluation journal",
        "Export revaluation schedule",
      ]}
    />
  )
}

