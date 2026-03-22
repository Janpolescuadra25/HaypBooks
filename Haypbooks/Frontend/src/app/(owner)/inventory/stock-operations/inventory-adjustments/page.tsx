'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Inventory Adjustments"
      module="INVENTORY"
      breadcrumb="Inventory / Stock Operations / Inventory Adjustments"
      purpose="Record manual adjustments to inventory quantities and values for corrections, damages, shrinkage, and write-downs. Every adjustment creates a GL entry for full accounting traceability."
      components={[
        { name: "Adjustment Form", description: "Select item, warehouse location, quantity change, adjustment reason, and GL account" },
        { name: "Bulk Adjustment Import", description: "Upload CSV to process multiple adjustments simultaneously" },
        { name: "Adjustment History", description: "Complete log of all past adjustments with reason codes and amounts" },
        { name: "Value Impact", description: "Calculated cost value of quantity adjustment before posting" },
        { name: "Approval Workflow", description: "Large adjustments route for manager approval" },
      ]}
      tabs={["Create Adjustment","History","Pending Approval"]}
      features={["Positive and negative adjustments","Reason code classification","GL entry on every adjustment","Approval workflow for large variances","Batch import"]}
      dataDisplayed={["Item name and SKU","Warehouse location","Quantity adjusted","Adjustment reason","GL cost impact"]}
      userActions={["Create adjustment","Select reason code","Preview cost impact","Post adjustment","View adjustment history"]}
    />
  )
}

