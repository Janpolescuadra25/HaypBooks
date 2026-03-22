'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Percentage Tax"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / VAT / Percentage Tax"
      badge="PH ONLY"
      purpose="Compute and file BIR percentage tax (2551Q) for non-VAT registered businesses. Track taxable gross receipts quarterly, compute the 3% tax, and generate the return for filing."
      components={[
        { name: "Quarterly Receipts Summary", description: "Total gross receipts for the quarter by income type" },
        { name: "2551Q Generator", description: "Auto-populate BIR Form 2551Q with quarterly receipts data" },
        { name: "Tax Computation", description: "Compute 3% percentage tax on gross receipts" },
        { name: "Filing History", description: "Past 2551Q filings with amounts and payment references" },
        { name: "eFPS Export", description: "Generate BIR-format file for eFPS submission" },
      ]}
      tabs={["Receipts","Form 2551Q","Filing History","Payment"]}
      features={["Gross receipts auto-aggregation","2551Q form generation","eFPS export","Payment tracking","Prior quarter comparison"]}
      dataDisplayed={["Quarterly gross receipts","Percentage tax rate (3%)","Tax due for the quarter","Filing deadline","Prior quarter comparison"]}
      userActions={["View quarterly receipts","Generate 2551Q form","Export for eFPS","Record payment","View filing history"]}
    />
  )
}

