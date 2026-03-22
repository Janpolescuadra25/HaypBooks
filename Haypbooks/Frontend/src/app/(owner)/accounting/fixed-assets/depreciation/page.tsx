'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Depreciation"
      module="ACCOUNTING"
      breadcrumb="Accounting / Fixed Assets / Depreciation"
      purpose="The Depreciation page manages the calculation and posting of periodic depreciation charges for all depreciable assets. It supports straight-line, declining balance (double-declining and 150%), sum-of-years-digits, and units-of-production methods. Users can run a depreciation preview before finalizing, post depreciation journal entries to the GL, and view the full depreciation history for any asset or period. This page ensures accurate periodic expense recognition per PAS 16 and PFRS."
      components={[
        { name: 'Depreciation Run Panel', description: 'Select period and click Calculate to preview depreciation for all assets. Shows total depreciation amount, asset count, and any errors.' },
        { name: 'Depreciation Preview Table', description: 'Pre-posting preview: asset, method, opening NBV, depreciation amount, and closing NBV for the period.' },
        { name: 'Post to GL Button', description: 'After review, post all depreciation entries to the GL as a single batch journal entry.' },
        { name: 'Depreciation History', description: 'Archive of all prior depreciation runs with period, total amount, posting date, and journal entry reference.' },
        { name: 'Method Override', description: 'Temporarily override depreciation method for a specific asset for the period.' },
      ]}
      tabs={['Run Depreciation', 'Preview', 'History', 'Schedule Comparison']}
      features={[
        'Multi-method depreciation calculation engine',
        'Preview before posting to catch errors',
        'Batch GL posting of all depreciation entries',
        'Partial period proration for new assets',
        'Depreciation catch-up for prior missed periods',
        'Tax depreciation vs. book depreciation tracking',
        'Depreciation audit trail per asset',
      ]}
      dataDisplayed={[
        'Depreciation amount per asset for the period',
        'Opening and closing NBV per asset',
        'Total depreciation amount for the run',
        'Depreciation history by period',
        'Assets with method overrides',
        'Accumulated depreciation running balance',
      ]}
      userActions={[
        'Calculate depreciation for a period',
        'Review the depreciation preview before posting',
        'Post depreciation journal entries to GL',
        'Override depreciation for a specific asset',
        'View depreciation history for an asset',
        'Reverse a depreciation posting if needed',
      ]}
      relatedPages={[
        { label: 'Asset Register', href: '/accounting/fixed-assets/asset-register' },
        { label: 'Asset Disposal', href: '/accounting/fixed-assets/asset-disposal' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Period Close', href: '/accounting/period-close/close-checklist' },
      ]}
    />
  )
}

