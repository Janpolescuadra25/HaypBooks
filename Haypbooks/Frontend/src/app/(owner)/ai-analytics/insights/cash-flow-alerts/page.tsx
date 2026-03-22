'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CashFlowAlertsPage() {
  return (
    <PageDocumentation
      title="Cash Flow Alerts"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Insights / Cash Flow Alerts"
      purpose="AI-generated real-time alerts for cash flow events including projected shortfalls, unusual outflows, and collection delays."
      components={[
        { name: "Alert Feed", description: "Chronological list of cash flow alerts with severity" },
        { name: "Alert Detail", description: "Root cause analysis and recommended action per alert" },
        { name: "Alert Configuration", description: "Set thresholds and alert types" },
      ]}
      tabs={[
        "Active Alerts",
        "Resolved",
        "Configuration",
      ]}
      features={[
        "AI-powered shortfall prediction",
        "Severity tiers (critical/warning/info)",
        "One-click recommended action",
        "Email/SMS notifications",
        "Snooze and dismiss",
      ]}
      dataDisplayed={[
        "Alert type and severity",
        "Projected cash balance",
        "Triggering event or trend",
        "Recommended action",
        "Alert creation timestamp",
      ]}
      userActions={[
        "Acknowledge an alert",
        "Take recommended action",
        "Dismiss false positive",
        "Configure alert threshold",
        "Export alert history",
      ]}
    />
  )
}

