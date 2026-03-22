'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Approval Matrices"
      module="AUTOMATION"
      breadcrumb="Automation / Approvals & Governance / Approval Matrices"
      purpose="Approval Matrices define the rules governing which transactions require approval and from whom, based on configurable criteria such as transaction value, type, department, and location. A matrix maps transaction attributes to required approvers and approval thresholds, ensuring that no transaction above a defined limit can be processed without proper authorization. This is the configuration backbone of the entire approval workflow system."
      components={[
        { name: 'Matrix Table', description: 'Grid-based matrix showing transaction types along one axis and approval tiers along the other, with amount thresholds in cells.' },
        { name: 'Matrix Editor', description: 'Edit approval thresholds per transaction type and tier — set amount limits and assign approver roles.' },
        { name: 'Matrix Templates', description: 'Pre-built approval matrix templates: SME Standard, Mid-Market, Enterprise.' },
        { name: 'Effective Date Control', description: 'Set an effective date when a new matrix version takes effect, without disrupting in-flight approvals.' },
      ]}
      tabs={['Matrices', 'Purchase Orders', 'Bills & Payments', 'Expense Reports', 'Payroll', 'Custom']}
      features={[
        'Role-based, amount-threshold approval rules',
        'Multiple approval matrices for different transaction types',
        'Tiered approval for escalating amounts',
        'Department-specific override matrices',
        'Matrix versioning with effective date control',
        'Test a transaction against the current matrix',
      ]}
      dataDisplayed={[
        'Transaction types and their approval thresholds',
        'Approver roles assigned per tier per type',
        'Current matrix version and effective date',
        'Pending matrix changes (not yet effective)',
      ]}
      userActions={[
        'Define approval thresholds per transaction type',
        'Assign approver roles per tier',
        'Set effective date for matrix changes',
        'Test a transaction amount to see what approval it requires',
        'Import matrix from Excel template',
        'Export current matrix as PDF',
      ]}
      relatedPages={[
        { label: 'Approval Chains', href: '/automation/approvals-governance/approval-chains' },
        { label: 'Delegation Rules', href: '/automation/approvals-governance/delegation-rules' },
        { label: 'Approval Queue', href: '/tasks-approvals/management/approval-queue' },
        { label: 'Approval History', href: '/tasks-approvals/management/approval-history' },
      ]}
    />
  )
}

