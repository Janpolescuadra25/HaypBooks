'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cash Flow Projection"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Cash Management / Cash Flow Projection"
      purpose="Extended cash flow projections covering 3 to 12 months. Plan for longer-term cash needs, seasonal patterns, and strategic investments using category-level inflow/outflow analysis."
      components={[
        { name: "Projection Timeline", description: "Monthly bar chart of projected inflows, outflows, and net cash" },
        { name: "Category Breakdown Table", description: "Inflows and outflows broken down by revenue/expense category per month" },
        { name: "Assumption Panel", description: "Configure growth rates, seasonality factors, and one-time items" },
        { name: "Deficit/Surplus Calendar", description: "Month-level calendar showing projected surplus or deficit months" },
        { name: "Scenario Manager", description: "Save and compare multiple projection scenarios" },
      ]}
      tabs={["Overview","Inflows","Outflows","Scenarios","Assumptions"]}
      features={["3-12 month projection horizon","Category-level granularity","Configurable assumptions","Scenario save and compare","Excel/PDF export"]}
      dataDisplayed={["Monthly projected inflows by category","Monthly projected outflows by category","Net cash per month","Cumulative cash position","Financing need estimate"]}
      userActions={["Configure projection period","Adjust assumptions and growth rates","Add one-time items","Compare scenarios","Export projection report"]}
    />
  )
}

