'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Change Orders'
      module='PROJECTS'
      breadcrumb='Projects / Billing / Change Orders'
      purpose='Manages formal change order requests that modify project scope, timeline, or budget. Provides a structured approval workflow to document all scope changes, capture client sign-off, and automatically update project financials and billing schedules upon approval.'
      components={[
        { name: 'Change Order List', description: 'Tabular view of all change orders across projects with status indicators' },
        { name: 'Change Order Form', description: 'Structured form capturing scope description, cost impact, schedule impact, and justification' },
        { name: 'Approval Workflow', description: 'Multi-step approval routing through PM, finance, and client sign-off' },
        { name: 'Impact Dashboard', description: 'Real-time preview of budget and timeline changes upon CO approval' },
        { name: 'Document Attachment', description: 'File upload area for supporting drawings, specs, and client correspondence' },
      ]}
      tabs={['All Change Orders', 'Pending Approval', 'Approved', 'Rejected']}
      features={['Sequential approval routing with email notifications', 'Budget impact preview before approval', 'Schedule impact visualization', 'Automatic contract value update upon approval', 'Change order numbering sequences', 'Client e-signature integration', 'Linked to original project contract']}
      dataDisplayed={['Change order number and title', 'Requesting party and date', 'Scope description', 'Cost impact (increase/decrease/neutral)', 'Schedule impact (days)', 'Current approval stage', 'Approver names and timestamps']}
      userActions={['Create new change order', 'Attach supporting documents', 'Submit for approval', 'Approve or reject change order', 'Request client e-signature', 'View impact on project budget', 'Export change order log']}
      relatedPages={[
        { label: 'Project Contracts', href: '/projects/project-setup/contracts' },
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Project Budgets', href: '/projects/project-setup/budgets' },
      ]}
    />
  )
}

