'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="EWT 10% - Professionals"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Withholding / EWT 10% on Professionals"
      badge="PH ONLY"
      purpose="Compute and track 10% expanded withholding tax on fees paid to self-employed professionals (doctors, lawyers, accountants). Issue Form 2307 certificates and file quarterly returns."
      components={[
        { name: "Professional Payment Register", description: "All professional fee payments subject to 10% EWT" },
        { name: "EWT Computation", description: "10% automatic computation on professional fee payments" },
        { name: "2307 Certificate Generator", description: "Withholding certificates for professionals" },
        { name: "1601-EQ Integration", description: "Quarterly 10% EWT data for form filing" },
        { name: "PRC Number Capture", description: "Optional professional license number capture per payee" },
      ]}
      tabs={["Transactions","2307 Certificates","1601-EQ","Remittance"]}
      features={["10% professional EWT","2307 generation","PRC reference tracking","Quarterly aggregation","Secure cert distribution"]}
      dataDisplayed={["Professional name and TIN","Fee paid amount","EWT at 10%","Quarter total","PRC license number"]}
      userActions={["View professional EWT transactions","Generate 2307","Export for 1601-EQ","Record remittance","Distribute certificates"]}
    />
  )
}

