'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Salary Structures"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Salary Structures"
      purpose="Define salary structure templates that combine basic pay, allowances, deductions, and benefits into a complete pay package. Assign structures to employee groups or individual employees."
      components={[
        { name: "Structure Library", description: "All defined salary structures with component count and assigned employees" },
        { name: "Create Structure Form", description: "Name structure, add pay components (basic, HRA, transport, deductions)" },
        { name: "Component Editor", description: "Configure each component: fixed amount, % of basic, or formula" },
        { name: "Employee Assignment", description: "Assign a salary structure to one or more employees" },
        { name: "Structure Preview", description: "Sample pay stub using selected structure and a test salary" },
      ]}
      tabs={["Structures","Components","Employee Assignments","Preview"]}
      features={["Multi-component salary structures","Formula-based components","Employee assignment in bulk","Structure versioning","Pay stub preview"]}
      dataDisplayed={["Structure name","Component list","Total package value","Number of employees on structure","Last updated date"]}
      userActions={["Create salary structure","Add pay components","Assign to employees","Preview pay stub","Duplicate structure"]}
    />
  )
}

