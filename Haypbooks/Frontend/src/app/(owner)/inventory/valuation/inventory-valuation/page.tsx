'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Inventory Valuation"
      module="INVENTORY"
      breadcrumb="Inventory / Valuation / Inventory Valuation"
      purpose="View the total value of on-hand inventory at any point in time using your configured costing method (FIFO, LIFO, Weighted Average). Essential for balance sheet and audit purposes."
      components={[
        { name: "Valuation Summary", description: "Total inventory value with breakdown by category and warehouse" },
        { name: "Item Valuation Table", description: "Per-item on-hand quantity and value at current cost" },
        { name: "Costing Method Indicator", description: "Shows the active costing method (FIFO/LIFO/Average) for each item" },
        { name: "As-of Date Selector", description: "View historical valuation at any past date" },
        { name: "Valuation Report", description: "Printable inventory valuation report for audit support" },
      ]}
      tabs={["Current Valuation","By Category","By Warehouse","Historical","Export"]}
      features={["FIFO, LIFO, and Weighted Average support","As-of date historical view","Category and warehouse breakdown","Balance sheet reconciliation","PDF report"]}
      dataDisplayed={["Item name and on-hand quantity","Unit cost and costing method","Total item value","Category total value","Total inventory value"]}
      userActions={["View current valuation","Select historical date","Filter by category or warehouse","Export valuation report","Reconcile to GL balance"]}
    />
  )
}

