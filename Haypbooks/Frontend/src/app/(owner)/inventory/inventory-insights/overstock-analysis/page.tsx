'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Overstock Analysis"
      module="INVENTORY"
      breadcrumb="Inventory / Inventory Insights / Overstock Analysis"
      purpose="Identify inventory items that are overstocked relative to demand. Calculate excess quantity and carrying cost, and surface actionable suggestions to reduce overstock through promotions or returns."
      components={[
        { name: "Overstock Dashboard", description: "Items with stock exceeding demand forecast by more than X months" },
        { name: "Excess Quantity Chart", description: "Bar chart of excess stock in units and dollars by category" },
        { name: "Carrying Cost Calculator", description: "Estimated cost of holding excess inventory per item" },
        { name: "Action Recommendations", description: "Suggestions to sell, discount, return to vendor, or write down excess" },
        { name: "Trend Analysis", description: "How long each item has been overstocked" },
      ]}
      tabs={["Overstock Items","Carrying Costs","Actions","Trends"]}
      features={["Demand-based overstock detection","Carrying cost quantification","Action recommendations","Category-level rollup","Overstock aging"]}
      dataDisplayed={["Item name and category","Current stock vs. demand forecast","Excess quantity in units","Carrying cost per month","Weeks of supply"]}
      userActions={["View overstock items","Analyze carrying cost","Review action recommendations","Create discount promotion","Return to vendor"]}
    />
  )
}

