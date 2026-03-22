'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Delegation Rules"
      module="AUTOMATION"
      breadcrumb="Automation / Approvals & Governance / Delegation Rules"
      purpose="Delegation Rules allows users to pre-configure or ad-hoc delegate their approval authority to other authorized users for defined periods (e.g., when on leave). Rules specify: who is delegating, to whom, which approval types are delegated, and for what date range. Delegations are tracked in the audit trail and delegated approvals are clearly marked in approval history."
      components={[
        { name: 'Active Delegations List', description: 'All currently active delegations with delegator, delegate, scope (which approval types), and expiry date.' },
        { name: 'Create Delegation Form', description: 'Set up a new delegation: select delegate user, choose transaction types to delegate, and set date range.' },
        { name: 'Delegation History', description: 'Past delegations with outcomes showing which approvals were actioned by delegates.' },
        { name: 'Out-of-Office Integration', description: 'Link delegation creation to out-of-office/holiday calendar for automatic delegation activation.' },
      ]}
      tabs={['Active Delegations', 'My Delegations', 'Delegated to Me', 'History']}
      features={[
        'Pre-scheduled delegation for planned absences',
        'Ad-hoc delegation for immediate assignment',
        'Scope control: delegate only specific approval types',
        'Date range with automatic expiry',
        'Delegates inherit only specified authority (principle of least privilege)',
        'Delegation audit trail visible to admin',
      ]}
      dataDisplayed={[
        'Active delegation pairs (delegator → delegate)',
        'Delegated approval types and scope',
        'Start and end date of delegation',
        'Number of approvals actioned by each delegate',
        'Delegation history with outcomes',
      ]}
      userActions={[
        'Create a new delegation rule',
        'Set scope (which approval types are delegated)',
        'Set delegation date range',
        'Revoke an active delegation immediately',
        'View what is delegated to me',
        'Extend a delegation expiry date',
      ]}
      relatedPages={[
        { label: 'Approval Chains', href: '/automation/approvals-governance/approval-chains' },
        { label: 'Approval Matrices', href: '/automation/approvals-governance/approval-matrices' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'Delegated Tasks', href: '/tasks-approvals/management/delegated-tasks' },
      ]}
    />
  )
}

