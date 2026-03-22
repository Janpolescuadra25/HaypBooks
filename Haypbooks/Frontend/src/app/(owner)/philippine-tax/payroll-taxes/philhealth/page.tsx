'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="PhilHealth Contributions"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Payroll Taxes / PhilHealth"
      badge="PH ONLY"
      purpose="Manage PhilHealth premium contributions for all employees. Compute contributions based on the current PhilHealth premium rate table, generate RF-1 forms, and remit monthly."
      components={[
        { name: "Contribution Summary", description: "Total PhilHealth contributions due for the period" },
        { name: "Premium Rate Table", description: "Current PhilHealth premium rate and monthly salary floor/ceiling" },
        { name: "Per-Employee Computation", description: "Monthly premium per employee with employer and employee share" },
        { name: "RF-1 Form Generator", description: "Generate PhilHealth RF-1 Employer's Remittance Report" },
        { name: "Electronic Contribution System", description: "Export file for PhilHealth's Electronic Contribution System (ECS)" },
      ]}
      tabs={["Summary","Per Employee","RF-1 Report","Remittance"]}
      features={["PhilHealth rate table maintenance","RF-1 report generation","ECS file export","Employer and employee split","Annual reconciliation"]}
      dataDisplayed={["Employee name and PhilHealth number","Monthly basic salary","Monthly premium total","Employee and employer share","Remittance deadline"]}
      userActions={["View contribution amounts","Generate RF-1 report","Export ECS file","Record remittance payment","View contribution history"]}
    />
  )
}

