'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Item Receipts"
      module="INVENTORY"
      breadcrumb="Inventory / Receiving / Item Receipts"
      purpose="Record and manage the receipt of inventory from purchase orders. Confirm quantities received, note discrepancies, assign lot/serial numbers, and trigger three-way match with vendor bill."
      components={[
        { name: "Receipt List", description: "All item receipts with vendor, PO reference, date, and status" },
        { name: "Receive Items Form", description: "Enter actual quantities received per PO line with lot/serial assignment" },
        { name: "Discrepancy Panel", description: "Flag over-receipts or under-receipts with vendor notification" },
        { name: "Three-Way Match", description: "Compare PO, receipt, and vendor bill quantities and amounts" },
        { name: "Cost Assignment", description: "Assign landed costs to received items" },
      ]}
      tabs={["All Receipts","Pending Matching","Discrepancies","Matched"]}
      features={["PO-linked receipt creation","Over/under-receipt handling","Lot and serial assignment on receipt","Three-way matching","Landed cost allocation"]}
      dataDisplayed={["Vendor and PO reference","Items and quantities ordered vs. received","Discrepancy status","Lot/serial numbers assigned","Receipt date and receiving dock"]}
      userActions={["Create item receipt","Enter received quantities","Assign lot/serial","Flag discrepancy","Match to vendor bill"]}
    />
  )
}

