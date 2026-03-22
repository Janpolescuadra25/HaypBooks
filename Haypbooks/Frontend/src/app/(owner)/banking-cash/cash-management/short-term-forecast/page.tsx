'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Short-Term Forecast"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Cash Management / Short-Term Forecast"
      purpose="Projected cash position for the next 7, 14, 30, and 90 days based on scheduled payments, expected customer receipts, recurring transactions, and historical patterns."
      components={[
        { name: "Forecast Summary Bar", description: "Projected opening/closing balance for selected forecast period" },
        { name: "Day-by-Day Projection Table", description: "Daily expected inflows and outflows with running balance" },
        { name: "Inflow Detail Panel", description: "Expected customer receipts from outstanding invoices and recurring income" },
        { name: "Outflow Detail Panel", description: "Scheduled bill payments, payroll, and recurring payments" },
        { name: "Scenario Comparison", description: "Compare optimistic, base, and pessimistic cash scenarios" },
      ]}
      tabs={["7 Days","14 Days","30 Days","90 Days","Scenarios"]}
      features={["7/14/30/90-day forecast horizons","Invoice due date-based inflows","Scheduled payment outflows","Scenario modeling","Shortfall alerts"]}
      dataDisplayed={["Opening balance date","Expected daily inflows by source","Expected daily outflows by type","Projected end-of-day balance","Shortfall warning days"]}
      userActions={["Select forecast period","View projection details","Adjust scenario assumptions","Export forecast to Excel","Set cash alert thresholds"]}
    />
  )
}

