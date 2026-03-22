'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function LockPeriodPage() {
  return (
    <PageDocumentation
      title="Lock Period"
      module="ACCOUNTING — PERIOD CLOSE"
      breadcrumb="Accounting / Period Close / Lock Period"
      purpose="Lock a completed accounting period to prevent any further posting of transactions, protecting the integrity of finalized financial statements."
      components={[
        { name: "Period Status Board", description: "All periods with open/locked/archived status" },
        { name: "Lock Wizard", description: "Step-by-step confirmation flow to lock a period" },
        { name: "Override Controls", description: "Admin-level controls to temporarily unlock a period for corrections" },
      ]}
      tabs={[
        "Period Status",
        "Lock Period",
        "Override History",
      ]}
      features={[
        "Pre-lock checklist validation",
        "Selective lock by transaction type",
        "Override with audit log",
        "Email notification to team on lock",
        "Integration with reconciliation hub",
      ]}
      dataDisplayed={[
        "Period name and current status",
        "Outstanding items blocking lock",
        "Checklist completion percentage",
        "Lock date and locked-by user",
        "Override history",
      ]}
      userActions={[
        "Run pre-lock checklist",
        "Lock a period",
        "Temporarily unlock for corrections",
        "View override history",
        "Notify team of period lock",
      ]}
    />
  )
}

