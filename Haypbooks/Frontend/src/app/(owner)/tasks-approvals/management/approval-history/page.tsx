'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Approval History"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Management / Approval History"
      purpose="Approval History is the complete immutable audit log of all approval decisions made across the organization. Every approval — whether approved, rejected, or overridden — is recorded with the approver identity, timestamp, comments, and the final outcome. This record is critical for audit, compliance, and dispute resolution purposes."
      components={[
        { name: 'History Timeline', description: 'Chronological list of all approval decisions with type, outcome, approver, amount, and date.' },
        { name: 'Decision Detail Panel', description: 'Full detail including approval chain sequence, each approver comment, and timestamps per step.' },
        { name: 'Search & Filter', description: 'Search by transaction reference, filter by approver, date range, type, outcome, or module.' },
        { name: 'Export Button', description: 'Export filtered approval history to CSV or PDF for audit purposes.' },
      ]}
      tabs={['All Decisions', 'Approved', 'Rejected', 'Overridden', 'By Module']}
      features={[
        'Immutable audit trail of every approval decision',
        'Full comment and timestamp per approval step',
        'Multi-step chain visualization',
        'Export for audit and compliance reporting',
        'Search by transaction reference number',
      ]}
      dataDisplayed={[
        'Decision outcome (Approved / Rejected / Overridden)',
        'Approver name and role',
        'Transaction type, amount, and reference',
        'Submission date and decision date',
        'Approver comment and rejection reason',
        'Number of steps in approval chain',
      ]}
      userActions={[
        'Search for specific transaction approval history',
        'Filter by date range, approver, or outcome',
        'View full multi-step approval chain detail',
        'Export filtered results for audit',
      ]}
      relatedPages={[
        { label: 'Approval Queue', href: '/tasks-approvals/management/approval-queue' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'Completed Tasks', href: '/tasks-approvals/history/completed-tasks' },
      ]}
    />
  )
}

