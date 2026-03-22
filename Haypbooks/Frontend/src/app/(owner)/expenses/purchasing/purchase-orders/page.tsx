'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Purchase Orders"
      module="EXPENSES"
      breadcrumb="Expenses / Purchasing / Purchase Orders"
      purpose="Create and manage purchase orders sent to vendors. Track PO status from draft through approval, fulfillment, and matching to vendor bills. Enforce three-way matching controls."
      components={[
        { name: "PO List", description: "All purchase orders with vendor, total, status, and fulfillment percentage" },
        { name: "Create PO Form", description: "Enter vendor, line items, delivery date, taxes, and shipping details" },
        { name: "Approval Workflow", description: "Route PO for approval before sending to vendor" },
        { name: "Goods Receipt Matching", description: "Match received goods to PO lines for three-way matching" },
        { name: "Bill Matching", description: "Match vendor bill to PO and goods receipt for payment authorization" },
      ]}
      tabs={["All","Draft","Pending Approval","Sent","Received","Closed"]}
      features={["Full PO lifecycle management","Three-way matching (PO/receipt/bill)","Multi-currency POs","PO PDF generation","Partial fulfillment tracking"]}
      dataDisplayed={["Vendor and PO number","Line items and quantities","Total amount and currency","Fulfillment status","Matched bill status"]}
      userActions={["Create purchase order","Submit for approval","Send PO to vendor","Record goods receipt","Match to vendor bill"]}
    />
  )
}

