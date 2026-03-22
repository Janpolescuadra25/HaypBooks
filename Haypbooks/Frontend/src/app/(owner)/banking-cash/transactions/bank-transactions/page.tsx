'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bank Transactions"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Transactions / Bank Transactions"
      purpose="All imported bank feed transactions requiring categorization and matching. Categorize as expenses, income, or transfers; match to invoices and bills; split transactions across multiple accounts."
      components={[
        { name: "Transaction Review List", description: "Uncategorized and unmatched imported transactions with AI suggestions" },
        { name: "Category Selector", description: "Quick dropdown to assign GL account to a transaction" },
        { name: "Match Panel", description: "Find and link bank transactions to invoices, bills, or expenses" },
        { name: "Split Transaction Tool", description: "Divide one transaction into multiple lines with different accounts" },
        { name: "Batch Actions Toolbar", description: "Categorize, approve, or exclude multiple transactions at once" },
      ]}
      tabs={["To Review","Categorized","Matched","Excluded"]}
      features={["AI-suggested categorization","Match to invoices and bills","Transaction splitting","Bulk actions","Rule-based auto-categorization"]}
      dataDisplayed={["Bank transaction date and description","Debit or credit amount","AI-suggested category","Match status","Bank account name"]}
      userActions={["Categorize transaction","Match to invoice or bill","Split transaction","Exclude transaction","Bulk categorize"]}
    />
  )
}

