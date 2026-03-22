'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Real Property Tax"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Local Taxes / Real Property Tax"
      badge="PH ONLY"
      purpose="Track and manage real property tax (RPT) obligations for all company-owned real estate. Monitor quarterly deadlines, record payments, and store official receipts."
      components={[
        { name: "Property Register", description: "All real properties with location, assessed value, and tax due" },
        { name: "Payment Schedule", description: "Annual and quarterly RPT payment deadlines per property" },
        { name: "Payment Register", description: "RPT payments made with official receipt numbers" },
        { name: "Tax Declaration Copies", description: "Uploaded tax declarations and prior official receipts" },
        { name: "Discount Tracker", description: "Early payment discounts available per property" },
      ]}
      tabs={["Properties","Payment Schedule","Payments","Documents"]}
      features={["Multi-property RPT tracking","Quarterly deadline reminders","Early payment discount tracking","Document storage","GL expense integration"]}
      dataDisplayed={["Property description and location","Assessed value and tax rate","Annual RPT amount","Quarterly installment due","Payment status"]}
      userActions={["Add property","Record RPT payment","Upload official receipt","Track early payment discount","View payment history"]}
    />
  )
}

