'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Contracts'
      module='PROJECTS'
      breadcrumb='Projects / Project Setup / Contracts'
      purpose='Stores and manages client contracts associated with projects, including contract terms, value, billing arrangements, scope definitions, and key dates. Provides a central repository for contract documents and tracks contract performance against agreed terms.'
      components={[
        { name: 'Contract Repository', description: 'List of all contracts linked to projects with quick-view status and value' },
        { name: 'Contract Detail Form', description: 'Full contract data entry: type, value, terms, payment schedule, and scope' },
        { name: 'Document Vault', description: 'Secure attachment storage for signed contracts, amendments, and SOWs' },
        { name: 'Contract Value Tracker', description: 'Monitors original value, change order adjustments, and remaining balance' },
        { name: 'Expiry & Renewal Alerts', description: 'Automated notifications for upcoming contract expiry or renewal dates' },
      ]}
      tabs={['All Contracts', 'Active', 'Expiring Soon', 'Expired']}
      features={['Contract-to-project linking', 'Multiple contract types: fixed-fee, T&M, retainer, not-to-exceed', 'Change order value tracking', 'Document version control', 'Expiry and renewal alert automation', 'Contract performance metrics', 'Client e-signature workflow']}
      dataDisplayed={['Contract number and type', 'Client and project name', 'Original contract value', 'Approved change orders', 'Current contract value', 'Key dates (start, end, renewal)', 'Payment terms and schedule']}
      userActions={['Create new contract', 'Upload signed contract document', 'Add contract amendment', 'Track change order adjustments', 'Set expiry alert', 'Initiate renewal workflow', 'Export contract summary']}
      relatedPages={[
        { label: 'Projects', href: '/projects/project-setup/projects' },
        { label: 'Change Orders', href: '/projects/billing/change-orders' },
        { label: 'Milestones', href: '/projects/project-setup/milestones' },
      ]}
    />
  )
}

