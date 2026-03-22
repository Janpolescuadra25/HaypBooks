'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Approval Queue"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Management / Approval Queue"
      purpose="The Approval Queue is the management-level view of all pending approvals across the entire team. Unlike My Approvals (personal queue), this view allows managers to see all approvals in the system, not just their own — useful for monitoring approval bottlenecks, identifying stalled requests, and escalating or reassigning approvals when needed."
      components={[
        { name: 'Queue Overview', description: 'Summary tiles: total pending, overdue, flagged for escalation, and approved today.' },
        { name: 'Team Approval List', description: 'All pending approvals sorted by urgency with approver name, type, amount, and age.' },
        { name: 'Approver Workload', description: 'Per-approver queue depth showing how many items each approver has pending.' },
        { name: 'Escalation Panel', description: 'Items flagged for escalation with reason (overdue threshold exceeded, approver unavailable).' },
        { name: 'Reassign Action', description: 'Reassign any approval to a different authorized approver for the transaction type.' },
      ]}
      tabs={['All Pending', 'Overdue', 'Escalated', 'By Approver', 'By Type']}
      features={[
        'Full team approval visibility for managers',
        'Identify and unblock approval bottlenecks',
        'Reassign stuck approvals to other approvers',
        'Force-approve with manager override (with audit trail)',
        'Escalation alerts when approvals age beyond threshold',
        'Export approval queue as CSV',
      ]}
      dataDisplayed={[
        'All pending approvals across all modules and users',
        'Approver assignment and queue depth per approver',
        'Days pending and escalation status',
        'Transaction type and amount',
        'Requester and submission date',
      ]}
      userActions={[
        'Reassign approval to different approver',
        'Escalate approval to senior approver',
        'Manager override approve with justification',
        'Filter by approver, type, or age',
        'View full transaction context',
        'Export approval queue report',
      ]}
      relatedPages={[
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'Approval History', href: '/tasks-approvals/management/approval-history' },
        { label: 'Approval Matrices', href: '/automation/approvals-governance/approval-matrices' },
        { label: 'Approval Chains', href: '/automation/approvals-governance/approval-chains' },
      ]}
    />
  )
}

