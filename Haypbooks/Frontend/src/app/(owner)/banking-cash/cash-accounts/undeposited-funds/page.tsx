'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Undeposited Funds"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Cash Accounts / Undeposited Funds"
      purpose="Track customer payments received but not yet deposited to the bank. Select multiple payments to group into a single bank deposit transaction matching the physical deposit slip."
      components={[
        { name: "Undeposited Payments List", description: "All payments in the undeposited funds clearing account" },
        { name: "Deposit Selector", description: "Check boxes to select which payments to include in a deposit" },
        { name: "Deposit Preview", description: "Shows total amount and line detail for selected payments" },
        { name: "Deposit to Bank Button", description: "Creates a bank deposit record and clears selected items" },
      ]}
      tabs={["Pending","Deposited","All"]}
      features={["Grouping payments into deposit batches","Match to bank statement line","Date and reference tracking","Multi-payment deposit","Auto-clear on bank match"]}
      dataDisplayed={["Customer name and payment method","Payment date and amount","Invoice reference","Days in undeposited funds","Current running total"]}
      userActions={["Select payments for deposit","Create bank deposit","View deposit history","Investigate old undeposited items"]}
    />
  )
}

