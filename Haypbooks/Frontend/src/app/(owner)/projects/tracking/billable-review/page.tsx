'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Billable Review'
      module='PROJECTS'
      breadcrumb='Projects / Tracking / Billable Review'
      purpose='Provides a focused review interface for all billable time, expenses, and material charges that are ready to be included in project invoices. Enables project managers and billing staff to verify, adjust, and approve billable items before invoice generation.'
      components={[
        { name: 'Billable Items Queue', description: 'Consolidated queue of unbilled time, expenses, and materials per project' },
        { name: 'Item-Level Review Panel', description: 'Side-by-side display of each billable item with edit and approve controls' },
        { name: 'Write-Down Tool', description: 'Reduce billable amount on any line item with reason tracking' },
        { name: 'Invoice Grouping Preview', description: 'Shows how billable items will be grouped and displayed on the invoice' },
        { name: 'Unbillable Reclassification', description: 'Convert billable items to non-billable write-offs for client courtesy' },
      ]}
      tabs={['Pending Review', 'Approved for Billing', 'Written Down', 'Non-Billable']}
      features={['Consolidated billable queue across all charge types', 'Line-item write-down with reason tracking', 'Invoice grouping configuration', 'Unbillable reclassification workflow', 'Bulk approval for invoice readiness', 'Billing guide rate verification', 'Pre-invoice quality check']}
      dataDisplayed={['Billable item type (time, expense, material)', 'Staff or vendor name', 'Date and description', 'Standard rate and bill amount', 'Write-down amount (if any)', 'Net billable amount', 'Approval status']}
      userActions={['Review pending billable items', 'Approve items for billing', 'Apply write-down to line item', 'Reclassify item as non-billable', 'Preview invoice grouping', 'Bulk approve billable queue', 'Generate invoice from approved items']}
      relatedPages={[
        { label: 'Project Time', href: '/projects/tracking/project-time' },
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Work in Progress', href: '/projects/billing/work-in-progress' },
      ]}
    />
  )
}

