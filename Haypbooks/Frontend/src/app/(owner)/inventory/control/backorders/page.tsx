'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Backorders"
      module="INVENTORY"
      breadcrumb="Inventory / Control / Backorders"
      purpose="Track customer orders and purchase lines that cannot be fulfilled due to insufficient stock. Manage backorder queues, notify customers of delays, and prioritize fulfillment when stock arrives."
      components={[
        { name: "Backorder Queue", description: "All unfulfilled order lines with item, quantity backordered, and customer" },
        { name: "Priority Management", description: "Rank backorders for fulfillment when stock is received" },
        { name: "Customer Notification", description: "Send estimated fulfillment date updates to affected customers" },
        { name: "Stock Arrival Alert", description: "Auto-notify when purchase order receipt resolves a backorder" },
        { name: "Fulfillment Controls", description: "Allocate arriving stock to prioritized backorders" },
      ]}
      tabs={["Active Backorders","Partially Fulfilled","Fulfilled","Cancelled"]}
      features={["Real-time backorder tracking","Priority queue management","Customer notification integration","Auto-allocation on receipt","Backorder aging"]}
      dataDisplayed={["Item name and SKU","Quantity backordered","Customer and order reference","Estimated fulfillment date","Days on backorder"]}
      userActions={["View backorder details","Update estimated date","Notify customer","Allocate incoming stock","Cancel backorder"]}
    />
  )
}

