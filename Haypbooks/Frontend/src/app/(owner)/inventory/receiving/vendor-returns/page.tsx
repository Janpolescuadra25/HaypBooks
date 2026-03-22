'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor Returns"
      module="INVENTORY"
      breadcrumb="Inventory / Receiving / Vendor Returns"
      purpose="Process the return of inventory items to vendors due to defects, overshipment, or order errors. Create return authorizations, adjust stock, and record vendor credits."
      components={[
        { name: "Return List", description: "All vendor returns with vendor, items, quantities, and status" },
        { name: "Create Return Form", description: "Select items and quantities to return with reason code" },
        { name: "Return Authorization", description: "Generate return merchandise authorization (RMA) document" },
        { name: "Stock Adjustment", description: "Automatically reduce on-hand quantity when return is confirmed" },
        { name: "Vendor Credit Tracking", description: "Track expected credit notes from vendor against each return" },
      ]}
      tabs={["Open Returns","Shipped","Credit Received","Closed"]}
      features={["Return merchandise authorization generation","Reason code classification","Stock quantity adjustment","Vendor credit tracking","Three-way return matching"]}
      dataDisplayed={["Return number and vendor","Items and quantities returned","Return reason","RMA status","Expected vendor credit"]}
      userActions={["Create vendor return","Generate RMA document","Record return shipment","Track vendor credit","Reconcile to vendor credit note"]}
    />
  )
}

