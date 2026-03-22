'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PeriodReconciliationsPage() {
  return (
    <PageDocumentation
      title="Period Reconciliations"
      module="ACCOUNTING — PERIOD CLOSE"
      breadcrumb="Accounting / Period Close / Reconciliations"
      purpose="Track and complete all account reconciliations required as part of the period-close checklist before the period can be locked."
      components={[
        { name: "Reconciliation Checklist", description: "All accounts requiring reconciliation with completion status" },
        { name: "Reconciliation Workpaper", description: "Inline reconciliation form for each account" },
        { name: "Variance Tracker", description: "Unresolved variances that block close" },
      ]}
      tabs={[
        "Checklist",
        "In Progress",
        "Completed",
        "Variances",
      ]}
      features={[
        "Checklist-driven workflow",
        "Auto-match from bank feed",
        "Variance escalation",
        "Reviewer sign-off requirement",
        "Historical reconciliation archive",
      ]}
      dataDisplayed={[
        "Account name and type",
        "Ledger balance",
        "Statement balance",
        "Variance amount",
        "Reconciliation status",
        "Reviewer sign-off",
      ]}
      userActions={[
        "Start a reconciliation",
        "Mark items as matched",
        "Resolve variance",
        "Submit reconciliation for review",
        "Sign off as complete",
      ]}
    />
  )
}

