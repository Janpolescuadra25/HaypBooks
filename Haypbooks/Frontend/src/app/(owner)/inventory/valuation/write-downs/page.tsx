'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Write-Downs"
      module="INVENTORY"
      breadcrumb="Inventory / Valuation / Write-Downs"
      purpose="Record inventory write-downs for damaged, obsolete, or impaired stock. Reduce the carrying value of selected items, recognize the loss in the income statement, and maintain a write-down register."
      components={[
        { name: "Write-Down Form", description: "Select items, quantities, new value per unit, reason, and write-down GL account" },
        { name: "Supporting Evidence", description: "Attach photos or inspection reports as evidence" },
        { name: "Write-Down Register", description: "Historical log of all write-downs with amounts and reasons" },
        { name: "Impact Summary", description: "P&L impact of the write-down before posting" },
        { name: "Approval Workflow", description: "Route write-downs above threshold for CFO approval" },
      ]}
      tabs={["Create Write-Down","Register","Pending Approval"]}
      features={["Per-item and full-quantity write-down","GL loss recognition","Evidence attachment","Approval workflow","Write-down register"]}
      dataDisplayed={["Item name and current book value","Write-down quantity","New value per unit","Write-down loss amount","Reason and evidence status"]}
      userActions={["Create write-down","Attach evidence","Preview P&L impact","Submit for approval","Post write-down"]}
    />
  )
}

