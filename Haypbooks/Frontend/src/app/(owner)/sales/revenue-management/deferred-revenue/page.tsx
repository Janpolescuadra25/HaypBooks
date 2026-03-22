'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Deferred Revenue'
      module='SALES'
      breadcrumb='Sales / Revenue Management / Deferred Revenue'
      purpose='Tracks and manages revenue received in advance that has not yet been earned, ensuring it is recorded as a liability and recognized as revenue over the performance period. Essential for subscription businesses, prepaid services, and any revenue earned over time.'
      components={[
        { name: 'Deferred Revenue Ledger', description: 'Account-level listing of all deferred revenue balances with associated contracts and customers' },
        { name: 'Recognition Waterfall', description: 'Visual waterfall chart showing deferred balance release into revenue month by month' },
        { name: 'Journal Entry Generator', description: 'Automatically creates monthly journal entries to reclassify deferred to earned revenue' },
        { name: 'Balance Roll-Forward', description: 'Period-by-period movement schedule: opening balance, new deferrals, recognized, ending' },
        { name: 'Overage Alert', description: 'Flags deferred balances not recognized within expected performance period' },
      ]}
      tabs={['Deferred Balance', 'Recognition Schedule', 'Journal Entries', 'Roll-Forward']}
      features={['Automated recognition schedule generation', 'Monthly journal entry automation', 'Balance roll-forward reporting', 'Performance period overage alerts', 'Integration with subscription billing', 'Audit-ready deferred revenue documentation', 'Multi-currency deferred revenue support']}
      dataDisplayed={['Customer and contract linked to deferral', 'Original deferred amount', 'Recognition start and end dates', 'Monthly recognition amount', 'Revenue recognized to date', 'Remaining deferred balance', 'Associated deferred revenue GL account']}
      userActions={['Record new deferred revenue', 'Set recognition schedule', 'Post monthly recognition entries', 'View deferred revenue ledger', 'Run balance roll-forward', 'Generate deferred revenue disclosure', 'Export recognition schedule']}
      relatedPages={[
        { label: 'Contract Revenue', href: '/sales/revenue-management/contract-revenue' },
        { label: 'Revenue Recognition', href: '/sales/revenue-management/revenue-recognition' },
        { label: 'Subscription Billing', href: '/sales/revenue-management/subscription-billing' },
      ]}
    />
  )
}

