'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function LifecycleDisposalsPage() {
  return (
    <PageDocumentation
      title="Disposals"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Lifecycle / Disposals"
      purpose="Manage the end-of-life stage of fixed assets including sale, scrapping, or donation, with full gain/loss accounting."
      components={[
        { name: "Disposal Queue", description: "Assets flagged for disposal with pending approval status" },
        { name: "Disposal Form", description: "Initiate disposal with method, date, and proceeds" },
        { name: "Approval Workflow", description: "Multi-step approval before disposal is posted" },
      ]}
      tabs={[
        "Disposal Queue",
        "Pending Approval",
        "Completed",
      ]}
      features={[
        "Approval workflow before posting",
        "Gain/loss auto-calculation",
        "Disposal certificate",
        "Integration with asset register",
      ]}
      dataDisplayed={[
        "Asset details and NBV",
        "Requested disposal method",
        "Expected gain/loss",
        "Approver and status",
      ]}
      userActions={[
        "Submit asset for disposal",
        "Approve disposal request",
        "Post disposal entry",
        "Generate disposal certificate",
      ]}
    />
  )
}

