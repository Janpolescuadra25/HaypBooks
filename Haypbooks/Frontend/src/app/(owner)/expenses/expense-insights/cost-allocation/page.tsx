'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cost Allocation"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Insights / Cost Allocation"
      purpose="View how costs have been allocated across departments, projects, and cost centers. Configure allocation rules for overhead and shared costs to be distributed automatically."
      components={[
        { name: "Allocation Overview", description: "Summary of total allocated vs. unallocated costs by period" },
        { name: "Allocation Rules Engine", description: "Define rules to distribute shared costs by percentage or driver" },
        { name: "Cost Center Breakdown", description: "Allocated costs per department and cost center" },
        { name: "Unallocated Items", description: "Costs with no allocation rule assigned" },
        { name: "Allocation Report", description: "Full allocation schedule for audit and management review" },
      ]}
      tabs={["Overview","Rules","Results","Unallocated","Reports"]}
      features={["Rule-based cost allocation","Driver-based distribution (headcount, revenue, sq ft)","Multi-dimension allocation","Manual override","Allocation audit trail"]}
      dataDisplayed={["Total costs for period","Allocated amount by cost center","Unallocated balance","Allocation method per rule","Driver values used"]}
      userActions={["Create allocation rule","Run allocation","Review allocation results","Override allocation","Export allocation report"]}
    />
  )
}

