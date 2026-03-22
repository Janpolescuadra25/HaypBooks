'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 1601-CQ"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 1601-CQ"
      badge="PH ONLY"
      purpose="Generate, review, and file BIR Form 1601-CQ (Quarterly Remittance Return of Final Income Taxes Withheld). Automatically populated from Haypbooks withholding tax records."
      components={[
        { name: "Form Generator", description: "Auto-populate 1601-CQ with withholding data from the quarter" },
        { name: "Data Validation", description: "Check for missing TINs, incorrect rates, and computation errors" },
        { name: "Alphalist Attachment", description: "Generate the alphalist of payees required with the form" },
        { name: "eFPS / eBIRForms Export", description: "Export for submission via BIR eFPS or eBIRForms" },
        { name: "Payment Integration", description: "Record tax payment and link to the filed return" },
      ]}
      tabs={["Form Preview","Alphalist","Filing History","Payment"]}
      features={["Auto-population from withholding records","BIR eFPS export","Alphalist generation","Validation before filing","Payment tracking"]}
      dataDisplayed={["Withholding amount for quarter","Number of payees","Filing deadline","Tax due amount","Payment reference number"]}
      userActions={["Generate form","Review and validate data","Generate alphalist","Export for filing","Record payment"]}
    />
  )
}

