'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="My Approvals"
      module="TASKS"
      breadcrumb="Tasks & Approvals / My Work / My Approvals"
      purpose="My Approvals is the personal approval inbox showing all items currently awaiting the logged-in user's approval decision. Approval requests originate from transactions that meet configured approval thresholds — such as purchase orders above a dollar limit, payroll runs, bill payments requiring authorization, and expense reports. Users can review the full context, add comments, request revisions, and approve or reject directly from this queue."
      components={[
        { name: 'Approval Queue List', description: 'Prioritized list of pending approval items showing type, amount, requester, age, and urgency badge.' },
        { name: 'Approval Detail Panel', description: 'Full context view: item details, line items, linked documents, requester notes, previous approvals in chain, and amount.' },
        { name: 'Approve / Reject Buttons', description: 'Clear action buttons with mandatory comment field for rejection. Support bulk approval of multiple items.' },
        { name: 'Filter Bar', description: 'Filter approvals by type (PO, Bill, Expense, Payroll, Payment), amount range, requester, age.' },
        { name: 'Escalation Indicator', description: 'Visual flag showing items that have been pending longer than the configured escalation threshold.' },
      ]}
      tabs={['Pending', 'Approved Today', 'Rejected', 'On Hold', 'Delegated']}
      features={[
        'Single inbox for all approval types across modules',
        'Full transaction context without leaving approval queue',
        'Bulk approve multiple items simultaneously',
        'Mandatory rejection comment with reason codes',
        'Delegation of approval authority when unavailable',
        'Escalation alerts for aging approval requests',
        'Audit trail of every approval decision',
      ]}
      dataDisplayed={[
        'Approval item type (PO, Bill, Expense, Payroll, etc.)',
        'Requester name and submission date/time',
        'Transaction amount and currency',
        'Days pending and escalation status',
        'Previous approvers in the chain and their decisions',
        'Supporting documents and attachments',
      ]}
      userActions={[
        'Approve a single item',
        'Approve multiple items in bulk',
        'Reject item with comment and reason code',
        'Request revision/additional information',
        'Delegate approval to another authorized user',
        'Put item on hold pending clarification',
        'View full transaction detail',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Approval History', href: '/tasks-approvals/history/approval-history' },
        { label: 'Approval Queue', href: '/tasks-approvals/management/approval-queue' },
        { label: 'Approval Matrices', href: '/automation/approvals-governance/approval-matrices' },
      ]}
    />
  )
}

