'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Government Contributions"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Taxes / Government Contributions"
      badge="PH ONLY"
      purpose="Track and manage mandatory employee and employer government contributions including SSS, PhilHealth, Pag-IBIG, and other statutory deductions by jurisdiction."
      components={[
        { name: "Contribution Summary", description: "Total employee and employer contributions due for the period" },
        { name: "Rate Tables", description: "Current contribution rate tables per government agency" },
        { name: "Per-Employee Computation", description: "Contribution amounts for each employee by agency" },
        { name: "Remittance Schedule", description: "Due dates for remitting contributions to government agencies" },
        { name: "Form Generation", description: "Generate required government remittance forms" },
      ]}
      tabs={["Summary","Rate Tables","By Employee","Remittances","Forms"]}
      features={["Multi-agency contribution tracking","Rate table maintenance","Employee and employer split","Remittance scheduling","Government form generation"]}
      dataDisplayed={["Agency name","Employee contribution rate","Employer contribution rate","Monthly total per employee","Remittance due date"]}
      userActions={["View contribution computations","Update rate tables","Generate remittance forms","Record remittance payment","View remittance history"]}
    />
  )
}

