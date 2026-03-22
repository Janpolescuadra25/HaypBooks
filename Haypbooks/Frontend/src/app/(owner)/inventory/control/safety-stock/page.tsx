'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Safety Stock"
      module="INVENTORY"
      breadcrumb="Inventory / Control / Safety Stock"
      purpose="Calculate and maintain safety stock buffers to protect against demand variability and supplier lead time uncertainty. View safety stock recommendations based on historical usage analysis."
      components={[
        { name: "Safety Stock Dashboard", description: "Items with safety stock set vs. items without sufficient buffer" },
        { name: "Calculation Engine", description: "AI-recommended safety stock levels based on demand variation and lead time" },
        { name: "Manual Override", description: "Set safety stock quantities manually for items with predictable demand" },
        { name: "Buffer Analysis", description: "Compare current stock to safety stock + reorder point threshold" },
        { name: "Replenishment Calendar", description: "When safety stock buffers will be breached if not replenished" },
      ]}
      tabs={["Overview","Recommendations","Manual Settings","Analysis"]}
      features={["Data-driven safety stock recommendations","Manual override","Buffer breach calendar","Lead time and variability inputs","Per-warehouse safety stock"]}
      dataDisplayed={["Item name and category","Recommended safety stock quantity","Current stock level","Cover days at average demand","Next buffer breach date"]}
      userActions={["View safety stock recommendations","Accept or override recommendation","Adjust lead time inputs","View buffer analysis","Export safety stock report"]}
    />
  )
}

