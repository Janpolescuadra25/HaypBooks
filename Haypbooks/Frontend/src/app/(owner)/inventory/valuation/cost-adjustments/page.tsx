'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cost Adjustments"
      module="INVENTORY"
      breadcrumb="Inventory / Valuation / Cost Adjustments"
      purpose="Record adjustments to the cost basis of inventory items after receipt. Handles retroactive landed cost additions, pricing corrections, and manual cost overrides with full GL impact."
      components={[
        { name: "Adjustment List", description: "All cost adjustments with item, original cost, adjusted cost, and reason" },
        { name: "Create Adjustment Form", description: "Select items, enter cost change, reason, and GL accounts" },
        { name: "Impact Preview", description: "See the inventory value change and GL entry before posting" },
        { name: "Batch Adjustment", description: "Apply cost adjustments to multiple items simultaneously" },
        { name: "Adjustment History", description: "Full log of all cost changes per item" },
      ]}
      tabs={["Create","History","Pending Approval"]}
      features={["Post-receipt cost adjustment","GL entry on every adjustment","Impact preview before posting","Batch adjustment support","Audit trail"]}
      dataDisplayed={["Item name and current unit cost","Adjustment amount and type","Adjusted unit cost","Total inventory value impact","Reason and approver"]}
      userActions={["Create cost adjustment","Preview GL impact","Post adjustment","View adjustment history","Export adjustments"]}
    />
  )
}

