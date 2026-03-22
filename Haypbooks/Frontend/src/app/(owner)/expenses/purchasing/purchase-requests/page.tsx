'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Purchase Requests"
      module="EXPENSES"
      breadcrumb="Expenses / Purchasing / Purchase Requests"
      purpose="Internal purchase requisition workflow. Employees submit purchase requests that route for approval, budget check, and conversion to purchase orders or direct expenses."
      components={[
        { name: "Request List", description: "All purchase requests with requestor, amount, and approval status" },
        { name: "Submit Request Form", description: "Employee form: item/service description, vendor suggestion, amount, and justification" },
        { name: "Budget Check Display", description: "Real-time remaining budget for the GL account on the request form" },
        { name: "Approval Workflow", description: "Route request for manager and budget owner approval" },
        { name: "Convert to PO Button", description: "Approved requests can be converted directly to a purchase order" },
      ]}
      tabs={["My Requests","Pending Approval","Approved","Rejected","All Requests"]}
      features={["Employee self-service request submission","Inline budget checking","Approval routing","PO conversion","Request history tracking"]}
      dataDisplayed={["Requestor and submission date","Item description and vendor","Amount requested","Budget remaining","Approval status"]}
      userActions={["Submit purchase request","Review and approve","Reject with reason","Convert to purchase order","View request status"]}
    />
  )
}

