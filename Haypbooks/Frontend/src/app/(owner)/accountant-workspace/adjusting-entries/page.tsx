'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AdjustingEntriesPage() {
  return (
    <PageDocumentation
      title="Adjusting Entries"
      module="ACCOUNTANT WORKSPACE"
      breadcrumb="Accountant Workspace / Adjusting Entries"
      purpose="Create, review, and post period-end adjusting journal entries to ensure financial statements comply with accrual-basis accounting. Supports auto-reversal, recurring entry templates, and approval workflows."
      components={[
        { name: "Entry List", description: "Paginated list of all adjusting entries with status, amount, and period filters" },
        { name: "Entry Form", description: "Guided form for debit/credit lines, GL account picker, and memo fields" },
        { name: "Template Bank", description: "Library of pre-built templates for common adjustments (accruals, prepayments, depreciation)" },
        { name: "Reversal Scheduler", description: "Configure automatic reversal dates for each entry" },
      ]}
      tabs={[
        "All Entries",
        "Create New",
        "Templates",
        "Recurring",
        "History",
      ]}
      features={[
        "Auto-reversal scheduling",
        "Recurring entry templates",
        "Multi-line journal support",
        "Period lock enforcement",
        "Approval routing",
        "Audit trail with timestamps",
      ]}
      dataDisplayed={[
        "All adjusting entries for the current period",
        "Entry status (Draft / Pending Approval / Posted / Reversed)",
        "GL account pairs with debit/credit amounts",
        "Supporting document attachments",
        "Reversal dates and reversal entry links",
      ]}
      userActions={[
        "Create a new adjusting entry",
        "Post or reverse an entry",
        "Attach support documents",
        "Schedule auto-reversal",
        "Submit for approval",
        "Export entries to CSV",
      ]}
    />
  )
}

