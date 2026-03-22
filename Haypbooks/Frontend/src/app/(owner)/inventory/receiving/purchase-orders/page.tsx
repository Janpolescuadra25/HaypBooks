'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Purchase Orders (Inventory)"
      module="INVENTORY"
      breadcrumb="Inventory / Receiving / Purchase Orders"
      purpose="View and receive against open purchase orders in the inventory context. Track fulfillment progress, receive partial shipments, and maintain a complete history of PO receipts."
      components={[
        { name: "Open PO Table", description: "All purchase orders with items, quantities ordered, and qty remaining" },
        { name: "Receive Against PO", description: "Enter received quantities for each line with lot/serial and location" },
        { name: "Partial Receipt Tracking", description: "Track fulfillment percentage and open quantity per PO line" },
        { name: "Expected Delivery Calendar", description: "Upcoming PO delivery dates on a calendar view" },
        { name: "PO History", description: "All receipts recorded against a PO" },
      ]}
      tabs={["Open POs","Partially Received","Fully Received","Overdue"]}
      features={["Partial fulfillment support","Receipt-to-PO linking","Expected delivery calendar","Warehouse location assignment","PO fulfillment reporting"]}
      dataDisplayed={["PO number and vendor","Items and quantities ordered","Quantities received to date","Outstanding quantity","Expected delivery date"]}
      userActions={["View open POs","Create receipt against PO","Record partial receipt","View receipt history","Close completed PO"]}
    />
  )
}

