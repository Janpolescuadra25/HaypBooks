'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Pag-IBIG Contributions"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Payroll Taxes / Pag-IBIG"
      badge="PH ONLY"
      purpose="Manage mandatory Pag-IBIG (HDMF) contributions for all employees. Compute employee and employer contributions, generate remittance reports, and process monthly remittance to HDMF."
      components={[
        { name: "Contribution Summary", description: "Total employee and employer Pag-IBIG contributions per period" },
        { name: "Rate Table", description: "Current contribution schedules based on monthly compensation" },
        { name: "Per-Employee Computation", description: "Individual contribution amounts per employee" },
        { name: "HDMF Remittance Report", description: "Generate HDMF RF-1 and electronic file for submission" },
        { name: "Payment Register", description: "All Pag-IBIG remittances with HDMF confirmation numbers" },
      ]}
      tabs={["Summary","Per Employee","Remittance","Payment History"]}
      features={["Automatic contribution computation","RF-1 report generation","Electronic remittance file","Multi-employee processing","Contribution history"]}
      dataDisplayed={["Employee name and HDMF number","Monthly compensation","Employee share","Employer share","Remittance due date"]}
      userActions={["View contribution computations","Generate HDMF report","Export remittance file","Record payment","View remittance history"]}
    />
  )
}

