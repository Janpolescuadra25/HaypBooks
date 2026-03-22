'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stock Movements"
      module="INVENTORY"
      breadcrumb="Inventory / Stock Operations / Stock Movements"
      purpose="Complete audit trail of all inventory movements. View every receipt, shipment, transfer, adjustment, and return with dates, quantities, locations, and document references."
      components={[
        { name: "Movement Log", description: "Chronological list of all stock movements with type, item, and quantity" },
        { name: "Movement Type Filter", description: "Filter by receipt, shipment, transfer, adjustment, or manual entry" },
        { name: "Item Movement History", description: "All movements for a selected item with running balance" },
        { name: "Location Movement Log", description: "All movements into and out of a specific warehouse location" },
        { name: "Export Controls", description: "Download movement history as CSV for audit or ERP reconciliation" },
      ]}
      tabs={["All Movements","Receipts","Shipments","Transfers","Adjustments"]}
      features={["Full movement audit trail","All movement types tracked","Item-level history with running balance","Location-level drill-down","CSV export"]}
      dataDisplayed={["Movement type and document reference","Item name and SKU","Quantity moved and direction","From and to location","Date and username"]}
      userActions={["View movement history","Filter by item or type","Drill into source document","Export movement log","Search by date range"]}
    />
  )
}

