'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Mileage Log"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Capture / Mileage"
      purpose="Record business mileage for reimbursement. Enter trip details manually or use GPS calculation. Automatically computes the reimbursable amount based on the current IRS or company rate."
      components={[
        { name: "Mileage Entry Form", description: "Log date, vehicle, business purpose, start/end address or GPS, and distance" },
        { name: "Mileage Log Table", description: "All recorded trips with date, distance, and reimbursable amount" },
        { name: "Rate Settings", description: "Configure reimbursement rate (IRS standard or custom company rate)" },
        { name: "Map Integration", description: "Optional GPS-based distance calculation between two addresses" },
        { name: "Add to Expense Report", description: "Include mileage entries in an expense report for approval" },
      ]}
      tabs={["My Trips","Submit for Reimbursement","History","Settings"]}
      features={["Manual and GPS distance entry","IRS standard rate auto-calculation","Custom reimbursement rates","Expense report integration","Monthly mileage summaries"]}
      dataDisplayed={["Trip date and vehicle","Start and end location","Distance (miles or km)","Reimbursable amount","Business purpose"]}
      userActions={["Record mileage trip","Calculate route distance","Add to expense report","View mileage summary","Export mileage log"]}
    />
  )
}

