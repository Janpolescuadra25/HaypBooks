'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bank Deposits"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Deposits / Bank Deposits"
      purpose="Create bank deposit records that group multiple customer payments or receipts into a single deposit matching your physical bank deposit slip. Keeps GL activity clean and auditable."
      components={[
        { name: "Deposit List", description: "All deposit records with date, bank account, amount, and status" },
        { name: "Create Deposit Form", description: "Select undeposited payments to include in the deposit batch" },
        { name: "Deposit Detail View", description: "Line-by-line breakdown of a deposit showing each payment included" },
        { name: "Bank Match Controls", description: "Mark deposit as matched when it appears on the bank statement" },
      ]}
      tabs={["All Deposits","Uncleared","Cleared"]}
      features={["Multi-payment deposit batching","Bank statement matching","Deposit slip PDF print","Reverse deposit capability","Link to bank transaction"]}
      dataDisplayed={["Deposit date and bank account","Payment methods included","Total deposit amount","Number of items","Bank cleared date"]}
      userActions={["Create new deposit","Select payments to include","Print deposit slip","Mark deposit as cleared","Reverse deposit"]}
    />
  )
}

