'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Project Invoicing"
      module="PROJECTS"
      breadcrumb="Projects / Time & Billing / Project Invoicing"
      purpose="Project Invoicing generates invoices for project-based billing — whether time-and-materials (from billable hours), fixed-fee milestones, progress billings, or retainer arrangements. Project invoices are created here and flow into the main Invoices module (AR). The project context is maintained, so all invoices are traceable back to the project, enabling complete project revenue vs. cost reporting. Milestone billing creates invoices tied to project delivery events."
      components={[
        { name: 'Invoice Generation Wizard', description: 'Step-by-step: select project, choose billing type (T&M from hours, milestone, progress %), review line items, confirm client and billing address, and generate.' },
        { name: 'Project Invoice History', description: 'All invoices raised against a project with date, amount, payment status, and project billing-to-date total.' },
        { name: 'Milestone Billing Setup', description: 'Define billing milestones: milestone name, trigger event, billing amount or % of contract, and target date.' },
        { name: 'Contract Revenue Tracking', description: 'For fixed-fee projects: contract value vs. billed-to-date and remaining to bill.' },
      ]}
      tabs={['Create Invoice', 'Invoice History', 'Milestones', 'Contract Tracking']}
      features={[
        'Multiple project billing types: T&M, milestone, progress, retainer',
        'Invoice generation linked to project for full traceability',
        'Milestone billing event management',
        'Contract value vs. billed-to-date tracking',
        'WIP (unbilled revenue) calculation',
        'Integration with main Invoices module',
        'Project billing analysis: total billed vs. cost incurred',
      ]}
      dataDisplayed={[
        'All project invoices with payment status',
        'Total billed vs. contract value',
        'Unbilled work-in-progress (WIP) amount',
        'Milestone billing schedule and status',
        'Revenue recognized per period for each project',
      ]}
      userActions={[
        'Create a T&M invoice from billable hours',
        'Create a milestone billing invoice',
        'Set up billing milestones for a fixed-fee project',
        'View all invoices for a project',
        'Check WIP and remaining billing balance',
        'Export project billing history',
      ]}
      relatedPages={[
        { label: 'Billable Hours', href: '/projects/time-billing/billable-hours' },
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Project Budgets', href: '/projects/budgets/project-budget' },
        { label: 'Revenue Schedule', href: '/sales/revenue-recognition/revenue-schedule' },
      ]}
    />
  )
}

