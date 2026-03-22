'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Off-Cycle Payroll"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Off-Cycle Payroll"
      purpose="Process payroll runs outside the normal schedule for bonuses, corrections, new hires mid-period, or final pay. Off-cycle runs follow the same approval and posting workflow as regular payroll."
      components={[
        { name: "Off-Cycle Run Setup", description: "Define run type, affected employees, pay period, and reason" },
        { name: "Earnings Entry", description: "Enter earnings, deductions, and adjustments for selected employees" },
        { name: "Tax Calculation", description: "Automatic tax withholding calculation for the off-cycle payment" },
        { name: "Approval Workflow", description: "Route for payroll manager approval before payment" },
        { name: "Run History", description: "All past off-cycle runs with amounts and employees affected" },
      ]}
      tabs={["Create Run","Review","Approve","History"]}
      features={["Mid-period payroll capability","Same validation as regular payroll","Tax withholding on off-cycle","Approval workflow","GL posting"]}
      dataDisplayed={["Run type and reason","Employees included","Total gross and net pay","Tax withheld","Payment date"]}
      userActions={["Create off-cycle run","Enter earnings","Review tax calculations","Submit for approval","Post and pay"]}
    />
  )
}

