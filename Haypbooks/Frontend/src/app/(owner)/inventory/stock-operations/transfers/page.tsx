'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stock Transfers"
      module="INVENTORY"
      breadcrumb="Inventory / Stock Operations / Transfers"
      purpose="Move inventory between warehouses, bin locations, or departments. Create transfer orders, confirm dispatch and receipt at both locations, and maintain a complete in-transit inventory record."
      components={[
        { name: "Transfer Order List", description: "All transfers with from/to location, items, quantities, and status" },
        { name: "Create Transfer Form", description: "Select items, from-warehouse, to-warehouse, and expected transfer date" },
        { name: "Dispatch Confirmation", description: "Record items dispatched from the source location" },
        { name: "Receipt Confirmation", description: "Confirm items received at the destination location" },
        { name: "In-Transit View", description: "Items currently in transit between locations" },
      ]}
      tabs={["All Transfers","Pending Dispatch","In Transit","Completed"]}
      features={["Multi-location transfer support","In-transit inventory tracking","Dispatch and receipt confirmation","Partial transfers","Transfer history"]}
      dataDisplayed={["Transfer order number","From and to warehouse/location","Items and quantities","In-transit quantity","Transfer status (draft/in-transit/completed)"]}
      userActions={["Create transfer order","Confirm dispatch","Confirm receipt","View in-transit stock","View transfer history"]}
    />
  )
}

