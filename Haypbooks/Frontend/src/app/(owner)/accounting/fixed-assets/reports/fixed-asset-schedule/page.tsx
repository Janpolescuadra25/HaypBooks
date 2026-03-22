'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function FixedAssetScheduleReportPage() {
  return (
    <PageDocumentation
      title="Fixed Asset Schedule"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Reports / Fixed Asset Schedule"
      purpose="The standard roll-forward schedule showing opening balance, additions, disposals, depreciation, and closing balance for each asset category."
      components={[
        { name: "Schedule Table", description: "Roll-forward columns: Opening NBV, Additions, Disposals, Depreciation, Closing NBV" },
        { name: "Category Grouping", description: "Collapsible rows per asset category" },
        { name: "Period Selector", description: "Fiscal year selector" },
      ]}
      tabs={[
        "Current Year",
        "Prior Year",
        "Custom Period",
      ]}
      features={[
        "Full roll-forward format",
        "IFRS and GAAP compliant",
        "PDF export",
        "Comparative periods",
        "Audit-ready format",
      ]}
      dataDisplayed={[
        "Opening NBV by category",
        "Additions during period",
        "Disposals (cost and depreciation)",
        "Depreciation charge",
        "Closing NBV",
      ]}
      userActions={[
        "Select fiscal year",
        "Toggle comparative period",
        "Export to PDF/Excel",
        "Print schedule",
      ]}
    />
  )
}

