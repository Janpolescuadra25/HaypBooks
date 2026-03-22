'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DepreciationRunsPage() {
  return (
    <PageDocumentation
      title="Depreciation Runs"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Depreciation / Runs"
      purpose="Execute monthly or periodic depreciation calculations for all active assets, posting the resulting journal entries to the general ledger."
      components={[
        { name: "Run History Table", description: "Past depreciation runs with date, period, and total amount" },
        { name: "New Run Wizard", description: "Step-by-step wizard to select period, preview amounts, and confirm posting" },
        { name: "Run Detail View", description: "Asset-by-asset breakdown for each completed run" },
        { name: "Undo Run", description: "Reverse a mistakenly posted depreciation run within the period" },
      ]}
      tabs={[
        "Run History",
        "New Run",
        "Run Details",
      ]}
      features={[
        "Preview before posting",
        "Asset exclusion rules",
        "Partial-period proration",
        "Multi-entity run",
        "Auto-post to GL",
        "Run reversal",
      ]}
      dataDisplayed={[
        "Run date and period",
        "Total depreciation amount",
        "Number of assets depreciated",
        "Journal entry reference",
        "Run status (Preview / Posted / Reversed)",
      ]}
      userActions={[
        "Start a new depreciation run",
        "Preview depreciation amounts",
        "Post depreciation to GL",
        "Reverse a prior run",
        "Download run report",
      ]}
    />
  )
}

