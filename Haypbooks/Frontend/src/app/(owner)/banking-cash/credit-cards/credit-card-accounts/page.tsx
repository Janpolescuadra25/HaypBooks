'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Card Accounts"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Credit Cards / Credit Card Accounts"
      purpose="Register of all company credit cards with current balance, credit limit, statement date, and payment due date. Manage card settings and track utilization across all cards."
      components={[
        { name: "Card Account List", description: "All credit cards with issuer, last 4 digits, balance, and limit" },
        { name: "Balance Utilization Bar", description: "Visual utilization bar showing balance vs. credit limit" },
        { name: "Statement Settings", description: "Configure statement closing date and auto-pay settings" },
        { name: "Card Detail Panel", description: "Full card information including GL account mapping and cardholder" },
      ]}
      tabs={["Active Cards","Inactive"]}
      features={["Multi-card management","Utilization tracking","Statement dates","Auto-pay configuration","GL account mapping per card"]}
      dataDisplayed={["Card name and last four digits","Current balance and credit limit","Available credit","Statement closing date","Minimum payment due"]}
      userActions={["View card transactions","Configure statement settings","Set auto-pay","View card statement","Add cardholder"]}
    />
  )
}

