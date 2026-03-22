'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Expenses"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Capture / Expenses"
      purpose="Employee expense report management. Submit, review, approve, and reimburse individual expense claims. Attach receipts, assign to projects, and track reimbursement status end-to-end."
      components={[
        { name: "Expense Report List", description: "All submitted expense reports with status, amount, and submitter" },
        { name: "Submit Expense Form", description: "Create a new expense report with line items, categories, and receipts" },
        { name: "Review and Approval Panel", description: "Manager review interface with line-item approval and rejection" },
        { name: "Reimbursement Status", description: "Track whether approved reports have been paid and when" },
        { name: "Policy Compliance Checker", description: "Flag line items that exceed policy limits or lack receipts" },
      ]}
      tabs={["My Expenses","Pending Approval","Approved","Paid","All Expenses"]}
      features={["Multi-line expense reports","Receipt OCR pre-fill","Policy limit enforcement","Multi-level approval","Payroll reimbursement integration"]}
      dataDisplayed={["Submitter name and department","Expense date range and total","Category and merchant per line","Policy compliance status","Approval and reimbursement status"]}
      userActions={["Submit expense report","Attach receipts","Review and approve","Request corrections","Reimburse approved report"]}
    />
  )
}

