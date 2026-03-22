'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Policy Management"
      module="COMPLIANCE"
      breadcrumb="Compliance / Controls / Policy Management"
      purpose="Policy Management is the central repository for all company financial and operational policies. It stores the official versions of policies (expense policy, procurement policy, travel policy, data retention policy), tracks acknowledgment by employees, and enforces policy rules by linking them to approval workflows and validation rules in the system. It acts as both a document library and a live policy enforcement engine."
      components={[
        { name: 'Policy Library', description: 'Grid of all policies with name, version, effective date, category, and acknowledgment rate.' },
        { name: 'Policy Editor', description: 'Rich text editor for creating and versioning policy documents with section headers and formatted content.' },
        { name: 'Acknowledgment Tracker', description: 'Shows which employees have read and acknowledged each policy, with deadline and completion percentage.' },
        { name: 'Policy Rules Linker', description: 'Link policy sections to enforcement rules in the system (e.g., "Expense policy §3 requires approval for >500").' },
        { name: 'Version History', description: 'Full version history with changes tracked between versions and reason for update.' },
      ]}
      tabs={['All Policies', 'Finance Policies', 'HR Policies', 'IT Policies', 'Acknowledgments', 'Versions']}
      features={[
        'Central policy document repository with version control',
        'Employee acknowledgment tracking with deadline enforcement',
        'Policy-to-system-rule linking for automated enforcement',
        'Policy expiry alerts for periodic review',
        'Full-text search across all policy documents',
        'Export policies to PDF for external sharing',
      ]}
      dataDisplayed={[
        'Policy name, category, and effective date',
        'Current version number and last updated by',
        'Acknowledgment completion rate per policy',
        'Employees who have not yet acknowledged',
        'Linked enforcement rules in the system',
        'Policy expiry/review due date',
      ]}
      userActions={[
        'Create a new policy document',
        'Publish a new version of an existing policy',
        'Send acknowledgment requests to all employees',
        'Check acknowledgment completion status',
        'Link policy to approval or validation rule',
        'Export policy to PDF',
        'Archive an obsolete policy',
      ]}
      relatedPages={[
        { label: 'Risk Register', href: '/compliance/controls/risk-register' },
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
        { label: 'Document Storage', href: '/organization/governance/document-storage' },
        { label: 'Approval Matrices', href: '/automation/approvals-governance/approval-matrices' },
      ]}
    />
  )
}


