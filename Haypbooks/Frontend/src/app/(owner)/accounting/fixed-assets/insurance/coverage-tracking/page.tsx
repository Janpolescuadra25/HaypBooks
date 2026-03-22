'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CoverageTrackingPage() {
  return (
    <PageDocumentation
      title="Coverage Tracking"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Insurance / Coverage Tracking"
      purpose="Monitor the insurance coverage status across all fixed assets, identifying under-insured or uninsured assets."
      components={[
        { name: "Coverage Matrix", description: "Asset-level view showing insured value vs. replacement value" },
        { name: "Gap Analysis Chart", description: "Visual chart of coverage gaps by asset category" },
        { name: "Expiry Timeline", description: "Gantt-style view of policy expiry dates" },
      ]}
      tabs={[
        "Coverage Overview",
        "Gap Analysis",
        "Expiry Timeline",
      ]}
      features={[
        "Under-coverage alerts",
        "Replacement value vs. insured comparison",
        "Category-level roll-up",
        "Export coverage report",
      ]}
      dataDisplayed={[
        "Asset name and category",
        "Replacement cost",
        "Insured value",
        "Coverage gap",
        "Policy expiry date",
      ]}
      userActions={[
        "View coverage for specific asset",
        "Identify coverage gaps",
        "Update insured value",
        "Export coverage report",
      ]}
    />
  )
}

