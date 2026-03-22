'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Milestones'
      module='PROJECTS'
      breadcrumb='Projects / Project Setup / Milestones'
      purpose='Defines and manages key project milestones that mark significant completion points in the project lifecycle. Milestones serve as billing triggers, schedule checkpoints, and client deliverable markers, and are used throughout project tracking and billing workflows.'
      components={[
        { name: 'Milestone List Builder', description: 'Add, reorder, and configure milestones with target dates and completion criteria' },
        { name: 'Milestone Progress Tracker', description: 'Shows current status and completion percentage of each milestone' },
        { name: 'Billing Milestone Toggle', description: 'Marks milestones as billable and sets the invoice amount or percentage' },
        { name: 'Deliverable Checklist', description: 'Attach completion checklists to milestones for quality control' },
        { name: 'Milestone Timeline View', description: 'Visual timeline of all milestones with status color coding' },
      ]}
      tabs={['Milestone List', 'Timeline', 'Billing Milestones', 'Completed']}
      features={['Flexible milestone creation and ordering', 'Billable milestone configuration', 'Completion criteria and checklist attachment', 'Integration with milestone billing', 'Client notification on milestone completion', 'Baseline date vs. actual date tracking', 'Milestone earned value contribution']}
      dataDisplayed={['Milestone name and description', 'Target and actual completion dates', 'Billing amount or percentage', 'Completion status', 'Linked deliverables or checklists', 'Baseline vs. actual schedule variance', 'Client sign-off required flag']}
      userActions={['Create project milestone', 'Set milestone as billable', 'Attach completion checklist', 'Mark milestone as complete', 'Trigger billing from milestone', 'Request client sign-off', 'Export milestone report']}
      relatedPages={[
        { label: 'Milestone Billing', href: '/projects/billing/milestone-billing' },
        { label: 'Project Tasks', href: '/projects/planning/project-tasks' },
        { label: 'Contracts', href: '/projects/project-setup/contracts' },
      ]}
    />
  )
}

