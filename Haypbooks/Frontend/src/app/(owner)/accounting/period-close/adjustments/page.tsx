'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PeriodCloseAdjustmentsPage() {
  return (
    <PageDocumentation
      title="Period Adjustments"
      module="ACCOUNTING — PERIOD CLOSE"
      breadcrumb="Accounting / Period Close / Adjustments"
      purpose="Record and review all period-end adjusting entries before locking the period, including accruals, deferrals, and reclassifications."
      components={[
        { name: "Adjustment List", description: "All adjusting entries for the current period" },
        { name: "Adjustment Form", description: "Create accrual, deferral, or reclassification entries" },
        { name: "Approval Queue", description: "Pending adjustments awaiting manager sign-off" },
      ]}
      tabs={[
        "All Adjustments",
        "Accruals",
        "Deferrals",
        "Reclassifications",
        "Approved",
      ]}
      features={[
        "Auto-reversal on next period open",
        "Template-based entry creation",
        "Approval workflow",
        "Bulk posting",
        "Impact preview on financial statements",
      ]}
      dataDisplayed={[
        "Adjustment type and description",
        "GL accounts affected",
        "Debit/credit amounts",
        "Approval status",
        "Impact on P&L and balance sheet",
      ]}
      userActions={[
        "Create an adjusting entry",
        "Submit for approval",
        "Post approved adjustments",
        "Preview financial statement impact",
        "Export adjustment list",
      ]}
    />
  )
}

