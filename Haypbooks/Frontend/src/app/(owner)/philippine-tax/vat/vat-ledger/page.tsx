'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="VAT Ledger"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / VAT / VAT Ledger"
      badge="PH ONLY"
      purpose="Subsidiary ledger of all VAT transactions for output and input VAT. Supports BIR VAT audit requirements with complete transaction-level VAT detail, TIN of customers and suppliers, and invoice numbers."
      components={[
        { name: "Output VAT Ledger", description: "All sales transactions with VAT collected, customer TIN, and invoice number" },
        { name: "Input VAT Ledger", description: "All purchases with input VAT, supplier TIN, and invoice number" },
        { name: "Summary by Period", description: "Monthly and quarterly totals for each VAT category" },
        { name: "Advanced Filter", description: "Filter by transaction date, TIN, invoice number, and VAT code" },
        { name: "BIR Audit Export", description: "Export ledger in BIR-required format" },
      ]}
      tabs={["Output VAT","Input VAT","Summary","Audit Export"]}
      features={["Complete VAT subsidiary ledger","TIN and invoice tracking","BIR audit-ready export","Period summary","VAT code analysis"]}
      dataDisplayed={["Transaction date and type","Customer or supplier TIN","Invoice number","Amount and VAT amount","VAT code and rate"]}
      userActions={["Search ledger by period","Filter by TIN or invoice","Export for BIR audit","View VAT summary","Reconcile to VAT return"]}
    />
  )
}

