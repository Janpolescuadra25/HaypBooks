'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Contractor Management (HR)"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Workforce / Contractor Management"
      purpose="Maintain profiles for independent contractors engaged for project work. Track contract terms, pay rates, hours worked, and ensure proper tax documentation for non-employee workers."
      components={[
        { name: "Contractor Profiles", description: "All contractors with contact info, specialty, and engagement status" },
        { name: "Contract Records", description: "Uploaded contracts with start/end dates and rate agreements" },
        { name: "Time and Billing", description: "Hours worked and invoices received per contractor" },
        { name: "Tax Documentation", description: "W-9 or TIN collection and 1099 readiness tracking" },
        { name: "Expense Tracking", description: "Reimbursable expenses submitted by contractors" },
      ]}
      tabs={["Active Contractors","Ended","Documents","Payments"]}
      features={["Contractor profile management","Contract document storage","Hours and billing tracking","Tax doc collection","Project assignment"]}
      dataDisplayed={["Contractor name and type","Engagement start and end dates","Hourly or project rate","Hours worked this period","Total paid YTD"]}
      userActions={["Add contractor profile","Upload contract","Log hours or invoice","Collect W-9","Close engagement"]}
    />
  )
}

