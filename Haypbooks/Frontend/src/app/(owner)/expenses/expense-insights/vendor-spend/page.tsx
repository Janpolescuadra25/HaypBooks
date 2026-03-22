'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor Spend"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Insights / Vendor Spend"
      purpose="Vendor-level spend analysis showing per-vendor totals, YTD spend, payment terms adherence, and early payment discount opportunities. Consolidate vendor relationships."
      components={[
        { name: "Vendor Spend Table", description: "All vendors ranked by total spend with YTD amount and last payment date" },
        { name: "Vendor Detail Panel", description: "Spend trend chart and invoice history for a selected vendor" },
        { name: "Payment Terms Analysis", description: "How often payments are made early, on-time, or late per vendor" },
        { name: "Discount Opportunities", description: "Early payment discounts available with value estimate" },
      ]}
      tabs={["By Spend","By Payment Terms","Discounts","Trends"]}
      features={["Vendor spend ranking","YTD and historical spend","Payment terms adherence","Discount opportunity tracking","Vendor consolidation suggestions"]}
      dataDisplayed={["Vendor name and category","YTD spend amount","Invoice count","Average payment days","Available discount amount"]}
      userActions={["View vendor spend detail","Analyze payment terms adherence","Identify discount opportunities","Compare vendors","Export vendor spend"]}
    />
  )
}

