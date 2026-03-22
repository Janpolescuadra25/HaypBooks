'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Progress Billing'
      module='PROJECTS'
      breadcrumb='Projects / Billing / Progress Billing'
      purpose='Enables billing based on percentage of project completion, commonly used in construction and long-term contracts. Calculates the earned value at each billing period and generates an AIA-style or custom progress invoice for the completed work to date.'
      components={[
        { name: 'Completion Percentage Input', description: 'Per-line-item or overall project completion percentage entry with supporting calculation' },
        { name: 'Schedule of Values (SOV)', description: 'Breakdown of contract value by work component used for progress billing calculations' },
        { name: 'AIA-Style Invoice Generator', description: 'Produces industry-standard G702/G703 or custom progress billing invoices' },
        { name: 'Billing Period Summary', description: 'Running total of previous billings, current billing, and balance to complete' },
        { name: 'Retainage Calculator', description: 'Tracks retainage accumulation and release schedules' },
      ]}
      tabs={['Schedule of Values', 'Current Period', 'Billing History', 'Retainage']}
      features={['Schedule of Values (SOV) setup per project', 'Automatic earned value calculation', 'AIA G702/G703 invoice format', 'Retainage tracking and release management', 'Over-billing and under-billing alerts', 'Multi-period comparison view', 'Lien waiver attachment support']}
      dataDisplayed={['Original contract values per SOV line', 'Completed and stored to date percentage', 'Current period billing amount', 'Previous billings total', 'Retainage withheld', 'Net payment due this period', 'Balance to complete']}
      userActions={['Set up schedule of values', 'Enter current period completion percentages', 'Calculate and review progress billing', 'Generate AIA-style invoice', 'Submit invoice for client approval', 'Manage retainage release', 'Export billing application PDF']}
      relatedPages={[
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Change Orders', href: '/projects/billing/change-orders' },
        { label: 'Project Contracts', href: '/projects/project-setup/contracts' },
      ]}
    />
  )
}

