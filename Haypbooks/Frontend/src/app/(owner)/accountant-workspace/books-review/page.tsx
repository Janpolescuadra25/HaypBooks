'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function BooksReviewPage() {
  return (
    <PageDocumentation
      title="Books Review"
      module="ACCOUNTANT WORKSPACE"
      breadcrumb="Accountant Workspace / Books Review"
      purpose="Perform a structured end-of-period review of the company's books, flagging anomalies, uncategorized transactions, and potential errors before the period is closed."
      components={[
        { name: "Review Checklist", description: "Step-by-step checklist of review tasks with completion status" },
        { name: "Anomaly Feed", description: "Automatically detected outliers: duplicate entries, large variances, unusual accounts" },
        { name: "Uncategorized Transactions", description: "List of transactions missing proper category or class assignment" },
        { name: "Balance Verification", description: "Side-by-side comparison of ledger balances vs. expected values" },
      ]}
      tabs={[
        "Checklist",
        "Anomalies",
        "Uncategorized",
        "Balance Check",
        "Notes",
      ]}
      features={[
        "AI-powered anomaly detection",
        "Automated balance variance alerts",
        "Reviewer sign-off workflow",
        "Period comparison view",
        "Exportable review report",
      ]}
      dataDisplayed={[
        "Review task completion percentage",
        "Flagged transactions with reasons",
        "GL balance vs. prior period",
        "Reviewer comments and sign-off dates",
      ]}
      userActions={[
        "Complete review checklist items",
        "Investigate and resolve anomalies",
        "Categorize uncategorized transactions",
        "Add reviewer notes",
        "Sign off on books review",
        "Export review report",
      ]}
    />
  )
}

