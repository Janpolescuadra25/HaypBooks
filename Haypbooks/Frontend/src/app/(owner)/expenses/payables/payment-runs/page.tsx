'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payment Runs"
      module="BANKING & CASH"
      breadcrumb="Expenses / Payables / Payment Runs"
      purpose="Schedule and execute batch payment runs to pay multiple vendors at once. Select outstanding bills, generate payment file (ACH, BACS, check), and post the run to the general ledger."
      components={[
        { name: "Run Setup Panel", description: "Configure payment run: as-of date, payment method, bank account, and amount limit" },
        { name: "Bill Selection Grid", description: "Select which bills to include with vendor, amount, and due date" },
        { name: "Run Preview Summary", description: "Total amount, vendor count, and method breakdown before executing" },
        { name: "Execute and Post Controls", description: "Process payment run and post journal entries" },
        { name: "Payment File Export", description: "Download ACH/BACS file for upload to online banking" },
      ]}
      tabs={["Configure","Select Bills","Preview","History"]}
      features={["Batch multi-vendor payment","ACH and BACS file generation","Check batch printing","Amount threshold filtering","Run reversal support"]}
      dataDisplayed={["Included vendor and bill list","Total run amount","Payment method per vendor","Bank account debited","GL posting summary"]}
      userActions={["Configure payment run","Select bills to include","Preview run summary","Execute payment run","Download payment file","Reverse payment run"]}
    />
  )
}

