'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AIAuditLogsPage() {
  return (
    <PageDocumentation
      title="AI Audit Logs"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Governance / Audit Logs"
      purpose="Complete audit trail of all AI agent actions, recommendations, and automated operations for compliance review and incident investigation."
      components={[
        { name: "Log Table", description: "Timestamped log of every AI action with actor, action, and outcome" },
        { name: "Filter Bar", description: "Filter by agent, action type, date range, and outcome" },
        { name: "Event Detail Panel", description: "Full detail view for each log entry including inputs and outputs" },
      ]}
      tabs={[
        "All Logs",
        "Agent Actions",
        "Recommendations",
        "Automated Postings",
        "Errors",
      ]}
      features={[
        "Immutable audit trail",
        "Advanced filtering",
        "Export to SIEM or compliance system",
        "Anomaly detection on AI behavior",
        "Retention policy configuration",
      ]}
      dataDisplayed={[
        "Timestamp and session ID",
        "AI agent or model name",
        "Action taken",
        "Input data references",
        "Output or recommendation",
        "User confirmation if required",
        "Success/failure status",
      ]}
      userActions={[
        "Filter audit logs",
        "Export log to CSV",
        "Investigate specific event",
        "Flag suspicious AI action",
        "Configure retention policy",
      ]}
    />
  )
}

