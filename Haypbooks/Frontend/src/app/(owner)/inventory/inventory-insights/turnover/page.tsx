'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Inventory Turnover"
      module="INVENTORY"
      breadcrumb="Inventory / Inventory Insights / Turnover"
      purpose="Measure how efficiently inventory is sold and replenished. Track turnover ratio, days inventory outstanding (DIO), and identify items with unusually high or low turnover rates."
      components={[
        { name: "Turnover Dashboard", description: "Overall inventory turnover ratio and DIO for the period" },
        { name: "Item Turnover Table", description: "Per-item turnover ratio, DIO, and movement classification" },
        { name: "Category Comparison", description: "Turnover benchmarks comparing categories against each other" },
        { name: "Trend Chart", description: "Turnover ratio trend over rolling 12 months" },
        { name: "ABC Classification", description: "Classify inventory as A (high turn), B (medium), C (low turn)" },
      ]}
      tabs={["Overview","By Item","By Category","ABC Analysis","Trends"]}
      features={["Turnover ratio and DIO calculation","Per-item and category breakdown","ABC classification","12-month trend","Benchmark comparison"]}
      dataDisplayed={["Inventory turnover ratio","Days inventory outstanding","COGS for period","Average inventory value","Item-level turnover rank"]}
      userActions={["View turnover dashboard","Drill into category","Export turnover report","Review ABC classification","Compare to prior period"]}
    />
  )
}

