'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Check Register"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Checks / Check Register"
      purpose="Complete log of all checks issued, voided, and outstanding. Track check numbers, payees, amounts, issue dates, and clearance status against the bank statement."
      components={[
        { name: "Check Register Table", description: "All checks with number, payee, amount, date, and status" },
        { name: "Status Filter", description: "Filter by outstanding, cleared, voided, or stopped checks" },
        { name: "Check Detail Panel", description: "Full details for a selected check including GL posting" },
        { name: "Void Controls", description: "Void an outstanding check and reverse the associated entry" },
        { name: "Reconciliation Markers", description: "Mark checks as cleared during bank reconciliation" },
      ]}
      tabs={["All Checks","Outstanding","Cleared","Voided"]}
      features={["Check number sequencing","Status tracking (outstanding/cleared/voided)","Void with GL reversal","Bank reconciliation integration","Export to CSV"]}
      dataDisplayed={["Check number and MICR line","Payee name","Issue date and amount","Cleared date","Status badge"]}
      userActions={["View check details","Void check","Mark check cleared","Print check register","Export check register"]}
    />
  )
}

