'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Approval History"
      module="TASKS"
      breadcrumb="Tasks & Approvals / History / Approval History"
      purpose="The History section's Approval History is the personal view of approval decisions made by or for the logged-in user. It shows all approvals the user has acted on (approved or rejected) and all approvals that were submitted by the user and have been decided. Useful for individual accountability and tracking personal approval activity."
      components={[
        { name: 'My Decisions List', description: 'Approvals the current user approved or rejected, with transaction details and date.' },
        { name: 'My Submissions List', description: 'Approval requests submitted by the current user and their outcomes.' },
        { name: 'Details Panel', description: 'Full approval chain detail with every approver step, comment, and timestamp.' },
      ]}
      tabs={['My Decisions', 'My Submissions', 'All (Manager View)']}
      features={[
        'Personal approval decision history',
        'Submission outcome tracking',
        'Full chain visibility per approval',
        'Export personal approval log',
      ]}
      dataDisplayed={[
        'Transaction type and reference number',
        'Approval outcome (Approved / Rejected)',
        'Decision date and processing time',
        'Comment provided at decision',
        'Full chain showing all approvers',
      ]}
      userActions={[
        'Filter decisions by date range or transaction type',
        'View full approval chain detail',
        'Export personal approval history',
      ]}
      relatedPages={[
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'Approval Queue', href: '/tasks-approvals/management/approval-queue' },
        { label: 'Management Approval History', href: '/tasks-approvals/management/approval-history' },
      ]}
    />
  )
}

