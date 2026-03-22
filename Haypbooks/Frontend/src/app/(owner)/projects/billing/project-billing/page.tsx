'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Billing'
      module='PROJECTS'
      breadcrumb='Projects / Billing'
      purpose='Central hub for all project-related billing activities. Manages the full billing lifecycle from initial contract terms through invoicing and collection, ensuring every billable event is captured and invoiced accurately against project budgets and client agreements.'
      components={[
        { name: 'Billing Overview Panel', description: 'Summary of total contracted, billed, and remaining amounts across active projects' },
        { name: 'Billing Queue', description: 'List of projects with pending billable items ready for invoice generation' },
        { name: 'Invoice Generator', description: 'Wizard for creating project invoices from time, expenses, and milestones' },
        { name: 'Billing Rules Engine', description: 'Configuration of billing methods per project: T&M, fixed-fee, or milestone' },
        { name: 'Client Approval Tracker', description: 'Status board for invoices sent, approved, disputed, or paid' },
      ]}
      tabs={['Overview', 'Billing Queue', 'Invoice History', 'Billing Rules']}
      features={['Multiple billing methods: time-and-materials, fixed-fee, milestone', 'Automated billable item capture from time entries and expenses', 'Client billing portal link generation', 'Retainage and holdback management', 'Multi-currency project billing', 'Billing schedule automation', 'Write-off and courtesy adjustment recording']}
      dataDisplayed={['Total contracted amount per project', 'Amount billed to date', 'Unbilled balance', 'Billing method per project', 'Pending billable items count', 'Invoice aging summary', 'Collection rate percentage']}
      userActions={['Generate project invoice', 'Review billable queue', 'Set billing method per project', 'Approve and send invoice', 'Record client payment', 'Apply write-off or adjustment', 'View billing history']}
      relatedPages={[
        { label: 'Project Setup', href: '/projects/project-setup/projects' },
        { label: 'Milestones', href: '/projects/project-setup/milestones' },
        { label: 'Billable Review', href: '/projects/tracking/billable-review' },
      ]}
    />
  )
}

