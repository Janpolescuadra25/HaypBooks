'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Business Checking"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Banking / Business Checking"
      badge="FS"
      purpose="Integrated business checking account management through Haypbooks Financial Services. Apply for an account, view balances, make transfers, and manage account settings from within your books."
      components={[
        { name: "Account Overview Card", description: "Current balance, account number, routing number, and status" },
        { name: "Transaction Feed", description: "Real-time transaction feed from the integrated checking account" },
        { name: "Transfer Controls", description: "Move funds between checking, savings, and external accounts" },
        { name: "Bill Pay Integration", description: "Pay vendors directly from the business checking account" },
        { name: "Account Settings", description: "Manage signatories, notifications, and overdraft settings" },
      ]}
      tabs={["Overview","Transactions","Transfers","Bill Pay","Settings"]}
      features={["Integrated bank account","Real-time balance updates","ACH and wire transfer","Bill pay","FDIC insurance info"]}
      dataDisplayed={["Current balance and available funds","Recent transactions","Pending transfers","Account number and routing","Interest earned"]}
      userActions={["View account balance","Make transfer","Pay bill","Download statement","Manage account settings"]}
    />
  )
}

