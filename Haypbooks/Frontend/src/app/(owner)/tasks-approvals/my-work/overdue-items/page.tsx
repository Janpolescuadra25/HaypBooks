'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Overdue Items"
      module="TASKS"
      breadcrumb="Tasks & Approvals / My Work / Overdue Items"
      purpose="Overdue Items is a consolidated view showing every task, approval, follow-up, and deadline that has passed its due date for the logged-in user. It surfaces overdue items across all types in a single urgency-ranked list so nothing falls through the cracks. Items are grouped by type and severity to help users prioritize their immediate actions."
      components={[
        { name: 'Overdue Summary Tiles', description: 'Count tiles by category: Overdue Tasks, Pending Approvals, Missed Deadlines, Failed Automations.' },
        { name: 'Urgency-Ranked List', description: 'All overdue items sorted by days overdue descending, with type badge and linked record.' },
        { name: 'Quick Action Column', description: 'Per-item action buttons to complete, reassign, or reschedule directly from the list without opening detail.' },
        { name: 'Grouping Toggle', description: 'Group list by type (Tasks / Approvals / Follow-ups / System) or by module.' },
      ]}
      tabs={['All Overdue', 'Tasks', 'Approvals', 'Follow-ups', 'Deadlines']}
      features={[
        'Single urgency view across all overdue item types',
        'Days overdue prominently displayed',
        'Inline quick actions without navigation',
        'Bulk reschedule for low-priority items',
        'Daily email digest of overdue items (configurable)',
      ]}
      dataDisplayed={[
        'Total overdue items count by category',
        'Item title, type, and linked record',
        'Original due date and days overdue',
        'Assigned to and requested by',
        'Original source module',
      ]}
      userActions={[
        'Complete an overdue task inline',
        'Reschedule due date from the list',
        'Reassign to another team member',
        'Approve an overdue approval request',
        'Dismiss with reason for irrelevant items',
        'Export overdue list to CSV or PDF',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'Team Tasks', href: '/tasks-approvals/management/team-tasks' },
      ]}
    />
  )
}

