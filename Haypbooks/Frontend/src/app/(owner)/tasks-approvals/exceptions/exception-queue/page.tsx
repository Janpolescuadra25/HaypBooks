'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Exception Queue"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Exceptions / Exception Queue"
      purpose="The Exception Queue is the team-wide management view of all system exceptions requiring resolution. Unlike My Exceptions (personal view), this queue shows all exceptions across all users and modules, allowing managers and system administrators to monitor the overall exception health of the system and prioritize resolution efforts."
      components={[
        { name: 'Exception Summary Dashboard', description: 'Tile summary: total open exceptions by severity (Critical / Warning / Info) with trend vs. last week.' },
        { name: 'Exception List', description: 'Full list of all team exceptions with assignee, severity, source module, description, and age.' },
        { name: 'Assignment Panel', description: 'Assign unassigned exceptions to specific team members for resolution.' },
        { name: 'Resolution Tracking', description: 'Track resolution progress with status (Open / In Progress / Resolved / Dismissed).' },
      ]}
      tabs={['All Open', 'Critical', 'Unassigned', 'In Progress', 'Resolved']}
      features={[
        'Team-wide exception visibility',
        'Assign exceptions to team members for resolution',
        'Severity-based prioritization',
        'Resolution status tracking',
        'Exception volume trends over time',
        'Export exception report for management review',
      ]}
      dataDisplayed={[
        'Exception type and description',
        'Severity badge (Critical / Warning / Info)',
        'Source module and affected record',
        'Assignee and assignment date',
        'Age and resolution status',
        'Exception volume by module chart',
      ]}
      userActions={[
        'Assign an exception to a team member',
        'Change severity of an exception',
        'Bulk dismiss low-priority info exceptions',
        'Export exception queue to CSV',
        'Filter by module, severity, or assignee',
        'View resolution history for closed exceptions',
      ]}
      relatedPages={[
        { label: 'My Exceptions', href: '/tasks-approvals/my-work/my-exceptions' },
        { label: 'By Type', href: '/tasks-approvals/exceptions/by-type' },
        { label: 'Resolution Log', href: '/tasks-approvals/exceptions/resolution-log' },
        { label: 'Automation Logs', href: '/automation/monitoring/automation-logs' },
      ]}
    />
  )
}

