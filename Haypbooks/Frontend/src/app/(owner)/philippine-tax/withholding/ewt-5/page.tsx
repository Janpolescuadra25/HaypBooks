'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="EWT 5% - Other Services"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Withholding / EWT 5% on Other Services"
      badge="PH ONLY"
      purpose="Track expanded withholding tax at 5% on other specified services. Compute, document, and remit EWT with proper Forms 2307 and 1601-EQ filings."
      components={[
        { name: "Transaction Register", description: "Payments subject to 5% EWT with payee details and amounts" },
        { name: "EWT Computation", description: "Automatic 5% calculation on eligible service payments" },
        { name: "2307 Certificate", description: "Withholding tax certificates for each payee" },
        { name: "1601-EQ Summary", description: "Quarterly return data for 5% category" },
        { name: "Payee TIN Validator", description: "Validate payee TINs against BIR records" },
      ]}
      tabs={["Transactions","2307 Certificates","1601-EQ","Remittance"]}
      features={["5% EWT on specified services","2307 certificate generation","Payee TIN validation","Quarterly filing support","Remittance tracking"]}
      dataDisplayed={["Payee TIN and name","Payment amount","EWT at 5%","Quarter total","Certificate status"]}
      userActions={["View 5% EWT transactions","Generate 2307","Export quarterly summary","Record remittance","Validate payee TINs"]}
    />
  )
}

