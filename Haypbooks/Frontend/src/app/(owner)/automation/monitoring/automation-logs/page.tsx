'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Automation Logs"
      module="AUTOMATION"
      breadcrumb="Automation / Monitoring / Automation Logs"
      purpose="Automation Logs shows the execution history of all workflow automations, smart rules, scheduled jobs, and system processes. Every workflow run is logged with success/failure status, execution time, trigger event details, and any errors encountered. This page is essential for monitoring automation health, diagnosing failures, and ensuring business-critical automations are running correctly."
      components={[
        { name: 'Log Table', description: 'All automation execution records with workflow/rule name, trigger event, execution time, status (success/failed/skipped), and timestamp.' },
        { name: 'Error Detail Panel', description: 'For failed runs: full error trace, affected records, and suggested resolution steps.' },
        { name: 'Run Statistics', description: 'Summary metrics: total runs today, success rate, average execution time, and top failing workflows.' },
        { name: 'Retry Button', description: 'Manually retry a failed automation run after fixing the underlying issue.' },
      ]}
      tabs={['All Runs', 'Workflows', 'Smart Rules', 'Scheduled Jobs', 'Failed Runs']}
      features={[
        'Complete execution history for all automations',
        'Per-run error traces and diagnostic information',
        'Success rate and performance metrics',
        'Manual retry for failed runs',
        'Alerting when automation failure rate exceeds threshold',
        'Log export for technical review',
      ]}
      dataDisplayed={[
        'Automation/workflow name and type',
        'Trigger event and trigger record',
        'Execution status (success / failed / skipped)',
        'Execution timestamp and duration (ms)',
        'Error message and stack trace (for failures)',
        'Actions taken by the automation (tasks created, emails sent, etc.)',
      ]}
      userActions={[
        'Filter logs by workflow, date range, or status',
        'View error detail for a failed run',
        'Retry a failed automation',
        'Navigate to triggered workflow definition',
        'Export automation log to CSV',
        'Set up alert for repeated failures',
      ]}
      relatedPages={[
        { label: 'Workflow Builder', href: '/automation/workflow-engine/workflow-builder' },
        { label: 'Smart Rules', href: '/automation/workflow-engine/smart-rules' },
        { label: 'Performance Dashboard', href: '/automation/monitoring/performance-dashboard' },
        { label: 'Audit Trails', href: '/automation/approvals-governance/audit-trails' },
      ]}
    />
  )
}

