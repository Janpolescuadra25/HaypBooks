'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Card Transactions"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Credit Cards / Card Transactions"
      purpose="All company credit card charges across all cards. Categorize transactions, attach receipts, flag disputed charges, assign to employees, and push to expense reports for approval."
      components={[
        { name: "Transaction List", description: "All card transactions with date, merchant, amount, card, and category" },
        { name: "Categorization Panel", description: "Assign GL account and tags to selected transactions" },
        { name: "Receipt Attachment", description: "Upload and attach receipt images to each transaction" },
        { name: "Dispute Flag", description: "Mark transactions as disputed and track dispute resolution" },
        { name: "Expense Report Link", description: "Push selected transactions to an employee expense report" },
      ]}
      tabs={["All Transactions","Uncategorized","Disputed","Receipts Missing"]}
      features={["Multi-card transaction feed","Bulk categorization","Receipt attachment","Dispute tracking","Expense report integration"]}
      dataDisplayed={["Merchant name and MCC code","Transaction date and amount","Card last four and cardholder","Category assigned","Receipt attached status"]}
      userActions={["Categorize transaction","Attach receipt","Flag as disputed","Assign to employee","Push to expense report"]}
    />
  )
}

