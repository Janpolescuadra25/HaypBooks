'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function FraudDetectorAgentPage() {
  return (
    <PageDocumentation
      title="Fraud Detector Agent"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Agents / Fraud Detector"
      purpose="AI agent continuously monitoring transactions for anomalies, duplicate payments, and patterns consistent with fraudulent activity."
      components={[
        { name: "Anomaly Feed", description: "Real-time feed of suspicious transactions with risk scores" },
        { name: "Rule Engine", description: "Configure detection rules and sensitivity thresholds" },
        { name: "Investigation Workspace", description: "Detailed view for investigating flagged transactions" },
        { name: "Case Management", description: "Track open and closed fraud investigations" },
      ]}
      tabs={[
        "Anomaly Feed",
        "Detection Rules",
        "Investigations",
        "Resolved Cases",
        "Settings",
      ]}
      features={[
        "Machine learning anomaly detection",
        "Duplicate payment detection",
        "Benford's Law analysis",
        "Velocity checks",
        "Integration with compliance module",
      ]}
      dataDisplayed={[
        "Flagged transaction details",
        "Risk score and reasoning",
        "Detection rule triggered",
        "Similar historical transactions",
        "Investigation status",
      ]}
      userActions={[
        "Review flagged transaction",
        "Mark as false positive",
        "Open investigation",
        "Tune detection sensitivity",
        "Export fraud report",
      ]}
    />
  )
}

