'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Units of Measure"
      module="INVENTORY"
      breadcrumb="Inventory / Setup / Units of Measure"
      purpose="Define and manage units of measure for inventory items. Create custom units, set up conversion factors between units (e.g. case to each), and assign default units per item."
      components={[
        { name: "UOM List", description: "All configured units with name, abbreviation, and category (weight/volume/count/length)" },
        { name: "Create UOM Form", description: "Name the unit, set abbreviation, and assign base unit category" },
        { name: "Conversion Rates", description: "Define conversion factor between units (e.g. 1 case = 24 each)" },
        { name: "Default UOM per Item", description: "Assign buying and selling units of measure per item" },
        { name: "UOM Report", description: "Items grouped by their default unit of measure" },
      ]}
      tabs={["All Units","Conversions","Item Assignments"]}
      features={["Custom unit definition","Unit conversion factors","Per-item purchase and sale UOM","UOM-based pricing","Conversion on transactions"]}
      dataDisplayed={["Unit name and abbreviation","Unit category","Conversion factor to base unit","Items using this unit","Active/inactive status"]}
      userActions={["Create unit of measure","Set conversion factor","Assign to inventory item","Deactivate unit","View items by unit"]}
    />
  )
}

