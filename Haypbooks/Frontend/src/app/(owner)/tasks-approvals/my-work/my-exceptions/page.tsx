'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="My Exceptions"
      module="TASKS"
      breadcrumb="Tasks & Approvals / My Work / My Exceptions"
      purpose="My Exceptions shows all exceptions, errors, and anomalies flagged by the system that are assigned to or relevant to the logged-in user. Exceptions are generated when automated processes encounter issues — failed bank feed syncs, unmatched transactions, duplicate detection, validation errors, or compliance rule violations. This page serves as the user's personal resolution queue."
      components={[
        { name: 'Exception List', description: 'List of all open exceptions with severity badge (Critical/Warning/Info), source module, description, and age.' },
        { name: 'Exception Detail', description: 'Full exception context: what triggered it, affected record, suggested resolution steps, and related transactions.' },
        { name: 'Resolution Actions', description: 'Module-specific resolution buttons: Reclassify, Match, Dismiss, Escalate, Create Task.' },
        { name: 'Severity Filter', description: 'Filter by severity level, module source, exception type, or date range.' },
        { name: 'Resolution Log', description: 'History of previously resolved exceptions for this user with resolution method and outcome.' },
      ]}
      tabs={['Open', 'Critical', 'Warnings', 'Info', 'Resolved']}
      features={[
        'Aggregated exceptions from all modules in one view',
        'Severity-ranked queue (Critical first)',
        'Guided resolution steps per exception type',
        'One-click navigation to affected record',
        'Bulk dismiss for low-priority informational exceptions',
        'Escalate unresolvable exceptions to supervisor',
      ]}
      dataDisplayed={[
        'Exception type and description',
        'Severity level (Critical / Warning / Info)',
        'Source module and affected record',
        'Date exception was raised and age',
        'Suggested resolution method',
        'Exception count by module summary',
      ]}
      userActions={[
        'Resolve an exception with resolution method',
        'Dismiss a non-critical exception with reason',
        'Escalate to manager or another user',
        'Navigate to the affected record for manual correction',
        'Create a follow-up task linked to the exception',
        'Filter by severity and module',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Exception Queue', href: '/tasks-approvals/exceptions/exception-queue' },
        { label: 'Automation Logs', href: '/automation/monitoring/automation-logs' },
      ]}
    />
  )
}

