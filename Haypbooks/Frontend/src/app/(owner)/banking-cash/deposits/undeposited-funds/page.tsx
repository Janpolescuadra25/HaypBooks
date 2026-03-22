'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Undeposited Funds (Deposits)"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Deposits / Undeposited Funds"
      purpose="View all customer payments and receipts held in the undeposited funds account awaiting grouping into a bank deposit. Select payments to include in your next deposit batch."
      components={[
        { name: "Payment Queue Table", description: "All undeposited payments with customer name, amount, and date received" },
        { name: "Deposit Builder Panel", description: "Select and group payments into a new deposit batch" },
        { name: "Running Total", description: "Live total of selected items matching your physical deposit amount" },
        { name: "Age Analysis", description: "Flag payments sitting in undeposited funds more than 3 days" },
      ]}
      tabs={["Pending Deposit","Recently Deposited"]}
      features={["Single-click deposit creation","Multi-payment grouping","Age monitoring for stale items","Payment method breakdown","Running sum while selecting"]}
      dataDisplayed={["Customer name and payment reference","Payment date and amount","Payment method (cash/check/e-transfer)","Days in undeposited funds","Invoice references"]}
      userActions={["Select payments for deposit","Create deposit batch","Investigate aged items","View deposit history"]}
    />
  )
}

