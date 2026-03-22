'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stock Zones"
      module="INVENTORY"
      breadcrumb="Inventory / Warehousing / Stock Zones"
      purpose="Define zones within warehouses such as receiving, bulk storage, picking, quarantine, and shipping. Assign inventory items to zones for organized stock management."
      components={[
        { name: "Zone List", description: "All zones per warehouse with type, items assigned, and capacity" },
        { name: "Create Zone Form", description: "Define zone name, type (bulk/pick/quarantine/receiving), and capacity" },
        { name: "Zone Assignment", description: "Assign categories or specific items to a primary zone" },
        { name: "Quarantine Zone Management", description: "Items in quarantine awaiting quality inspection" },
        { name: "Zone Stock View", description: "Total stock value and quantity per zone" },
      ]}
      tabs={["Zones","Zone Assignments","Quarantine","Zone Stock"]}
      features={["Zone type classification","Capacity management","Item-to-zone assignment","Quarantine zone tracking","Zone-level stock reporting"]}
      dataDisplayed={["Zone name and type","Warehouse it belongs to","Number of items assigned","Total stock value","Capacity and utilization"]}
      userActions={["Create warehouse zone","Assign items to zone","Manage quarantine zone","View zone stock","Print zone map"]}
    />
  )
}

