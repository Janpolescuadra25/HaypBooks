'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="SSS Contributions"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Payroll Taxes / SSS"
      badge="PH ONLY"
      purpose="Manage Social Security System (SSS) contributions for all employees. Compute contributions using current SSS contribution tables, generate R-3 reports, and record monthly remittance."
      components={[
        { name: "Contribution Summary", description: "Total SSS contributions due from employees and employer this period" },
        { name: "SSS Contribution Table", description: "Current SSS contribution schedule based on monthly salary credit" },
        { name: "Per-Employee Computation", description: "SS, EC, and MPF contributions per employee" },
        { name: "SSS R-3 Generator", description: "Monthly Contribution Collection List (R-3) for SSS filing" },
        { name: "SSS Online File Export", description: "Generate electronic file for SSS online submission" },
      ]}
      tabs={["Summary","Per Employee","R-3 Report","Remittance"]}
      features={["SSS contribution table maintenance","R-3 report generation","SS, EC, and MPF breakdown","Electronic file export","Employer and employee split"]}
      dataDisplayed={["Employee name and SSS number","Monthly salary credit","SS contribution","EC contribution","MPF contribution"]}
      userActions={["View SSS computations","Generate R-3 report","Export online file","Record SSS payment","View contribution history"]}
    />
  )
}

