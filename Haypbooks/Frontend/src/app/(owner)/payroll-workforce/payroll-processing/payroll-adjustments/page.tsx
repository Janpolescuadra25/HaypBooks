'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Adjustments"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Payroll Adjustments"
      purpose="Correct errors in processed payroll runs. Create adjustments for overpayments, underpayments, tax corrections, and benefit deduction fixes that are applied in the next payroll run."
      components={[
        { name: "Adjustment List", description: "All pending and posted payroll adjustments with employee and amount" },
        { name: "Create Adjustment Form", description: "Identify the payroll error and enter the correcting amount" },
        { name: "Impact Calculator", description: "Show net impact on employee pay and employer costs" },
        { name: "Carry-Forward to Next Run", description: "Adjustments automatically carried into the next payroll run" },
        { name: "Audit Trail", description: "Original error, correction applied, and approvals recorded" },
      ]}
      tabs={["Pending","Approved","Applied","History"]}
      features={["Error correction capability","Carry-forward to next run","Tax impact calculation","Approval workflow","GL correction entry"]}
      dataDisplayed={["Employee name and affected period","Adjustment type and amount","Reason for adjustment","Current status","Next run inclusion"]}
      userActions={["Create payroll adjustment","Calculate net impact","Submit for approval","View carried adjustments","Post to GL"]}
    />
  )
}

