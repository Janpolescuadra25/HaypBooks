'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Landed Costs"
      module="INVENTORY"
      breadcrumb="Inventory / Receiving / Landed Costs"
      purpose="Allocate additional costs such as freight, customs, insurance, and handling to received inventory items. Spread landed costs proportionally by value, weight, or quantity to get true unit costs."
      components={[
        { name: "Landed Cost Entry", description: "Record freight, customs, and other charges with vendor and amount" },
        { name: "Allocation Method Selector", description: "Choose allocation basis: by value, weight, quantity, or manual" },
        { name: "Cost Allocation Preview", description: "See how costs are spread across received items before posting" },
        { name: "Item Cost Impact", description: "Adjusted unit cost for each item after landed cost allocation" },
        { name: "Posting Controls", description: "Post landed cost adjustments to inventory and GL accounts" },
      ]}
      tabs={["Enter Charges","Allocate","Posted Costs","History"]}
      features={["Multiple allocation methods","Multi-charge support per shipment","Preview before posting","Inventory cost adjustment","GL integration"]}
      dataDisplayed={["Charge type and amount","Vendor for the charge","Allocation method selected","Per-item cost adjustment","Total landed cost value"]}
      userActions={["Add landed cost charge","Select allocation method","Preview allocation","Post landed costs","View cost impact per item"]}
    />
  )
}

