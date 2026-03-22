'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cycle Counts"
      module="INVENTORY"
      breadcrumb="Inventory / Stock Operations / Cycle Counts"
      purpose="Perform rolling cycle counts by counting a subset of inventory items on a rotating schedule. Capture count results, review discrepancies, and post adjustments to maintain accurate stock records."
      components={[
        { name: "Count Schedule", description: "Upcoming and past cycle count schedules by zone or category" },
        { name: "Count Sheet", description: "Printable or mobile-entry count sheet for the current cycle count" },
        { name: "Discrepancy Review", description: "Compare counted quantities to system quantities with variance" },
        { name: "Approve and Post", description: "Approve variances and post inventory adjustment entries" },
        { name: "Blind Counting Option", description: "Hide system quantity from counters to prevent bias" },
      ]}
      tabs={["Scheduled","In Progress","Review","History"]}
      features={["Scheduled cycle counting","Blind counting mode","Variance analysis","One-click adjustment posting","Count history"]}
      dataDisplayed={["Items in current count group","System quantity on hand","Counted quantity","Variance amount and percent","Count date and counter"]}
      userActions={["Start cycle count","Enter counted quantities","Review discrepancies","Post adjustments","View count history"]}
    />
  )
}

