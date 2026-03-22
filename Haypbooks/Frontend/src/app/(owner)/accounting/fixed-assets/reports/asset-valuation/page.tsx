'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetValuationReportPage() {
  return (
    <PageDocumentation
      title="Asset Valuation Report"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Reports / Asset Valuation"
      purpose="Report showing current carrying values of all assets, comparing book value, fair value, and insurance replacement value."
      components={[
        { name: "Valuation Table", description: "Asset-by-asset valuation breakdown" },
        { name: "Category Roll-up Card", description: "Aggregate totals grouped by asset category" },
        { name: "Export Controls", description: "Download as PDF, CSV, or Excel" },
      ]}
      tabs={[
        "By Asset",
        "By Category",
        "By Location",
      ]}
      features={[
        "Fair value vs. book value comparison",
        "Insurance value column",
        "As-of-date filtering",
        "Print-ready report",
      ]}
      dataDisplayed={[
        "Asset name and category",
        "Acquisition cost",
        "Accumulated depreciation",
        "Net book value",
        "Fair value (if entered)",
        "Insurance replacement value",
      ]}
      userActions={[
        "Select as-of date",
        "Filter by category or location",
        "Export valuation report",
        "Print report",
      ]}
    />
  )
}

