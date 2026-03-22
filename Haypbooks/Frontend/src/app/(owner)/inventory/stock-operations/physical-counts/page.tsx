'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Physical Counts"
      module="INVENTORY"
      breadcrumb="Inventory / Stock Operations / Physical Counts"
      purpose="Conduct full physical inventory counts for a warehouse or location. Freeze inventory movement, count all items, compare to system records, and post adjustments in batch."
      components={[
        { name: "Count Freeze Controls", description: "Lock inventory movements during the count period" },
        { name: "Count Sheet Generator", description: "Generate count sheets by location zone for counting teams" },
        { name: "Enter Count Quantities", description: "Enter counted quantities per item and location" },
        { name: "Discrepancy Report", description: "All items where counted quantity differs from system quantity" },
        { name: "Approve and Post Variances", description: "Bulk approve and post adjustments for all discrepancies" },
      ]}
      tabs={["Setup","Counting","Review Discrepancies","Post","History"]}
      features={["Inventory movement freeze","Zone-based count sheets","Multi-counter support","Batch discrepancy posting","Historical count archive"]}
      dataDisplayed={["Items in scope","System quantity","Counted quantity","Variance quantity and value","Count date and participants"]}
      userActions={["Freeze inventory","Generate count sheets","Enter count results","Review discrepancies","Post adjustments","Unfreeze inventory"]}
    />
  )
}

