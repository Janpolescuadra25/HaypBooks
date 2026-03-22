'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Journal Post"
      module="ACCOUNTING"
      breadcrumb="Accounting / Period Close / Journal Post"
      purpose="Journal Post is the review and batch-posting tool for all period-end adjusting journal entries — accruals, deferrals, reclassifications, allocations, and eliminations. Unlike day-to-day journal entries, these adjustments are prepared in batch, reviewed and approved before posting, and are often recurring month-end entries. This page consolidates all pending period-end journals for review, approval, and coordinated posting to the GL."
      components={[
        { name: 'Pending Journals Queue', description: 'All adjusting journals awaiting review and posting with type (accrual/deferral/reclassification/allocation/elimination), prepared by, amount, and status.' },
        { name: 'Journal Review Panel', description: 'Expand any journal to see full line items, supporting calculation, and notes before approving.' },
        { name: 'Batch Post', description: 'Select all or a subset of approved journals and post them to the GL in a single batch action.' },
        { name: 'Recurring Journal Templates', description: 'Pre-configured recurring period-end journals (e.g., prepaid expense amortization) with auto-populated amounts.' },
        { name: 'Post Log', description: 'Archive of all journals posted for the period with posting timestamp and user.' },
      ]}
      tabs={['Pending', 'Approved', 'Recurring Templates', 'Posted', 'Batch Post']}
      features={[
        'Batch review and approval of period-end journals',
        'Recurring journal template management',
        'One-click batch posting after approval',
        'Auto-calculation of recurring amounts (prepaid, accruals)',
        'Maker-checker workflow for journal approval',
        'Period-end journal set management by close phase',
      ]}
      dataDisplayed={[
        'All pending adjusting journals with type and amount',
        'Journal approval status',
        'Recurring journal templates with auto-amounts',
        'Total debit/credit of pending batch',
        'Posted journal archive for the period',
      ]}
      userActions={[
        'Review a pending period-end journal',
        'Approve journals for posting',
        'Edit a journal before approval',
        'Run recurring journal templates',
        'Batch post all approved journals',
        'Return a journal for correction',
        'View post log after posting',
      ]}
      relatedPages={[
        { label: 'Close Checklist', href: '/accounting/period-close/close-checklist' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Lock Periods', href: '/accounting/period-close/lock-periods' },
      ]}
    />
  )
}

