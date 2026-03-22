'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function GainLossDisposalReportPage() {
  return (
    <PageDocumentation
      title="Gain/Loss on Disposal"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Reports / Gain-Loss Disposal"
      purpose="Report all asset disposals for the period, showing sale proceeds, net book value at disposal, and resulting gain or loss."
      components={[
        { name: "Disposal Report Table", description: "One row per disposed asset with financial details" },
        { name: "Summary Cards", description: "Total gross gain, total gross loss, net gain/loss" },
        { name: "Period Filter", description: "Date range picker for disposal date" },
      ]}
      tabs={[
        "Disposal Report",
        "Gain Summary",
        "Loss Summary",
      ]}
      features={[
        "Net gain/loss calculation",
        "Category grouping",
        "Period filtering",
        "Export to CSV/PDF",
      ]}
      dataDisplayed={[
        "Asset name and disposal date",
        "NBV at disposal",
        "Sale proceeds",
        "Gain or loss amount",
        "Cumulative totals",
      ]}
      userActions={[
        "Filter by disposal date range",
        "Export report",
        "Drill into specific disposal",
        "Compare with prior period",
      ]}
    />
  )
}

