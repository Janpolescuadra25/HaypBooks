'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Lot & Serial Tracking"
      module="INVENTORY"
      breadcrumb="Inventory / Control / Lot & Serial Tracking"
      purpose="Complete traceability for items tracked by lot number or serial number. Record lot/serial assignments on receipts and shipments, and trace any item from origin to customer."
      components={[
        { name: "Lot Register", description: "All active lots with item, quantity on hand, expiry date, and location" },
        { name: "Serial Number Registry", description: "Each serialized item with status (on hand/sold/returned) and location" },
        { name: "Traceability Report", description: "Full chain-of-custody from supplier receipt to customer shipment" },
        { name: "Expiry Management", description: "Lots approaching expiration date with alert configuration" },
        { name: "Assignment Interface", description: "Assign specific lots/serials when creating transactions" },
      ]}
      tabs={["Lots","Serial Numbers","Expiry Alerts","Traceability"]}
      features={["Full lot and serial traceability","FEFO expiry management","Chain-of-custody report","Recall readiness","Lot/serial assignment on all transactions"]}
      dataDisplayed={["Lot number and item assigned","Quantity on hand per lot","Expiry date and warehouse location","Source supplier and receipt date","Customer assigned to (if sold)"]}
      userActions={["View lot detail","Trace chain of custody","Check expiring lots","Assign lot to transaction","Run recall report"]}
    />
  )
}

