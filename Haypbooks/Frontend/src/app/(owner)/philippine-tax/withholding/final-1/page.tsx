'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Final WHT 1% - Rentals"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Withholding / Final WHT 1% on Rentals"
      badge="PH ONLY"
      purpose="Track and remit final withholding tax at 1% on rental income. Record rental payments, compute gross and net amounts, issue 2306 certificates to lessors, and file 1601-FQ."
      components={[
        { name: "Rental Payment Register", description: "All rental payments with lessor TIN and monthly amounts" },
        { name: "Final WHT Computation", description: "1% final WHT computed on gross rental amount" },
        { name: "2306 Certificate Generator", description: "Final withholding tax certificate for lessors" },
        { name: "1601-FQ Data", description: "Quarterly final WHT data for BIR Form 1601-FQ" },
        { name: "Lessor Directory", description: "All registered lessors with TIN and monthly rental amounts" },
      ]}
      tabs={["Payments","2306 Certificates","1601-FQ","Remittance"]}
      features={["1% final WHT on rentals","2306 certificate generation","1601-FQ support","Lessor TIN tracking","Payment remittance"]}
      dataDisplayed={["Lessor name and TIN","Monthly rental amount","Final WHT at 1%","Net rental paid","Quarter total"]}
      userActions={["Record rental payment","Generate 2306 certificate","Export 1601-FQ data","Record remittance","View filing history"]}
    />
  )
}

