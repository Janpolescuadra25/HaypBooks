'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 2316"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 2316"
      badge="PH ONLY"
      purpose="Generate and distribute BIR Form 2316 (Certificate of Compensation Payment/Tax Withheld) for each employee at year-end. Employees use this to file their personal income tax return."
      components={[
        { name: "Bulk Generator", description: "Generate Form 2316 for all employees with one click from payroll data" },
        { name: "Individual Form View", description: "Preview the complete 2316 form for each employee" },
        { name: "Digital Delivery", description: "Email individual 2316 copies to each employee" },
        { name: "Substitution Filing List", description: "Identify employees qualifying for substituted filing" },
        { name: "Archive and Reprint", description: "Access and reprint previously generated 2316 forms" },
      ]}
      tabs={["Generate","Review","Distribute","Archive"]}
      features={["Bulk generation for all employees","Auto-population from payroll","Digital email delivery","Substituted filing identification","Multi-year archive"]}
      dataDisplayed={["Employee name and TIN","Annual gross compensation","Non-taxable compensation breakdown","Total taxes withheld","Net taxable compensation"]}
      userActions={["Generate all 2316s","Review individual form","Send to employee by email","Download PDF","View past year forms"]}
    />
  )
}

