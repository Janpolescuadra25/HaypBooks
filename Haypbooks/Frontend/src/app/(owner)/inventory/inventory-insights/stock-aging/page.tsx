'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stock Aging"
      module="INVENTORY"
      breadcrumb="Inventory / Inventory Insights / Stock Aging"
      purpose="Analyze inventory age from date of receipt. Identify slow-moving and obsolete stock stratified by age buckets (0–30, 31–90, 91–180, 180+ days) to guide write-downs and clearance decisions."
      components={[
        { name: "Aging Summary Table", description: "All items stratified by receipt age buckets with value and quantity" },
        { name: "Lot-Level Aging", description: "For lot-tracked items, aging by individual lot receipt date" },
        { name: "Value at Risk", description: "Dollar value of inventory in each age bucket" },
        { name: "Write-Down Candidates", description: "Items in oldest bucket flagged for potential write-down" },
        { name: "Movement History", description: "Last sale/usage date for each aged item" },
      ]}
      tabs={["Aging Summary","By Lot","Write-Down Candidates","Export"]}
      features={["Receipt-date-based aging","Lot-level granularity","Value-at-risk quantification","Write-down candidate flagging","Movement velocity indicators"]}
      dataDisplayed={["Item name and category","Quantity in each age bucket","Value in each age bucket","Last movement date","Recommended action"]}
      userActions={["View stock aging report","Drill into lot-level aging","Flag item for write-down","Export aging report","Schedule clearance sale"]}
    />
  )
}

