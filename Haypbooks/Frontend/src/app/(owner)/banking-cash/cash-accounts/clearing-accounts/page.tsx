'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Clearing Accounts"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Cash Accounts / Clearing Accounts"
      purpose="View and manage clearing and suspense accounts used for in-transit funds, unmatched payments, and payment processor float. Ensure all clearing balances are properly resolved."
      components={[
        { name: "Account Balance Table", description: "All clearing accounts with current balance and aging of items" },
        { name: "Clearing Item List", description: "Individual items posted to each clearing account pending resolution" },
        { name: "Resolution Panel", description: "Tools to match and clear items against corresponding transactions" },
        { name: "Aging Report", description: "Days outstanding for each unresolved clearing item" },
      ]}
      tabs={["Balances","Items","Aging","History"]}
      features={["Clearing account balance monitoring","Item-level aging view","Manual resolution tools","Auto-clear on match","Alert on stale items"]}
      dataDisplayed={["Clearing account name and GL code","Current balance","Number of outstanding items","Oldest item age (days)","Payment processor name"]}
      userActions={["View clearing account items","Match item to transaction","Manually clear item","View aging report","Investigate stale items"]}
    />
  )
}

