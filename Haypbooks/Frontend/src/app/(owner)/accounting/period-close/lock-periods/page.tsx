'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Lock Periods"
      module="ACCOUNTING"
      breadcrumb="Accounting / Period Close / Lock Periods"
      purpose="Lock Periods controls which accounting periods are open for transaction entry and which are locked (closed). Once a period is locked, no new transactions can be posted to that period — preserving the integrity of closed financial statements. Administrators can soft-lock a period (warning but allows override) or hard-lock it (no entry allowed). Unlocking a prior period requires administrator rights and an audit trail entry explaining the reason."
      components={[
        { name: 'Period Status Grid', description: 'All fiscal periods listed with status: Open, Soft Lock (warning), Hard Lock (closed), or Future. Colored indicators per status.' },
        { name: 'Lock/Unlock Controls', description: 'Buttons to soft lock, hard lock, or unlock a period with confirmation dialog and reason entry.' },
        { name: 'Lock History Log', description: 'Immutable audit trail of all lock/unlock events: period, action, performed by, and timestamp.' },
        { name: 'Current Period Indicator', description: 'Prominent display of the currently active (open) fiscal period.' },
        { name: 'Year-End Close Banner', description: 'Guided year-end close section with steps to roll over retained earnings and open new fiscal year.' },
      ]}
      tabs={['Period Status', 'Lock History', 'Year-End Close']}
      features={[
        'Granular period open/soft-lock/hard-lock controls',
        'Immutable lock history for audit compliance',
        'Bulk lock prior periods (lock all before a date)',
        'Unlock with mandatory reason documentation',
        'Year-end retained earnings rollover workflow',
        'New fiscal year opening automation',
        'Period status visible to all users during entry',
      ]}
      dataDisplayed={[
        'All fiscal periods with current status',
        'Lock/unlock history with user and reason',
        'Currently open period(s)',
        'Year-end close progress indicators',
        'Retained earnings account balance for rollover',
      ]}
      userActions={[
        'Soft lock a completed period',
        'Hard lock a period after all reviews complete',
        'Unlock a period with documented reason',
        'Bulk lock all prior year periods',
        'Initiate year-end retained earnings rollover',
        'Open a new fiscal year',
        'View lock history for audit',
      ]}
      relatedPages={[
        { label: 'Close Checklist', href: '/accounting/period-close/close-checklist' },
        { label: 'Journal Post', href: '/accounting/period-close/journal-post' },
        { label: 'Period Reports', href: '/accounting/period-close/period-reports' },
        { label: 'Filing Calendar', href: '/organization/governance/filing-calendar' },
      ]}
    />
  )
}

