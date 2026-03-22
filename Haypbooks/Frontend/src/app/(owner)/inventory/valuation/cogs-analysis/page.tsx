'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="COGS Analysis"
      module="INVENTORY"
      breadcrumb="Inventory / Valuation / COGS Analysis"
      purpose="Analyze cost of goods sold by item, category, and period. Understand gross margin drivers, compare COGS to revenue, and identify products with shrinking margins."
      components={[
        { name: "COGS Dashboard", description: "Total COGS for period with comparison to prior period and budget" },
        { name: "COGS by Item", description: "Per-item COGS with gross margin % and trending" },
        { name: "COGS by Category", description: "Category-level COGS rollup with margin comparison" },
        { name: "COGS Breakdown", description: "Split COGS into material, labor, and overhead components" },
        { name: "Margin Trend", description: "Gross margin percentage trend over rolling 12 months" },
      ]}
      tabs={["Overview","By Item","By Category","Trends","Margin Analysis"]}
      features={["Period and item-level COGS","Gross margin % calculation","COGS component breakdown","Budget comparison","Trend analysis"]}
      dataDisplayed={["Total COGS for period","Revenue and gross margin","COGS by item and category","Trend vs. prior period","Top COGS items"]}
      userActions={["View COGS dashboard","Drill into item-level cost","Analyze margin trend","Compare to budget","Export COGS report"]}
    />
  )
}

