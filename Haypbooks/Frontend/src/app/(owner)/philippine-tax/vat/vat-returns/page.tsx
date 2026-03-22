'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="VAT Returns"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / VAT / VAT Returns"
      badge="PH ONLY"
      purpose="Prepare and file monthly or quarterly VAT returns (BIR Form 2550M/2550Q). Auto-populates from Haypbooks VAT transactions, validates data, and exports for BIR eFPS submission."
      components={[
        { name: "Return Period Selector", description: "Choose month or quarter for the VAT return" },
        { name: "Output VAT Summary", description: "Gross sales, zero-rated, VAT-exempt, and output VAT computation" },
        { name: "Input VAT Summary", description: "Allowable input VAT from purchases and importations" },
        { name: "VAT Payable/Refundable", description: "Net VAT due or refundable computation" },
        { name: "Form 2550M/Q Generator", description: "Auto-populate BIR form ready for review and submission" },
      ]}
      tabs={["Monthly (2550M)","Quarterly (2550Q)","Filing History","Payment"]}
      features={["Auto-population from transactions","Monthly 2550M and quarterly 2550Q","eFPS export","Zero-rated and exempt segregation","Input VAT carryover tracking"]}
      dataDisplayed={["Output VAT amount","Input VAT amount","Net VAT payable","Filing period and deadline","Prior period carryover"]}
      userActions={["Select return period","Review VAT data","Generate BIR form","Export for eFPS","Record payment","View filing history"]}
    />
  )
}

