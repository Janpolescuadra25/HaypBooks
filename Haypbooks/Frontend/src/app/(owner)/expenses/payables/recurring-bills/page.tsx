'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recurring Bills"
      module="EXPENSES"
      breadcrumb="Expenses / Payables / Recurring Bills"
      purpose="Manage vendor bills that repeat on a fixed schedule such as rent, utilities, and subscriptions. Set start/end dates, auto-post or hold for review, and view upcoming bill schedule."
      components={[
        { name: "Recurring Bill List", description: "All recurring bill templates with vendor, amount, frequency, and next run" },
        { name: "Create Recurring Bill", description: "Define the vendor, amount, category, frequency, and start/end date" },
        { name: "Upcoming Schedule", description: "Calendar showing next 3 months of scheduled bill creation dates" },
        { name: "Pause and Resume", description: "Temporarily suspend a recurring bill template" },
        { name: "Execution History", description: "Log of each bill created from the recurring template" },
      ]}
      tabs={["Active","Paused","Upcoming Schedule","History"]}
      features={["Automatic bill generation","Amount and account default","Pause and resume","End-date management","Execution history"]}
      dataDisplayed={["Vendor and recurring template name","Bill amount and GL account","Frequency and next run date","Auto-post or hold setting","Status (active/paused)"]}
      userActions={["Create recurring bill","Edit schedule or amount","Pause recurring bill","View upcoming schedule","View bill history"]}
    />
  )
}

