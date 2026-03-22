'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Tax Withholding"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Taxes / Tax Withholding"
      purpose="Configure and review employee income tax withholding. Set up tax tables, review withholding computations per employee, and ensure compliance with withholding tax regulations."
      components={[
        { name: "Tax Table Setup", description: "Configure income tax brackets and withholding rates by jurisdiction" },
        { name: "Per-Employee Withholding", description: "Computed withholding tax per employee for the current period" },
        { name: "YTD Summary", description: "Year-to-date withholding per employee for annual reconciliation" },
        { name: "Exemption Configuration", description: "Set up tax exemption certificates and their effective periods" },
        { name: "Annualized Computation", description: "Year-end annualization to ensure accurate final withholding" },
      ]}
      tabs={["Setup","Current Period","YTD Summary","Year-End"]}
      features={["Income tax bracket tables","Automated withholding computation","Exemption management","YTD tracking","Year-end annualization"]}
      dataDisplayed={["Employee name and tax status","Gross taxable income","Withholding tax this period","YTD withholding","Exemption status"]}
      userActions={["View withholding per employee","Update tax exemptions","Run annualization","Generate BIR 2316 / tax cert","View withholding history"]}
    />
  )
}

