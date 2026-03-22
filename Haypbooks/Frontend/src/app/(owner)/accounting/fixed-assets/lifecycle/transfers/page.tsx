'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function LifecycleTransfersPage() {
  return (
    <PageDocumentation
      title="Transfers"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Lifecycle / Transfers"
      purpose="Transfer fixed assets between departments, cost centers, or locations, updating the asset register and posting any required inter-entity journal entries."
      components={[
        { name: "Transfer List", description: "All completed and pending transfers" },
        { name: "Transfer Form", description: "Initiate transfer: select asset, source/destination entity, effective date" },
        { name: "Approval Workflow", description: "Approve/reject pending transfer requests" },
      ]}
      tabs={[
        "All Transfers",
        "Pending",
        "Completed",
      ]}
      features={[
        "Inter-entity transfer journal",
        "Department cost center re-assignment",
        "Transfer approval workflow",
        "Asset register auto-update",
      ]}
      dataDisplayed={[
        "Asset name and serial number",
        "Source and destination location/entity",
        "Transfer date",
        "Approver and status",
        "Journal entry reference",
      ]}
      userActions={[
        "Submit asset for transfer",
        "Approve transfer request",
        "Post transfer journal",
        "View transfer history",
      ]}
    />
  )
}

