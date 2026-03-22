'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Leave Requests"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Time & Leave / Leave Requests"
      purpose="Employee leave request management from submission to approval to payroll deduction. Employees submit requests that route to managers, check balance availability, and update payroll automatically."
      components={[
        { name: "Request List", description: "All leave requests with employee, dates, type, and status" },
        { name: "Submit Request Form", description: "Employee form: leave type, dates, reason, and supporting document" },
        { name: "Balance Check", description: "Real-time remaining balance check on the submission form" },
        { name: "Approval Workflow", description: "Route to direct manager for approval with email notification" },
        { name: "Payroll Integration", description: "Approved leave auto-deducted from balance and reflected in payroll" },
      ]}
      tabs={["My Requests","Pending Approval","Approved","Rejected","Team Calendar"]}
      features={["Self-service submission","Real-time balance check","Manager approval workflow","Payroll integration","Leave calendar view"]}
      dataDisplayed={["Employee and leave type","Requested dates and duration","Remaining balance","Approval status","Reason for leave"]}
      userActions={["Submit leave request","Approve or reject request","View team leave calendar","Cancel pending request","View leave history"]}
    />
  )
}

