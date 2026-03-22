'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bills"
      module="EXPENSES"
      breadcrumb="Expenses / Payables / Bills"
      purpose="Manage all vendor bills from receipt through approval and payment. Capture bill details, attach PDFs, route for approval, and track bill status from open to paid."
      components={[
        { name: "Bill List Table", description: "All bills with vendor, bill date, due date, amount, and status" },
        { name: "Create Bill Form", description: "Enter bill details: vendor, date, due date, line items, taxes, and attachments" },
        { name: "Approval Workflow", description: "Route bill for manager or controller approval before payment" },
        { name: "Bill Detail View", description: "Full bill with line items, tax summary, and payment history" },
        { name: "Recurring Bill Setup", description: "Convert one-time bill into a recurring template" },
      ]}
      tabs={["All","Open","Overdue","Awaiting Approval","Paid"]}
      features={["Full bill lifecycle management","Multi-line item support","Tax calculation","PDF attachment","Approval workflow","Recurring bill conversion"]}
      dataDisplayed={["Vendor name and bill number","Bill and due dates","Line items and amounts","Tax applied","Approval and payment status"]}
      userActions={["Create new bill","Attach bill PDF","Submit for approval","Record payment","View payment history"]}
    />
  )
}

