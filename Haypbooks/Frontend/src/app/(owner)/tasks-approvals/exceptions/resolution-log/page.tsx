'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Resolution Log"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Exceptions / Resolution Log"
      purpose="The Resolution Log is the complete historical record of all resolved exceptions, documenting who resolved each exception, when, how it was resolved, and the resolution outcome. It serves as a knowledge base and audit trail for exception handling, enabling teams to learn from past resolutions and demonstrate compliance due diligence."
      components={[
        { name: 'Resolution History List', description: 'Chronological list of all resolved exceptions with type, resolution method, resolver, and date.' },
        { name: 'Resolution Detail', description: 'Full resolution context: exception description, affected record, resolution steps taken, outcome, and resolution time.' },
        { name: 'Search & Filter', description: 'Search by exception type, resolver, date range, or linked record.' },
        { name: 'Resolution Methods Summary', description: 'Breakdown of resolution methods used (Reclassified / Matched / Dismissed / Escalated / Fixed).' },
      ]}
      tabs={['All Resolved', 'By Type', 'By Resolver', 'This Month']}
      features={[
        'Complete resolution audit trail',
        'Search and filter by multiple dimensions',
        'Resolution method breakdown analysis',
        'Average resolution time metrics',
        'Export for compliance reporting',
      ]}
      dataDisplayed={[
        'Exception type and original description',
        'Resolution method and outcome',
        'Resolver name and resolution date/time',
        'Time to resolution',
        'Linked record and module',
        'Resolution notes and follow-up actions',
      ]}
      userActions={[
        'Search resolution log by exception type or resolver',
        'Filter by date range or module',
        'View full resolution detail for any exception',
        'Export resolution log to CSV or PDF',
      ]}
      relatedPages={[
        { label: 'Exception Queue', href: '/tasks-approvals/exceptions/exception-queue' },
        { label: 'By Type', href: '/tasks-approvals/exceptions/by-type' },
        { label: 'My Exceptions', href: '/tasks-approvals/my-work/my-exceptions' },
      ]}
    />
  )
}

