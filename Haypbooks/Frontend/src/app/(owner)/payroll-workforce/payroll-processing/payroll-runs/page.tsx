'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Runs"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Payroll Runs"
      purpose="Execute regular payroll runs for your pay schedule. Select employees, confirm earnings and deductions, preview payslips, submit for approval, and post to GL once approved."
      components={[
        { name: "Run Setup Wizard", description: "Step-by-step setup: select period, pay schedule, and employees" },
        { name: "Earnings Review Table", description: "Per-employee gross pay with breakdown of each earnings component" },
        { name: "Deductions Summary", description: "All deductions per employee: tax, statutory, benefits, and loans" },
        { name: "Pre-Payment Report", description: "Complete pre-payment report for approval review" },
        { name: "Post and Pay Controls", description: "Post GL entries and initiate bank payment processing" },
      ]}
      tabs={["Setup","Earnings","Deductions","Preview","Post"]}
      features={["Guided payroll run wizard","Earnings and deduction validation","Pre-payment report","Approval gate before payment","GL posting on approval"]}
      dataDisplayed={["Pay period and pay date","Employees included","Total gross pay","Total deductions","Net pay to be disbursed"]}
      userActions={["Start payroll run","Review earnings","Verify deductions","Submit for approval","Post and release payments"]}
    />
  )
}

