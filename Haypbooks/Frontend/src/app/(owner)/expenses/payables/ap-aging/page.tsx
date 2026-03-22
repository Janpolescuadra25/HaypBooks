'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="AP Aging"
      module="EXPENSES"
      breadcrumb="Expenses / Payables / AP Aging"
      purpose="Accounts payable aging report showing all outstanding bills categorized into current, 1–30, 31–60, 61–90, and 90+ day buckets. Prioritize bill payments to manage vendor relationships."
      components={[
        { name: "Aging Summary Table", description: "Total payables by aging bucket with all-vendor summary" },
        { name: "Vendor Aging Detail", description: "Each vendor's outstanding amount broken down by bucket" },
        { name: "Drill-down to Bills", description: "Click any bucket to see the individual bills in that range" },
        { name: "Filter Controls", description: "Filter by vendor, due date range, currency, and payment terms" },
      ]}
      tabs={["Summary","By Vendor","Detail","Export"]}
      features={["5-bucket aging classification","Vendor-level drill-down","As-of date flexibility","Multi-currency","Export to Excel/PDF"]}
      dataDisplayed={["Total AP by bucket","Per-vendor balance in each bucket","Due dates and bill references","Oldest bill date","Currency breakdown"]}
      userActions={["View aging summary","Drill into vendor bills","Schedule payment run","Export aging report","Filter by overdue"]}
    />
  )
}

