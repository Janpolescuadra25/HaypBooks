'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Connection Health"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / My Integrations / Connection Health"
      purpose="Real-time health dashboard for all connected integrations. Monitor sync success rates, error trends, response times, and receive proactive alerts when connections degrade."
      components={[
        { name: "Health Scorecard", description: "Overall health summary with green/amber/red status across all integrations" },
        { name: "Integration Health Cards", description: "Per-integration health tile showing uptime, error rate, and last success" },
        { name: "Error Trend Chart", description: "Time-series chart of errors per integration over the past 30 days" },
        { name: "Alert Configuration", description: "Set thresholds for health alerts via email or in-app notification" },
      ]}
      tabs={["Overview","Detailed Health","Alerts","History"]}
      features={["Real-time health monitoring","Error rate trending","Automatic alerts on degradation","Troubleshooting guides","SLA tracking"]}
      dataDisplayed={["Overall health score","Per-integration uptime percentage","Error rate over time","Average sync response time","Active alerts count"]}
      userActions={["View health details per integration","Configure alert thresholds","Trigger re-test of failed connection","View troubleshooting guide"]}
    />
  )
}

