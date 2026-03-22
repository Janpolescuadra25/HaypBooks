'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Warehouses"
      module="INVENTORY"
      breadcrumb="Inventory / Warehousing / Warehouses"
      purpose="Manage your warehouse locations including address, capacity, default GL accounts, and operational settings. Haypbooks tracks separate inventory balances per warehouse."
      components={[
        { name: "Warehouse List", description: "All warehouses with address, total stock value, and status" },
        { name: "Create Warehouse Form", description: "Name, address, warehouse type, and contact details" },
        { name: "Stock Levels", description: "Total on-hand quantity and value per warehouse" },
        { name: "GL Account Settings", description: "Override inventory GL accounts per warehouse if needed" },
        { name: "Default Warehouse", description: "Set which warehouse to default on new transactions" },
      ]}
      tabs={["Warehouses","Stock by Warehouse"]}
      features={["Multi-warehouse inventory tracking","Separate GL accounts per warehouse","Default warehouse assignment","Warehouse capacity","Transfer between warehouses"]}
      dataDisplayed={["Warehouse name and address","Total stock value","Number of items stored","Default GL inventory account","Primary contact"]}
      userActions={["Create warehouse","Edit warehouse details","View stock at warehouse","Set as default warehouse","Deactivate warehouse"]}
    />
  )
}

