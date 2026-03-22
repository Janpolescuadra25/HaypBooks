'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="VAT Transactions"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / VAT / VAT Transactions"
      badge="PH ONLY"
      purpose="Detailed register of all VAT-related transactions for the period. Review sales and purchase transactions with their VAT classification, amounts, and supplier/customer TIN for BIR compliance."
      components={[
        { name: "Sales Transactions", description: "All sales broken down by VAT type (VATable, zero-rated, VAT-exempt)" },
        { name: "Purchase Transactions", description: "All purchases with input VAT, supplier TIN, and invoice details" },
        { name: "VAT Code Lookup", description: "Reference list of all BIR VAT codes, rates, and applicability" },
        { name: "Transaction Search", description: "Search by date, TIN, amount, or invoice number" },
        { name: "Export for Alphalist", description: "Export BIR-compliant data for annual information returns" },
      ]}
      tabs={["Sales","Purchases","VAT Codes","Export"]}
      features={["Complete VAT transaction register","VAT type classification","TIN and invoice validation","Alphalist export","VAT code reference"]}
      dataDisplayed={["Transaction date and type","Gross amount","VAT amount and rate","VAT code","Customer/supplier TIN and name"]}
      userActions={["Review VAT transactions","Search and filter","Reclassify VAT type","Export transaction list","View VAT code descriptions"]}
    />
  )
}

