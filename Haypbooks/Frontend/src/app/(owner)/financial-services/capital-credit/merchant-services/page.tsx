'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Merchant Services"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Capital & Credit / Merchant Services"
      badge="FS"
      purpose="Integrated payment processing for accepting customer payments by credit card, ACH, and other methods. View transaction volumes, fees, chargebacks, and deposits within Haypbooks."
      components={[
        { name: "Processing Summary", description: "Total processed volume, net deposits, and fee summary for the period" },
        { name: "Transaction Feed", description: "All incoming customer payments with card type, amount, and fee" },
        { name: "Dispute Management", description: "Active chargebacks and disputes with status and response deadline" },
        { name: "Fee Analysis", description: "Breakdown of processing fees by transaction type and volume tier" },
        { name: "Deposit Reconciliation", description: "Match merchant service deposits to bank account credits" },
      ]}
      tabs={["Processing","Transactions","Disputes","Fees","Deposits"]}
      features={["Integrated payment processing","Real-time fee tracking","Chargeback management","Deposit matching","Net volume reporting"]}
      dataDisplayed={["Processing volume for period","Transaction count","Gross amount and fees","Net deposited amount","Active disputes count"]}
      userActions={["Review transactions","Respond to chargeback","Analyze fee breakdown","Reconcile deposits","Download statements"]}
    />
  )
}

