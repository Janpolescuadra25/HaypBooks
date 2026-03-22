'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Allocation History"
      module="ACCOUNTING"
      breadcrumb="Accounting / Allocations / Allocation History"
      purpose="Allocation History provides a searchable archive of all allocation runs — showing which rules ran, when, what amounts were allocated, and the resulting journal entry references. It supports audit inquiries about how overhead was distributed and allows users to drill through to the underlying journal entries. Reverse allocation entries are also tracked here with the reason for reversal."
      components={[
        { name: 'Run History Table', description: 'All past allocation runs with period, run date, rules executed, total amounts posted, and journal entry batch reference.' },
        { name: 'Drill-Down View', description: 'Per-run detail showing each allocation rule, source amount, and breakdown by target cost center.' },
        { name: 'Journal Entry Link', description: 'Direct link from each run to the corresponding journal entry in the GL.' },
        { name: 'Reversal Log', description: 'List of all reversed allocation runs with reversal reason and reversal journal entry.' },
      ]}
      tabs={['Run History', 'Reversals', 'By Rule', 'By Period']}
      features={[
        'Full historical archive of all allocation runs',
        'Drill-through to journal entry from allocation run',
        'Reversal tracking with reason documentation',
        'Filter by period, rule, or cost center',
        'Export allocation history for audit',
      ]}
      dataDisplayed={[
        'All allocation runs with period and amounts',
        'Rules executed per run and amounts per rule',
        'Target cost center distribution per run',
        'Journal entry reference per run',
        'Reversed runs with reason and reversal entry',
      ]}
      userActions={[
        'View details of a prior allocation run',
        'Drill through to GL journal entry',
        'Filter history by period or rule',
        'Export allocation history to Excel',
        'Initiate reversal of a prior run',
      ]}
      relatedPages={[
        { label: 'Allocation Rules', href: '/accounting/allocations/allocation-rules' },
        { label: 'Run Allocations', href: '/accounting/allocations/run-allocations' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
      ]}
    />
  )
}

