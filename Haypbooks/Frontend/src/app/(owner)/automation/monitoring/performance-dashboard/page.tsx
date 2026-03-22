'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Automation Performance Dashboard"
      module="AUTOMATION"
      breadcrumb="Automation / Monitoring / Performance Dashboard"
      purpose="The Automation Performance Dashboard provides aggregate analytics on the health and efficiency of all automation rules and workflows. It shows key metrics like total automations run, success rates, time saved, most-used workflows, and failure patterns — helping system administrators understand automation ROI and identify optimizations."
      components={[
        { name: 'KPI Tiles Row', description: 'Total workflows executed this month, overall success rate %, average execution time, and estimated hours saved vs. manual.' },
        { name: 'Workflow Performance Table', description: 'Per-workflow metrics: run count, success rate, avg execution time, last run, and trend.' },
        { name: 'Failure Heatmap', description: 'Calendar heatmap showing which days had elevated automation failure rates.' },
        { name: 'Top Automations Chart', description: 'Bar chart of top 10 most frequently triggered automations.' },
        { name: 'Time-Saved Estimate', description: 'Estimated hours saved by automation compared to manual processing, based on configurable per-action time estimates.' },
      ]}
      tabs={['Overview', 'By Workflow', 'By Module', 'Failure Analysis', 'Time Saved']}
      features={[
        'Automation ROI estimation (hours saved)',
        'Per-workflow performance breakdown',
        'Failure pattern identification',
        'Trend analysis over configurable periods',
        'Export performance report',
      ]}
      dataDisplayed={[
        'Total automation executions this period',
        'Overall success rate and trend',
        'Top 10 most-triggered automations',
        'Workflows with highest failure rates',
        'Estimated hours saved this month',
        'Average execution time per workflow',
      ]}
      userActions={[
        'Filter by time period (7/30/90 days)',
        'Drill into a workflow for detailed metrics',
        'Export automation performance report',
        'Set performance SLA thresholds for alerts',
        'Navigate to failing workflow to review',
      ]}
      relatedPages={[
        { label: 'Automation Logs', href: '/automation/monitoring/automation-logs' },
        { label: 'Workflow Builder', href: '/automation/workflow-engine/workflow-builder' },
        { label: 'Smart Rules', href: '/automation/workflow-engine/smart-rules' },
      ]}
    />
  )
}

