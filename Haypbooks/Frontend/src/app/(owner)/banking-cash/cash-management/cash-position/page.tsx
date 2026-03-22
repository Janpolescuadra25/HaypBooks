'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cash Position"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Cash Management / Cash Position"
      purpose="Real-time snapshot of your total cash across all bank accounts, credit cards, and cash funds. See balances by account and your total available cash position at a glance."
      components={[
        { name: "Cash Summary Bar", description: "Total cash header showing sum of all account balances" },
        { name: "Account Balance Cards", description: "Individual cards for each bank account, credit card, and cash fund" },
        { name: "Historical Balance Chart", description: "Line chart of total cash position over the past 90 days" },
        { name: "Inflow/Outflow Summary", description: "Today's and this week's inflows and outflows side by side" },
      ]}
      tabs={["Summary","By Account","History","Alerts"]}
      features={["Multi-account aggregation","Real-time balance refresh","90-day trend chart","Inflow/outflow breakdown","Foreign currency balances in functional currency"]}
      dataDisplayed={["Account name and institution","Current balance (functional currency)","Balance change since yesterday","Account type","Last updated time"]}
      userActions={["Refresh balances","Drill into account transactions","View trend chart","Set low-balance alert"]}
    />
  )
}

