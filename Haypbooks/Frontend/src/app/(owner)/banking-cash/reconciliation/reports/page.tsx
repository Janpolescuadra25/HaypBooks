'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Reconciliation Reports"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Reconciliation / Reports"
      purpose="Pre-built bank reconciliation reports including outstanding items list, reconciliation summary, and discrepancy detail. Essential for audit support and internal review."
      components={[
        { name: "Report Selector", description: "Choose from available reconciliation reports" },
        { name: "Outstanding Items Report", description: "Checks and deposits in transit not yet cleared" },
        { name: "Reconciliation Summary Report", description: "Proof of balance worksheet for selected account and period" },
        { name: "Discrepancy Report", description: "Transactions in GL but not on statement and vice versa" },
        { name: "Export Controls", description: "Download reports as PDF or Excel" },
      ]}
      tabs={["Outstanding Items","Summary","Discrepancies"]}
      features={["Outstanding checks and deposits in transit","Proof of balance worksheet","Discrepancy analysis","PDF and Excel export","As-of date flexibility"]}
      dataDisplayed={["Account name and period","Statement balance vs. book balance","Outstanding checks total","Deposits in transit total","Unexplained difference"]}
      userActions={["Select report type","Choose account and period","Generate report","Export to PDF or Excel","Email report"]}
    />
  )
}

