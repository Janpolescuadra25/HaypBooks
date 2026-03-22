'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="1099 Management"
      module="EXPENSES"
      breadcrumb="Expenses / Vendors / 1099 Management"
      badge="US ONLY"
      purpose="Manage 1099 reporting for eligible US vendors. Track payments subject to 1099 reporting thresholds, collect W-9 information, generate 1099-NEC and 1099-MISC forms, and file electronically."
      components={[
        { name: "1099 Vendor List", description: "Vendors flagged as 1099-eligible with TIN and YTD payment amounts" },
        { name: "Payment Tracker", description: "Track payments subject to 1099 reporting by vendor and category" },
        { name: "W-9 Collection", description: "Send W-9 requests to vendors and store completed forms" },
        { name: "1099 Form Generator", description: "Generate 1099-NEC and 1099-MISC forms for all eligible vendors" },
        { name: "E-File Submission", description: "Submit 1099 data to IRS via e-file and generate Copy B PDFs" },
      ]}
      tabs={["Vendors","Payments","W-9s","Forms","E-File"]}
      features={["Automatic 1099 threshold tracking","W-9 collection workflow","1099-NEC and MISC support","IRS electronic filing","Copy B PDF generation"]}
      dataDisplayed={["Vendor TIN and address","YTD payments by 1099 box","W-9 status","1099 form generated status","E-file submission status"]}
      userActions={["Flag vendor as 1099-eligible","Send W-9 request","Review payment amounts","Generate 1099 forms","File 1099s electronically"]}
    />
  )
}

