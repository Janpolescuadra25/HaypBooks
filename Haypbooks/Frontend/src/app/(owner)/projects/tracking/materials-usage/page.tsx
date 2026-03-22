'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Materials Usage'
      module='PROJECTS'
      breadcrumb='Projects / Tracking / Materials Usage'
      purpose='Records and tracks materials, parts, and supplies consumed on projects. Links to inventory management for stock deductions, supports billable markup on materials, and provides a complete audit trail of what was used, when, and at what cost.'
      components={[
        { name: 'Materials Usage Log', description: 'Chronological list of all materials issued to projects with quantity and cost' },
        { name: 'Inventory Integration Panel', description: 'Real-time stock level display and deduction on material issuance' },
        { name: 'Material Markup Configurator', description: 'Sets cost-plus markup by material category for billing purposes' },
        { name: 'Bill of Materials (BOM) Comparison', description: 'Compares projected versus actual material consumption' },
        { name: 'Excess and Waste Tracker', description: 'Records and reports on excess materials returned or wasted' },
      ]}
      tabs={['Usage Log', 'By Material', 'BOM Comparison', 'Billing Status']}
      features={['Real-time inventory deduction on issue', 'Cost-plus markup for billable materials', 'BOM comparison for project materials', 'Batch and lot tracking', 'Excess material return recording', 'Integration with procurement for restocking', 'Export materials usage report']}
      dataDisplayed={['Material name and SKU', 'Quantity issued and unit of measure', 'Unit cost and extended cost', 'Markup percentage and bill amount', 'Project and task assigned to', 'Issue date and issued by', 'Remaining stock level']}
      userActions={['Record material issuance to project', 'Apply billing markup', 'Compare to BOM plan', 'Record excess material return', 'View inventory levels', 'Export materials usage report', 'Trigger restocking requisition']}
      relatedPages={[
        { label: 'Project Expenses', href: '/projects/tracking/project-expenses' },
        { label: 'Billable Review', href: '/projects/tracking/billable-review' },
        { label: 'Subcontractor Costs', href: '/projects/tracking/subcontractor-costs' },
      ]}
    />
  )
}

