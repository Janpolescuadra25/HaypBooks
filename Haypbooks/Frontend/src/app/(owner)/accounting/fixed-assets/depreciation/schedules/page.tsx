'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DepreciationSchedulesPage() {
  return (
    <PageDocumentation
      title="Depreciation Schedules"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Depreciation / Schedules"
      purpose="View and manage the depreciation schedule for every fixed asset, showing the full life-of-asset monthly charge plan."
      components={[
        { name: "Schedule Table", description: "Month-by-month charge amounts for each asset from acquisition to full depreciation" },
        { name: "Asset Selector", description: "Search and select a specific asset to view its schedule" },
        { name: "Schedule Chart", description: "Line chart of NBV over time with depreciation charges" },
        { name: "Bulk Export", description: "Export all schedules to a single Excel workbook" },
      ]}
      tabs={[
        "All Schedules",
        "By Asset",
        "By Category",
      ]}
      features={[
        "Life-of-asset projection",
        "Schedule amendment for useful life changes",
        "Catch-up depreciation calculation",
        "Print-ready format",
        "Integration with period-close checklist",
      ]}
      dataDisplayed={[
        "Asset name and category",
        "Period (month/year)",
        "Opening NBV",
        "Depreciation charge",
        "Closing NBV",
        "Accumulated depreciation to date",
      ]}
      userActions={[
        "View schedule for a specific asset",
        "Amend useful life or method",
        "Export schedules",
        "Compare book vs. tax schedule",
        "Print asset schedule",
      ]}
    />
  )
}

