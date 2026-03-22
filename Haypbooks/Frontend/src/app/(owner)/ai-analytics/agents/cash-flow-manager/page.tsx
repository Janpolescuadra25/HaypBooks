'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CashFlowManagerAgentPage() {
  return (
    <PageDocumentation
      title="Cash Flow Manager Agent"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Agents / Cash Flow Manager"
      purpose="An AI-powered autonomous agent that monitors cash flow, projects future balances, surfaces liquidity risks, and recommends actions to optimize working capital."
      components={[
        { name: "Cash Flow Dashboard", description: "Real-time overview of inflows, outflows, and projected balance" },
        { name: "Alert Feed", description: "AI-generated alerts for upcoming cash shortfalls or surplus opportunities" },
        { name: "Action Recommendations", description: "Prioritized list of AI-recommended actions with one-click execution" },
        { name: "Configuration Panel", description: "Set alert thresholds, connected accounts, and agent behavior" },
      ]}
      tabs={[
        "Dashboard",
        "Alerts",
        "Recommendations",
        "Configuration",
        "History",
      ]}
      features={[
        "30/60/90-day cash forecast",
        "Payable and receivable timing optimization",
        "Low-balance alerts",
        "Automated sweep recommendations",
        "Learning from historical patterns",
      ]}
      dataDisplayed={[
        "Current cash position",
        "Projected balances by date",
        "Upcoming payables and receivables",
        "AI-generated alert reasons",
        "Recommendation confidence scores",
      ]}
      userActions={[
        "Acknowledge an alert",
        "Accept or reject a recommendation",
        "Configure alert thresholds",
        "View forecast detail",
        "Download cash flow projection",
      ]}
    />
  )
}

