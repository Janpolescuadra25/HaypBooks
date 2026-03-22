'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employee Reimbursements"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Capture / Employee Reimbursements"
      purpose="Manage the full employee expense reimbursement lifecycle from approval through payment. Batch approved reimbursements, pay via payroll or bank transfer, and track reimbursement history."
      components={[
        { name: "Reimbursement Queue", description: "Approved expense reports ready for reimbursement payment" },
        { name: "Batch Payment Tool", description: "Select multiple reimbursements to pay in one batch" },
        { name: "Payment Method Selector", description: "Choose payroll inclusion, ACH direct deposit, or check" },
        { name: "Payment History", description: "Record of all past reimbursements with amounts and dates" },
        { name: "Employee Summary", description: "Per-employee total pending and paid reimbursements" },
      ]}
      tabs={["Ready to Pay","Batched","Paid","History"]}
      features={["Batch reimbursement processing","Multiple payment methods","Payroll integration","Payment history tracking","Employee self-service status"]}
      dataDisplayed={["Employee name and bank details","Total amount to reimburse","Expense report references","Payment method","Reimbursement date"]}
      userActions={["Approve for reimbursement","Batch reimbursements","Select payment method","Process payment","View reimbursement history"]}
    />
  )
}

