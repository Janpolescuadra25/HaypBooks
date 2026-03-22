'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Withholding Tax"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Payroll Taxes / Withholding"
      badge="PH ONLY"
      purpose="Compute and track BIR withholding tax on compensation (1601-C) for all employees. Apply the TRAIN Law tax tables, generate monthly remittance reports, and monitor YTD amounts for year-end annualization."
      components={[
        { name: "Monthly Withholding Summary", description: "Total withholding tax for the current payroll period" },
        { name: "Per-Employee Computation", description: "Taxable income and withholding tax per employee" },
        { name: "TRAIN Tax Tables", description: "Current BIR income tax tables under the TRAIN Law" },
        { name: "1601-C Report", description: "Monthly remittance return data pre-populated from payroll" },
        { name: "YTD Tracker", description: "Running total of withholding per employee for year-end annualization" },
      ]}
      tabs={["Monthly Summary","Per Employee","1601-C","YTD","Year-End"]}
      features={["TRAIN Law tax table application","Monthly 1601-C generation","YTD tracking for annualization","Annex B alphalist","Non-taxable limit monitoring"]}
      dataDisplayed={["Employee name and TIN","Monthly taxable compensation","Monthly withholding tax","YTD withholding","Tax bracket applied"]}
      userActions={["View withholding computations","Generate 1601-C data","Run year-end annualization","View YTD summary","Export report"]}
    />
  )
}

