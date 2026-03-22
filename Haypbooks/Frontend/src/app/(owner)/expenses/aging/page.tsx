'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Expenses Aging"
      module="EXPENSES"
      breadcrumb="Expenses / Aging"
      purpose="Accounts payable aging overview showing amounts owed to vendors across current, 1–30, 31–60, 61–90, and 90+ day buckets. Identify overdue balances and prioritize payments."
      components={[
        { name: "AP Aging Summary", description: "Total balances for each aging bucket across all vendors" },
        { name: "Vendor Detail Table", description: "Per-vendor breakdown of balances in each aging bucket" },
        { name: "Aging Chart", description: "Bar chart comparing AP balance distribution across age groups" },
        { name: "Filter Controls", description: "Filter by vendor, currency, and as-of date" },
      ]}
      tabs={["Summary","By Vendor","By Currency"]}
      features={["Current and overdue breakdown","Per-vendor detail","As-of date flexibility","Export to Excel","Drill-down to bills"]}
      dataDisplayed={["Total AP balance","Balance by aging bucket (current, 1-30, 31-60, 61-90, 90+)","Vendor names","Overdue balance amount","Oldest outstanding bill date"]}
      userActions={["View aging summary","Drill into vendor detail","Export aging report","Schedule payment run","Filter by vendor"]}
    />
  )
}

