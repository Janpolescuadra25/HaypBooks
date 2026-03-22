'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DepreciationSummaryReportPage() {
  return (
    <PageDocumentation
      title="Depreciation Summary"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Reports / Depreciation Summary"
      purpose="Period-level summary report of total depreciation expense by asset category, GL account, and department."
      components={[
        { name: "Summary Table", description: "Depreciation expense grouped by category and period" },
        { name: "Period Selector", description: "Monthly, quarterly, or annual summary" },
        { name: "Chart View", description: "Bar chart of depreciation by category" },
      ]}
      tabs={[
        "By Category",
        "By Department",
        "By Period",
      ]}
      features={[
        "Prior period comparison",
        "Category and department grouping",
        "Chart and table toggle",
        "Export to Excel/PDF",
      ]}
      dataDisplayed={[
        "Total depreciation by category",
        "Depreciation by department/cost center",
        "Period-over-period change",
        "GL account breakdown",
      ]}
      userActions={[
        "Select period",
        "Change grouping",
        "Export summary",
        "View chart",
        "Drill into a category",
      ]}
    />
  )
}

