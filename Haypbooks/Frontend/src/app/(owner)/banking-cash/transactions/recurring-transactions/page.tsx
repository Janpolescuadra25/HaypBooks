'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recurring Transactions"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Transactions / Recurring Transactions"
      purpose="Banking-level recurring entries such as standing orders, automatic transfers, and scheduled bank debits. Manage schedules, pause, and view execution history."
      components={[
        { name: "Recurring Transaction List", description: "All active recurring bank transactions with schedule and next run" },
        { name: "Create Recurring Form", description: "Set up a new recurring bank transaction with account, amount, and schedule" },
        { name: "Schedule Calendar", description: "Calendar view of upcoming recurring transaction dates" },
        { name: "Pause/Resume Controls", description: "Temporarily suspend a recurring entry" },
        { name: "History Log", description: "All past executions of recurring transactions" },
      ]}
      tabs={["Active","Paused","History"]}
      features={["Flexible scheduling (daily/weekly/monthly)","Pause and resume","End-date setting","Auto-categorization on execution","Email reminder before execution"]}
      dataDisplayed={["Recurring transaction name","Bank account and amount","Frequency and next scheduled date","Last execution date","Status (active/paused)"]}
      userActions={["Create recurring transaction","Edit schedule","Pause or resume","View execution history","Delete recurring transaction"]}
    />
  )
}

