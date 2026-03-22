'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Final Pay"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Final Pay"
      purpose="Calculate and process final pay for terminated employees. Includes prorated salary, unused leave encashment, separation benefits, clearance deductions, and final pay slips."
      components={[
        { name: "Final Pay Calculator", description: "Enter termination date and compute all final pay components" },
        { name: "Leave Encashment", description: "Calculate unused leave balance converted to cash at current rate" },
        { name: "Separation Benefits", description: "Compute separation pay based on tenure and reason for termination" },
        { name: "Clearance Deductions", description: "Add deductions for unreturned equipment, loans, or cash advances" },
        { name: "Final Pay Slip", description: "Generate and email the employee's official final pay slip" },
      ]}
      tabs={["Calculate","Review Components","Deductions","Approve","History"]}
      features={["Proration calculations","Leave balance encashment","Separation pay calculator","Clearance deduction management","Final payslip generation"]}
      dataDisplayed={["Employee name and termination date","Pro-rated salary amount","Leave encashment value","Separation pay amount","Net final pay after deductions"]}
      userActions={["Enter termination details","Calculate final pay components","Add clearance deductions","Approve final pay","Generate and send final payslip"]}
    />
  )
}

