'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Work in Progress (WIP)'
      module='PROJECTS'
      breadcrumb='Projects / Billing / Work in Progress'
      purpose='Tracks unbilled work in progress across all active projects, providing visibility into revenue earned but not yet invoiced. Monitors WIP accumulation, facilitates timely billing, and ensures accurate period-end financial reporting by distinguishing earned revenue from billed revenue.'
      components={[
        { name: 'WIP Summary Dashboard', description: 'Aggregate view of WIP balances by project, client, and project manager' },
        { name: 'WIP Aging Table', description: 'Breaks WIP into age buckets to flag stale unbilled work requiring attention' },
        { name: 'Billing Readiness Indicator', description: 'Highlights projects meeting billing thresholds or schedule triggers' },
        { name: 'WIP Journal Entry Generator', description: 'Creates period-end accrual entries for WIP recognition' },
        { name: 'Over/Under Billing Analysis', description: 'Compares earned revenue to billed revenue to identify overbilling or underbilling' },
      ]}
      tabs={['WIP Summary', 'WIP Aging', 'Overbilling / Underbilling', 'Period-End Entries']}
      features={['Real-time WIP balance calculation', 'Over-billing and under-billing detection', 'WIP aging by project and age bucket', 'Period-end WIP journal entry generation', 'Drill-down from WIP to underlying time and expense entries', 'WIP roll-forward report', 'Project manager WIP accountability view']}
      dataDisplayed={['Total WIP balance per project', 'WIP by age bucket (0–30, 31–60, 61+ days)', 'Earned revenue to date', 'Billed revenue to date', 'Over/under billing amount', 'Last invoice date per project', 'WIP trend over periods']}
      userActions={['Review WIP aging report', 'Initiate billing from WIP queue', 'Generate period-end WIP journal entries', 'Identify and escalate stale WIP', 'Drill into WIP detail by project', 'Export WIP report for management', 'Reconcile WIP to general ledger']}
      relatedPages={[
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Project Profitability', href: '/projects/financials/project-profitability' },
        { label: 'Billable Review', href: '/projects/tracking/billable-review' },
      ]}
    />
  )
}

