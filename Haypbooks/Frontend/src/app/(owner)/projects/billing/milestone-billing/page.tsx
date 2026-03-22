'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Milestone Billing'
      module='PROJECTS'
      breadcrumb='Projects / Billing / Milestone Billing'
      purpose='Handles billing events tied to project milestones rather than time or cost. Automatically triggers invoice generation when milestone completion criteria are met, ensuring revenue is recognized and billed at contractually defined project stages.'
      components={[
        { name: 'Milestone Billing Schedule', description: 'Timeline view of project milestones with billing amounts and trigger conditions' },
        { name: 'Completion Trigger Panel', description: 'Configures completion criteria: manual sign-off, task completion %, or date-based' },
        { name: 'Invoice Preview', description: 'Pre-bill preview showing amount, terms, and client details before sending' },
        { name: 'Revenue Recognition Tie-In', description: 'Maps each milestone invoice to a deferred or recognized revenue entry' },
        { name: 'Milestone Status Board', description: 'Kanban-style board showing pending, in-progress, and completed milestones' },
      ]}
      tabs={['Milestone Schedule', 'Pending Triggers', 'Billed', 'Revenue Recognition']}
      features={['Automatic invoice creation on milestone completion', 'Configurable completion trigger types', 'Retainage percentage per milestone', 'Partial billing on sub-milestones', 'Client notification on milestone readiness', 'Milestone-to-revenue recognition mapping', 'Schedule deviation alerts']}
      dataDisplayed={['Milestone name and description', 'Target completion date', 'Billing amount per milestone', 'Completion trigger type and status', 'Invoice generated (yes/no) and date', 'Retainage held', 'Percentage of total contract value']}
      userActions={['Define milestone billing schedule', 'Mark milestone as complete', 'Trigger invoice generation', 'Preview and send milestone invoice', 'Configure retainage rules', 'Map milestone to revenue recognition', 'Export milestone billing report']}
      relatedPages={[
        { label: 'Milestones Setup', href: '/projects/project-setup/milestones' },
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Revenue Recognition', href: '/sales/revenue-management/revenue-recognition' },
      ]}
    />
  )
}

