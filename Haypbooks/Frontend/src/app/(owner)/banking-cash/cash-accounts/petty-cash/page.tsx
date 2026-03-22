'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Petty Cash"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Cash Accounts / Petty Cash"
      purpose="Manage petty cash funds across locations. Record replenishments, disbursements, and petty cash counts. Reconcile fund balance to the general ledger regularly."
      components={[
        { name: "Fund Summary Cards", description: "Each petty cash fund with current balance and custodian info" },
        { name: "Transaction Log", description: "Chronological list of all petty cash disbursements and replenishments" },
        { name: "Cash Count Form", description: "Enter physical count amounts by denomination to verify balance" },
        { name: "Replenishment Request", description: "Generate a check or payment to replenish the fund to its float amount" },
        { name: "Reconciliation Report", description: "Compare physical count to recorded balance; show over/short" },
      ]}
      tabs={["Fund Overview","Transactions","Cash Count","Replenish","History"]}
      features={["Multi-fund support","Custodian assignment","Cash count workflow","Replenishment request generation","Expense account assignment per disbursement"]}
      dataDisplayed={["Fund name and custodian","Current book balance vs. count","Disbursement history","Last reconciliation date","Over/short amount"]}
      userActions={["Record disbursement","Perform cash count","Request replenishment","Reconcile fund","View disbursement history"]}
    />
  )
}

