'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Allowances"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Allowances"
      purpose="Define and manage employee allowances such as transportation, meal, housing, and clothing. Configure taxability, amounts, and eligibility per employee or position."
      components={[
        { name: "Allowance Types List", description: "All defined allowance types with name, amount, and taxability" },
        { name: "Create Allowance Form", description: "Define allowance name, amount or rate, frequency, and tax treatment" },
        { name: "Employee Assignments", description: "Assign specific allowances to employees or employee groups" },
        { name: "Payroll Integration", description: "Allowances automatically included in payroll run calculations" },
        { name: "Tax Setup", description: "Mark allowances as taxable, non-taxable, or partially taxable" },
      ]}
      tabs={["Allowance Types","Employee Assignments","History"]}
      features={["Allowance type management","Taxability configuration","Employee-level assignment","Payroll auto-inclusion","Frequency settings (monthly/bi-weekly)"]}
      dataDisplayed={["Allowance name and type","Amount or rate formula","Taxability status","Eligible employee count","Total monthly cost"]}
      userActions={["Create allowance type","Set taxability","Assign to employee","Update allowance amount","Deactivate allowance"]}
    />
  )
}

