'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DepreciationReportsPage() {
  return (
    <PageDocumentation
      title="Depreciation Reports"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Depreciation / Reports"
      purpose="Generate standard and custom depreciation reports for tax filing, financial statement preparation, and management review."
      components={[
        { name: "Report Selector", description: "Dropdown of available report types (schedule, summary, projection)" },
        { name: "Period Picker", description: "Select fiscal year or custom date range" },
        { name: "Report Viewer", description: "Rendered tabular report with category and asset groupings" },
        { name: "Export Controls", description: "Download as PDF, CSV, or Excel" },
      ]}
      tabs={[
        "Depreciation Schedule",
        "Annual Summary",
        "Tax Depreciation",
        "Projection",
      ]}
      features={[
        "Book vs. tax depreciation comparison",
        "Category-level roll-up",
        "Asset-level drill-down",
        "Prior period comparison",
        "Scheduled report delivery via email",
      ]}
      dataDisplayed={[
        "Asset name and category",
        "Opening NBV",
        "Depreciation charge for period",
        "Closing NBV",
        "Accumulated depreciation",
        "Disposal gains/losses",
      ]}
      userActions={[
        "Select report type and period",
        "Filter by category or location",
        "Export report",
        "Schedule automated delivery",
        "Print report",
      ]}
    />
  )
}

