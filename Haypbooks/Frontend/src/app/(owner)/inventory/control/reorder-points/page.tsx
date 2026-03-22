'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Reorder Points"
      module="INVENTORY"
      breadcrumb="Inventory / Control / Reorder Points"
      purpose="Configure minimum stock levels that trigger automatic purchase order suggestions or alerts. Set reorder points, reorder quantities, and preferred suppliers for each item."
      components={[
        { name: "Reorder Point Config", description: "Per-item reorder point and reorder quantity settings" },
        { name: "Current Stock vs. Reorder", description: "Color-coded table showing items at or below reorder point" },
        { name: "Reorder Suggestions", description: "Auto-generated PO suggestions for items below reorder point" },
        { name: "Preferred Supplier Settings", description: "Assign preferred supplier per item for automated PO creation" },
        { name: "Lead Time Settings", description: "Set supplier lead times to calculate safety stock requirements" },
      ]}
      tabs={["Reorder Configuration","Below Reorder Point","Suggestions","History"]}
      features={["Automated reorder suggestions","Safety stock calculation","Preferred supplier assignment","Lead time consideration","Bulk update via CSV"]}
      dataDisplayed={["Item name and SKU","Current stock level","Reorder point threshold","Reorder quantity","Preferred supplier"]}
      userActions={["Set reorder point","Set reorder quantity","Review reorder suggestions","Create PO from suggestion","Import reorder settings"]}
    />
  )
}

