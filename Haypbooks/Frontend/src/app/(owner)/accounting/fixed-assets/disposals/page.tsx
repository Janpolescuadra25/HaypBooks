'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function FixedAssetDisposalsPage() {
  return (
    <PageDocumentation
      title="Disposals"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Disposals"
      purpose="Record the disposal of fixed assets through sale, write-off, or trade-in and automatically calculate gain or loss on disposal."
      components={[
        { name: "Disposal List", description: "All completed and pending disposal records" },
        { name: "Disposal Form", description: "Select asset, disposal method, proceeds, and disposal date" },
        { name: "Gain/Loss Calculator", description: "Automatic computation of gain or loss based on NBV and proceeds" },
        { name: "Journal Preview", description: "Preview of the disposal journal entry before posting" },
      ]}
      tabs={[
        "All Disposals",
        "Pending",
        "Completed",
        "Write-offs",
      ]}
      features={[
        "Auto-calculation of gain/loss",
        "Support for partial disposal",
        "Trade-in with offset",
        "Journal entry auto-generation",
        "Disposal certificate printing",
      ]}
      dataDisplayed={[
        "Asset being disposed",
        "Disposal date and method",
        "Net book value at disposal",
        "Proceeds from sale",
        "Gain or loss amount",
        "Journal entry reference",
      ]}
      userActions={[
        "Record a new disposal",
        "Enter sale proceeds",
        "Review gain/loss calculation",
        "Post disposal journal entry",
        "Print disposal certificate",
      ]}
    />
  )
}

