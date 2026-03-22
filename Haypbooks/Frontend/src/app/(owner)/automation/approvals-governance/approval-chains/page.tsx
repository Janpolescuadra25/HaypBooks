'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Approval Chains"
      module="AUTOMATION"
      breadcrumb="Automation / Approvals & Governance / Approval Chains"
      purpose="Approval Chains define the sequence of approvers that a transaction must pass through before it is fully approved. While Approval Matrices set the thresholds, Approval Chains define the ordered list of approvers (e.g., Step 1: Direct Manager, Step 2: Finance Director, Step 3: CEO for >500K). Chains support sequential, parallel, and hybrid approval flows with escalation paths for unresponsive approvers."
      components={[
        { name: 'Chain List', description: 'All configured approval chains with name, step count, transaction types linked, and active status.' },
        { name: 'Chain Builder', description: 'Visual step builder: add approvers per step, set step type (sequential/parallel), configure escalation timeout per step.' },
        { name: 'Approver Assignment', description: 'Select approvers by role, specific user, or dynamic (e.g., direct manager of requestor).' },
        { name: 'Escalation Settings', description: 'Set auto-escalation rules: if step not approved within N hours, escalate to next approver in chain.' },
      ]}
      tabs={['All Chains', 'By Transaction Type', 'Active', 'Inactive']}
      features={[
        'Sequential and parallel approval step support',
        "Dynamic approver resolution (e.g., \"submitter's manager\")",
        'Configurable escalation timeouts per step',
        'Skip conditions: bypass step if condition met',
        'Approval chain simulation with test transaction',
        'Visual chain diagram for each chain',
      ]}
      dataDisplayed={[
        'Chain name and description',
        'Number of approval steps',
        'Approvers per step (role or user)',
        'Escalation timeout per step',
        'Transaction types this chain applies to',
      ]}
      userActions={[
        'Create a new approval chain',
        'Add, remove, or reorder steps',
        'Set approver as role or specific user',
        'Configure escalation timeout and escalation path',
        'Test chain with sample transaction',
        'Link chain to transaction types in Approval Matrix',
        'Activate or deactivate a chain',
      ]}
      relatedPages={[
        { label: 'Approval Matrices', href: '/automation/approvals-governance/approval-matrices' },
        { label: 'Delegation Rules', href: '/automation/approvals-governance/delegation-rules' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
      ]}
    />
  )
}

