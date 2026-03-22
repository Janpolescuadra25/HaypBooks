'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="EWT 1% - Goods"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Withholding / EWT 1% on Purchases of Goods"
      badge="PH ONLY"
      purpose="Track creditable withholding tax at 1% on purchases of goods from regular suppliers. Compute monthly EWT, generate 2307 certificates for suppliers, and file BIR Form 1601-EQ."
      components={[
        { name: "Transaction Register", description: "All purchases subject to 1% EWT with supplier TIN and amounts" },
        { name: "Monthly EWT Summary", description: "Total 1% withholding for the month per supplier" },
        { name: "2307 Certificate Generator", description: "Generate Certificate of Creditable Withholding for each supplier" },
        { name: "1601-EQ Data", description: "Quarterly return data aggregated from monthly EWT" },
        { name: "Payment Tracking", description: "Record EWT remittance payments to BIR" },
      ]}
      tabs={["Transactions","2307 Certificates","1601-EQ","Payments"]}
      features={["1% goods EWT computation","BIR Form 2307 generation","1601-EQ data aggregation","Supplier TIN validation","Remittance tracking"]}
      dataDisplayed={["Supplier name and TIN","Purchase amount subject to EWT","1% withholding amount","Quarter total","Payment reference"]}
      userActions={["View EWT transactions","Generate 2307 certificates","Export 1601-EQ data","Record payment","Distribute to suppliers"]}
    />
  )
}

