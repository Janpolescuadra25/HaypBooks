'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PremiumManagementPage() {
  return (
    <PageDocumentation
      title="Premium Management"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Insurance / Premium Management"
      purpose="Track insurance premium payments for all asset insurance policies and allocate premium expense across accounting periods."
      components={[
        { name: "Premium Payment Log", description: "All premium payments with date, amount, and linked policy" },
        { name: "Prepaid Allocation Table", description: "Monthly allocation of prepaid premium across the policy period" },
        { name: "Payment Scheduler", description: "Upcoming premium due dates with reminder settings" },
      ]}
      tabs={[
        "Payment Log",
        "Prepaid Allocation",
        "Upcoming Payments",
      ]}
      features={[
        "Prepaid premium amortization",
        "Auto-GL entries for premium expense",
        "Upcoming payment reminders",
        "Multi-currency premiums",
        "Integration with bills module",
      ]}
      dataDisplayed={[
        "Policy premium amount",
        "Payment dates and amounts",
        "Prepaid balance",
        "Monthly allocation amounts",
        "GL account mapping",
      ]}
      userActions={[
        "Record premium payment",
        "View amortization schedule",
        "Link to a bill",
        "Set payment reminder",
        "Export premium report",
      ]}
    />
  )
}

