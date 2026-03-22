'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Run Allocations"
      module="ACCOUNTING"
      breadcrumb="Accounting / Allocations / Run Allocations"
      purpose="Run Allocations is the execution page for running all configured allocation rules for a specified period. Once run, the system calculates and posts the allocation journal entries to the GL, distributing shared costs from source accounts to target cost centers based on the configured rules. Users can run all rules at once or run individual rules. A preview mode allows review of allocation amounts before posting."
      components={[
        { name: 'Allocation Run Controls', description: 'Select period and choose: run all active rules or select specific rules. Preview or Post options.' },
        { name: 'Allocation Preview Table', description: 'Pre-posting table showing: source account, amount being allocated, target cost centers, and allocation amounts per target.' },
        { name: 'Post to GL', description: 'After preview review, post all allocation entries to the GL as journal entries.' },
        { name: 'Run Status', description: 'After posting, confirmation showing number of journal lines posted, total amount allocated, and any errors.' },
      ]}
      tabs={['Run', 'Preview', 'Recent Runs']}
      features={[
        'Run all allocation rules for a period in one action',
        'Preview mode before GL posting',
        'Individual rule or bulk run options',
        'Automatic journal entry generation per rule',
        'Error handling for missing driver data',
        'Allocation reversal if correction needed',
      ]}
      dataDisplayed={[
        'Active rules included in the run',
        'Allocation amounts per source account',
        'Distribution to target cost centers',
        'Total amount allocated per rule',
        'Errors or warnings from the run',
        'Recent run history',
      ]}
      userActions={[
        'Select period and run all allocations',
        'Preview allocation amounts before posting',
        'Post allocation journal entries to GL',
        'Run a single specific rule',
        'Reverse a prior period allocation run',
        'View previous runs and journals created',
      ]}
      relatedPages={[
        { label: 'Allocation Rules', href: '/accounting/allocations/allocation-rules' },
        { label: 'Allocation History', href: '/accounting/allocations/allocation-history' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
      ]}
    />
  )
}

