'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Expense Approval"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Reports / Expense Approval"
      purpose="Expense Approval is the manager and finance team interface for reviewing and approving employee expense reports. Approvers see all submitted expense reports pending their action, can review each line item and receipt, check policy compliance, approve the report, reject with comments, or request revisions. After approval, the expense report is processed for reimbursement payment to the employee."
      components={[
        { name: 'Approval Queue', description: "All submitted expense reports pending the current approver's action with employee name, report period, total amount, and submission date." },
        { name: 'Expense Report Review Panel', description: 'Full expense report view: all line items, amounts, categories, receipts, and policy violation flags.' },
        { name: 'Policy Check Panel', description: 'Highlights out-of-policy expenses (over daily meal limit, missing receipt, non-approved vendor).' },
        { name: 'Approval Actions', description: 'Approve, Reject, or Request Changes with mandatory comment field for rejection.' },
        { name: 'Batch Approval', description: 'Approve multiple expense reports at once for routine, low-risk reimbursements.' },
      ]}
      tabs={['Pending My Approval', 'All Submitted', 'Approved', 'Rejected', 'History']}
      features={[
        'Dedicated expense report approval queue',
        'Receipt visibility in approval interface',
        'Policy compliance flagging at point of approval',
        'Batch approval for multiple reports',
        'Rejection with mandatory feedback to employee',
        'Full approval audit trail',
        'Automatic payment processing trigger on approval',
      ]}
      dataDisplayed={[
        'Expense reports pending approval',
        'Line items and receipts per report',
        'Policy violation flags',
        'Total reimbursement amount per report',
        'Employee and report period',
        'Approval history for completed reports',
      ]}
      userActions={[
        'Review an expense report line by line',
        'View attached receipts',
        'Approve an expense report',
        'Reject with explanation',
        'Request changes from employee',
        'Batch approve multiple reports',
        'View approval history',
      ]}
      relatedPages={[
        { label: 'My Expenses', href: '/expenses/expense-reports/my-expenses' },
        { label: 'Corporate Cards', href: '/expenses/expense-reports/corporate-cards' },
        { label: 'Expense Policy', href: '/compliance/controls/policy-management' },
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
      ]}
    />
  )
}

