'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Company Card Activity"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Capture / Company Card Activity"
      purpose="Centralized view of all company credit card charges across all cardholders. Review charges, request missing receipts, categorize spending, and route for manager approval."
      components={[
        { name: "Transaction Feed", description: "All card charges chronologically with cardholder, merchant, and amount" },
        { name: "Receipt Request Tool", description: "Send automated receipt request to cardholder for missing documentation" },
        { name: "Categorization Panel", description: "Assign GL account and project code to charges" },
        { name: "Approval Queue", description: "Route card charges to manager for spending approval" },
        { name: "Cardholder Filter", description: "Filter transactions by cardholder, card, or department" },
      ]}
      tabs={["All Charges","Needs Receipt","Pending Approval","Approved"]}
      features={["Multi-cardholder visibility","Automated receipt requests","GL categorization","Approval routing","Cardholder detail view"]}
      dataDisplayed={["Cardholder name and card last 4","Merchant and transaction date","Category assigned","Receipt status","Approval status"]}
      userActions={["Review card charges","Request receipt from cardholder","Categorize transaction","Route for approval","Export charges"]}
    />
  )
}

