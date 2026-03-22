'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ReconciliationHubPage() {
  return (
    <PageDocumentation
      title="Reconciliation Hub"
      module="ACCOUNTANT WORKSPACE"
      breadcrumb="Accountant Workspace / Reconciliation Hub"
      purpose="Centralized dashboard for tracking all account reconciliation tasks across banking, accounts receivable, accounts payable, and intercompany accounts."
      components={[
        { name: "Reconciliation Status Board", description: "Kanban-style view of all accounts grouped by reconciliation state" },
        { name: "Variance Summary", description: "Accounts with unresolved variances sorted by dollar amount" },
        { name: "Assigned Tasks", description: "Reconciliations assigned to specific team members with deadlines" },
        { name: "Sign-off Tracker", description: "Manager sign-off workflow for completed reconciliations" },
      ]}
      tabs={[
        "All Accounts",
        "Banking",
        "AR/AP",
        "Intercompany",
        "Completed",
      ]}
      features={[
        "Color-coded status indicators",
        "Auto-reconciliation matching",
        "Variance drill-down",
        "Bulk assignment to team members",
        "Manager review workflow",
      ]}
      dataDisplayed={[
        "Account name and type",
        "Last reconciliation date",
        "Outstanding variance amount",
        "Assigned accountant",
        "Completion percentage",
        "Sign-off status",
      ]}
      userActions={[
        "Start a reconciliation",
        "Assign reconciliation to team member",
        "Approve completed reconciliation",
        "Export reconciliation status report",
        "Add a variance note",
      ]}
    />
  )
}

