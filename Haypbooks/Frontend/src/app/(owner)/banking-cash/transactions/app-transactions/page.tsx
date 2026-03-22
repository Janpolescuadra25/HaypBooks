'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="App Transactions"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Transactions / App Transactions"
      purpose="Transactions recorded directly in Haypbooks rather than imported from a bank feed. Includes manual journal entries posted to bank accounts, manual payments, and direct bank entries."
      components={[
        { name: "Transaction List", description: "All manually entered bank-account transactions with source and status" },
        { name: "Record Transaction Form", description: "Create a new manual bank transaction with account, amount, type, and memo" },
        { name: "Match Controls", description: "Match app transactions to bank statement items during reconciliation" },
        { name: "Edit/Delete Controls", description: "Edit or delete unposted transactions" },
      ]}
      tabs={["All","Unmatched","Matched","Reconciled"]}
      features={["Manual transaction entry","Bank account reconciliation matching","Transaction type classification","GL posting","Attachment support"]}
      dataDisplayed={["Transaction date and reference","Bank account debited/credited","Amount and direction","GL account","Entry source and creator"]}
      userActions={["Record manual transaction","Edit transaction","Delete unposted transaction","Match to bank statement","View GL posting"]}
    />
  )
}

