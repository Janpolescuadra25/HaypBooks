'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Completed Follow-ups"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Follow-ups / Completed"
      purpose="Completed Follow-ups is the archive of all follow-up actions that have been marked as done, providing a record of customer contacts, vendor interactions, and other follow-through activities. It shows the outcome of each follow-up to document whether the action was successful, and serves as a historical reference for account management."
      components={[
        { name: 'Completed List', description: 'Chronological list of completed follow-ups with linked record, completion date, and completion note.' },
        { name: 'Outcome Summary', description: 'Breakdown of follow-up outcomes: Resolved, Pending Response, Escalated, No Action Needed.' },
        { name: 'Search & Filter', description: 'Filter by linked record type, assignee, date range, or outcome.' },
      ]}
      tabs={['All Completed', 'This Week', 'This Month', 'By Record Type']}
      features={[
        'History of all completed follow-up interactions',
        'Outcome tracking for analysis',
        'Search by customer or vendor name',
        'Export for CRM-style activity reporting',
      ]}
      dataDisplayed={[
        'Follow-up title and type',
        'Original scheduled date vs. actual completion date',
        'Completor and completion note',
        'Outcome/result of the follow-up',
        'Linked record reference',
      ]}
      userActions={[
        'Search completed follow-ups by record or text',
        'Filter by date range or assignee',
        'View completion notes and outcomes',
        'Export completed follow-up list',
        'Reopen a follow-up if further action needed',
      ]}
      relatedPages={[
        { label: 'Scheduled Follow-ups', href: '/tasks-approvals/follow-ups/scheduled' },
        { label: 'Overdue Follow-ups', href: '/tasks-approvals/follow-ups/overdue' },
        { label: 'Completed Tasks', href: '/tasks-approvals/history/completed-tasks' },
      ]}
    />
  )
}

