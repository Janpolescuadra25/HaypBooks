'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Spend Analysis"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Insights / Spend Analysis"
      purpose="Comprehensive spend analytics showing total expenditures by category, department, vendor, and period. Identify cost trends, budget variances, and savings opportunities."
      components={[
        { name: "Spend Summary Dashboard", description: "High-level KPIs: total spend, YoY change, top category, top vendor" },
        { name: "Category Spend Chart", description: "Visual breakdown of spend by expense category with trend" },
        { name: "Department Heat Map", description: "Relative spend intensity by department over time" },
        { name: "Vendor Concentration", description: "Share of spend by vendor to identify concentration risk" },
        { name: "Period Comparison", description: "Current period vs. prior period vs. budget side by side" },
      ]}
      tabs={["Overview","By Category","By Department","By Vendor","Trends"]}
      features={["Multi-dimension analysis (category/dept/vendor)","YoY and period comparison","Budget variance integration","Drill-down to transactions","Excel export"]}
      dataDisplayed={["Total spend for period","Category breakdown and % of total","Department spend totals","Top 10 vendors by amount","Budget vs. actual variance"]}
      userActions={["View spend by category","Drill into department detail","Compare periods","View vendor breakdown","Export spend report"]}
    />
  )
}

