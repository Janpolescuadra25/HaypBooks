'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="PO Approval"
      module="EXPENSES"
      breadcrumb="Expenses / Purchase Orders / PO Approval"
      purpose="PO Approval is the dedicated queue for reviewers and approvers to review, approve, or reject submitted purchase orders. The page shows all POs pending the current user's approval, organized by urgency. Each PO shows the full context: requestor, vendor, items, amounts, GL accounts, and budget availability. Approvers can approve, reject, or request clarification with comments — all tracked in the approval audit trail."
      components={[
        { name: 'Approval Queue', description: "All POs pending the current user's approval, sorted by submission date and urgency flag." },
        { name: 'PO Detail Review Panel', description: 'Full PO details for reviewing: line items, GL accounts, budget availability per account, vendor details.' },
        { name: 'Budget Availability Indicator', description: "For each PO line's GL account: shows budget remaining vs. PO amount to flag if approval would exceed budget." },
        { name: 'Approval Action Panel', description: 'Approve, Reject, or Request Changes buttons with mandatory comment for rejection.' },
        { name: 'Approval History', description: 'All approved and rejected POs with the approver, decision timestamp, and comments.' },
      ]}
      tabs={['Pending My Approval', 'All Open POs', 'Approved', 'Rejected']}
      features={[
        'Dedicated PO approval review interface',
        'Budget availability at point of approval decision',
        'Mandatory comments on rejection or change requests',
        'Multi-level hierarchy support',
        'Email notification on new PO approval request',
        'Mobile-friendly approval for on-the-go approvals',
      ]}
      dataDisplayed={[
        'POs pending the current approver',
        'Full line item details per PO',
        'Budget available for each GL account',
        'Requestor and requested urgency level',
        'Prior approval history per PO',
      ]}
      userActions={[
        'Review PO details before deciding',
        'Check budget availability per line',
        'Approve or reject a PO with comments',
        'Request changes from the requestor',
        'Delegate approval to another approver',
        'View all POs in the approval pipeline',
      ]}
      relatedPages={[
        { label: 'Purchase Orders', href: '/expenses/purchase-orders/po-list' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Budgets', href: '/accounting/planning/budgets' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
      ]}
    />
  )
}

