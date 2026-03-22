'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="EWT 2% - Services"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Withholding / EWT 2% on Professional Services"
      badge="PH ONLY"
      purpose="Manage creditable expanded withholding tax at 2% on professional services. Auto-compute EWT on eligible payments, issue Form 2307, and file quarterly reports."
      components={[
        { name: "Services Transaction Register", description: "Payments subject to 2% EWT for professional services" },
        { name: "EWT Computation", description: "Automatic 2% computation on eligible gross amounts" },
        { name: "2307 Generator", description: "Certificate of creditable withholding for service providers" },
        { name: "Quarterly Aggregation", description: "Aggregate monthly EWT for 1601-EQ quarterly filing" },
        { name: "Service Provider Directory", description: "Suppliers marked as professional service providers for auto-flagging" },
      ]}
      tabs={["Transactions","2307 Certificates","1601-EQ","Payments"]}
      features={["2% services EWT computation","2307 certificate generation","Quarterly aggregation","Service provider tagging","Audit trail"]}
      dataDisplayed={["Service provider TIN and name","Service amount","EWT amount (2%)","Period","Certificate issued status"]}
      userActions={["View services EWT transactions","Generate 2307","Export for 1601-EQ","Record remittance","View provider certificates"]}
    />
  )
}

