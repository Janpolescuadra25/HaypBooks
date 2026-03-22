'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bin Locations"
      module="INVENTORY"
      breadcrumb="Inventory / Warehousing / Bin Locations"
      purpose="Manage bin, shelf, and slot locations within each warehouse. Assign specific inventory items to bin locations for precise put-away and picking instructions."
      components={[
        { name: "Bin Location List", description: "All bins with zone, row, shelf, and current occupancy" },
        { name: "Create Bin Form", description: "Define bin with label, zone, type, and capacity" },
        { name: "Item-to-Bin Assignments", description: "Assign default bin locations per item for systematic put-away" },
        { name: "Bin Occupancy Map", description: "Visual grid map of bin occupancy within the warehouse" },
        { name: "Empty Bins View", description: "Filter for available bins for incoming stock placement" },
      ]}
      tabs={["Bin List","Bin Map","Item Assignments","Empty Bins"]}
      features={["Zone, row, shelf, and bin- level structure","Default bin per item","Bin capacity limits","Occupancy visualization","Mobile-friendly bin management"]}
      dataDisplayed={["Bin label and zone","Current items stored","Available capacity","Default item assignments","Bin dimensions"]}
      userActions={["Create bin location","Assign item to bin","View bin occupancy","Move item to different bin","Print bin labels"]}
    />
  )
}

