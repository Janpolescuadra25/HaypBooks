'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Final WHT 5% - Non-Residents"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Withholding / Final WHT 5% on Non-Residents"
      badge="PH ONLY"
      purpose="Compute and remit final withholding tax on payments to non-resident foreign corporations. Apply treaty rates where applicable, issue withholding certificates, and file quarterly returns."
      components={[
        { name: "Non-Resident Payment Register", description: "Payments to non-residents subject to final WHT" },
        { name: "Treaty Rate Lookup", description: "Tax treaty rates for applicable countries to reduce withholding" },
        { name: "WHT Computation", description: "Final WHT at 5% or treaty rate on covered payments" },
        { name: "2306 Certificate", description: "Final withholding certificate for non-resident payees" },
        { name: "1601-FQ Integration", description: "Quarterly final WHT return data for non-resident payments" },
      ]}
      tabs={["Payments","Treaty Rates","2306 Certificates","1601-FQ","Remittance"]}
      features={["Non-resident withholding tax","Tax treaty rate application","2306 certificate generation","1601-FQ support","Remittance tracking"]}
      dataDisplayed={["Non-resident payee name and country","Payment type","Applicable tax rate","WHT amount","Treaty exemption if applicable"]}
      userActions={["Record non-resident payment","Apply treaty rate","Generate 2306","Export 1601-FQ data","Record remittance"]}
    />
  )
}

