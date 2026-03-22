'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Business Tax"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Local Taxes / Business Tax"
      badge="PH ONLY"
      purpose="Track and manage local government unit (LGU) business taxes. Compute tax based on gross sales/receipts, record quarterly payments, and maintain compliance documentation per city or municipality."
      components={[
        { name: "Tax Computation", description: "Compute business tax based on gross receipts and LGU tax rates" },
        { name: "Payment Schedule", description: "Quarterly LGU business tax payment due dates and amounts" },
        { name: "Payment Register", description: "All business tax payments made with receipt numbers" },
        { name: "Document Storage", description: "Official receipts and tax certificates per LGU" },
        { name: "Multi-Location Manager", description: "Track business tax per business location and LGU" },
      ]}
      tabs={["Tax Computation","Payment Schedule","Payments","Documents"]}
      features={["LGU-specific rate configuration","Gross receipts-based computation","Quarterly payment schedule","Multi-location support","Document management"]}
      dataDisplayed={["LGU name and location","Tax rate and basis","Quarterly tax amount","Payment due dates","YTD tax paid"]}
      userActions={["Configure LGU tax rates","Compute quarterly tax","Record payment","Upload receipt","View payment history"]}
    />
  )
}

