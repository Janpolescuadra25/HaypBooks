'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stop Payments"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Checks / Stop Payments"
      purpose="Issue stop payment instructions for outstanding checks that should not be cashed. Record bank confirmation numbers, track stop payment fees, and void the check in the accounting records."
      components={[
        { name: "Outstanding Checks List", description: "All outstanding checks eligible for a stop payment" },
        { name: "Stop Payment Form", description: "Record stop payment issued: check number, bank confirmation, fee" },
        { name: "Void Confirmation", description: "Auto-void the check and reverse the accounting entry" },
        { name: "Cost Tracking", description: "Track bank fees charged for each stop payment" },
        { name: "History Log", description: "All stop payments issued with dates and outcomes" },
      ]}
      tabs={["Issue Stop Payment","History"]}
      features={["One-click stop payment workflow","Bank confirmation number recording","Auto-void with GL reversal","Fee tracking","Replacement check prompt"]}
      dataDisplayed={["Check number and payee","Issue date and amount","Stop payment date","Bank confirmation number","Fee charged"]}
      userActions={["Issue stop payment","Record bank confirmation","Void check with GL reversal","Issue replacement check","View stop payment history"]}
    />
  )
}

