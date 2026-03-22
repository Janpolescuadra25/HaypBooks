'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Audit Log Analysis"
      module="COMPLIANCE"
      breadcrumb="Compliance / Monitoring / Audit Log Analysis"
      purpose="Analyze patterns in the system audit trail to identify anomalies, policy violations, and unauthorized access. Use filters, charts, and export tools for compliance investigations."
      components={[
        { name: "Activity Timeline", description: "Chronological audit events with user, action, and resource" },
        { name: "Anomaly Detection Panel", description: "AI-flagged unusual access patterns requiring investigation" },
        { name: "Filter and Search", description: "Filter by user, action type, module, date, and IP address" },
        { name: "Trend Charts", description: "Charts showing activity volume by user, module, and time of day" },
        { name: "Export Controls", description: "Download filtered audit log for external analysis or regulatory submission" },
      ]}
      tabs={["All Events","Anomalies","By User","By Module","Export"]}
      features={["Full audit trail with user and IP","AI anomaly detection","Advanced filtering","Trend visualization","CSV/PDF export"]}
      dataDisplayed={["User and action name","Timestamp and IP address","Record changed and field values","Session and device info","Anomaly flag and reason"]}
      userActions={["Search audit log","Filter by user or action","Investigate anomaly","Export log for review","Set monitoring alerts"]}
    />
  )
}

