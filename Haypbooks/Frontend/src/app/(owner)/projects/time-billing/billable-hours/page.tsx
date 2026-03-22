'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Billable Hours"
      module="PROJECTS"
      breadcrumb="Projects / Time & Billing / Billable Hours"
      purpose="Billable Hours is the pre-invoicing staging area for time-based billing. All approved timesheet entries coded as billable appear here, organized by project and client. The billing team reviews billable hours, applies hourly billing rates (from rate cards), calculates the amount to bill, and selects which entries to include in the next invoice cycle. Hours can be marked as billed, excluded, discounted, or held. This workflow ensures no billable time is lost to invoicing."
      components={[
        { name: 'Unbilled Hours Queue', description: 'All approved billable timesheet entries not yet invoiced: project, team member, date, task, hours, rate, and amount.' },
        { name: 'Rate Card Application', description: 'Apply billing rates: override the default rate per team member or task type if required by the contract.' },
        { name: 'Bill Selection', description: 'Select hours to include in the next invoice: check/uncheck individual entries, or select all for a project.' },
        { name: 'Invoice Draft Generator', description: 'Convert selected billable hours into an invoice draft for client review.' },
        { name: 'Excluded/Held Hours', description: 'Hours excluded from billing or on hold pending client approval — tracked separately so nothing falls off radar.' },
      ]}
      tabs={['Unbilled Hours', 'Selected for Invoice', 'Billed History', 'Excluded/Held', 'Rate Cards']}
      features={[
        'Complete unbilled hours registry per project',
        'Variable billing rates from rate card',
        'Selection and exclusion of time entries',
        'One-click convert to invoice draft',
        'Prevention of double-billing (hours only appear once)',
        'Held hours tracking for disputed time',
        'Billing analysis: billed vs. unbilled vs. non-billable',
      ]}
      dataDisplayed={[
        'All unbilled approved hours by project',
        'Calculated billing amount per entry',
        'Total unbilled revenue value',
        'Hours by billing status: unbilled, billed, excluded',
        'Oldest unbilled entries (WIP aging)',
      ]}
      userActions={[
        'Review unbilled hours for a project',
        'Apply billing rate from rate card',
        'Select hours for inclusion in invoice',
        'Exclude or hold specific time entries',
        'Generate invoice from selected hours',
        'View billing history per project',
        'Export unbilled hours for client review',
      ]}
      relatedPages={[
        { label: 'Project Invoicing', href: '/projects/time-billing/project-invoicing' },
        { label: 'Project Timesheets', href: '/projects/time-billing/timesheets' },
        { label: 'Invoices', href: '/sales/billing/invoices' },
      ]}
    />
  )
}

