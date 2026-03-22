'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Contractor Management"
      module="EXPENSES"
      breadcrumb="Expenses / Vendors / Contractor Management"
      purpose="Manage independent contractor relationships including contracts, payment rates, work orders, compliance documentation, and payment history for accurate cost tracking."
      components={[
        { name: "Contractor Directory", description: "All contractors with contact, rate, specialty, and contract status" },
        { name: "Contract Manager", description: "Upload and track contractor agreements with start/end dates" },
        { name: "Work Order Tracker", description: "Active work orders for each contractor with budgeted vs. actual costs" },
        { name: "Payment History", description: "All payments made to each contractor with dates and amounts" },
        { name: "Compliance Documents", description: "Insurance certificates, licenses, and tax forms per contractor" },
      ]}
      tabs={["Contractors","Contracts","Work Orders","Payments","Compliance"]}
      features={["Contractor profile management","Contract document storage","Work order cost tracking","1099 integration","Compliance document tracking with expiry alerts"]}
      dataDisplayed={["Contractor name and specialty","Hourly or project rate","Active contracts count","YTD payments","Compliance document expiry dates"]}
      userActions={["Add contractor","Upload contract","Create work order","Record payment","Request updated compliance docs"]}
    />
  )
}

