'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetMaintenancePage() {
  return (
    <PageDocumentation
      title="Maintenance"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Lifecycle / Maintenance"
      purpose="Track scheduled and unscheduled maintenance events for fixed assets, distinguishing between capitalizable improvements and expense-period repairs."
      components={[
        { name: "Maintenance Log", description: "All maintenance records per asset with cost and type" },
        { name: "Maintenance Schedule", description: "Calendar view of planned maintenance tasks" },
        { name: "Cost Capitalization Review", description: "Flag maintenance costs that meet capitalization thresholds" },
      ]}
      tabs={[
        "Maintenance Log",
        "Schedule",
        "Expenses vs. Capitalize",
      ]}
      features={[
        "Capitalization threshold rules",
        "Maintenance cost allocation",
        "Vendor maintenance contracts",
        "Scheduled maintenance reminders",
        "Integration with expenses module",
      ]}
      dataDisplayed={[
        "Asset name",
        "Maintenance date and type",
        "Cost incurred",
        "Vendor or technician",
        "Capitalized vs. expensed determination",
      ]}
      userActions={[
        "Log a maintenance event",
        "Schedule future maintenance",
        "Capitalize a maintenance cost",
        "Add vendor contract",
        "Export maintenance history",
      ]}
    />
  )
}

