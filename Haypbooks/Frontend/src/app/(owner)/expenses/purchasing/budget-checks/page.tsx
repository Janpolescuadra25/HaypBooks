'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Budget Checks"
      module="EXPENSES"
      breadcrumb="Expenses / Purchasing / Budget Checks"
      purpose="Automatic budget enforcement at the point of purchase request and order creation. Validate spending against GL account budgets and warn or block over-budget purchases."
      components={[
        { name: "Budget Check Dashboard", description: "Overview of budget consumption by department and account" },
        { name: "Check Configuration", description: "Set accounts where checks apply; choose warn vs. hard block" },
        { name: "Purchase Request Overlay", description: "Budget remaining shown inline on purchase request form" },
        { name: "Over-Budget Requests", description: "Queue of requests that exceed budget needing override approval" },
        { name: "Budget History", description: "Log of all budget checks performed with outcome" },
      ]}
      tabs={["Dashboard","Configuration","Over-Budget Items","History"]}
      features={["Real-time budget balance validation","Warn or block on over-budget","Manager override workflow","GL account-level granularity","Budget roll-forward"]}
      dataDisplayed={["Account name and budget period","Budget amount","Spent to date","Available balance","Over-budget requests count"]}
      userActions={["Configure budget check rules","Review over-budget requests","Approve override","View budget consumption","Export budget check log"]}
    />
  )
}

