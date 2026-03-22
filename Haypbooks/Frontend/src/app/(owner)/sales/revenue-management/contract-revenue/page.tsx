'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Contract Revenue'
      module='SALES'
      breadcrumb='Sales / Revenue Management / Contract Revenue'
      purpose='Manages revenue recognition for contract-based arrangements, ensuring revenue is recognized in accordance with performance obligations under IFRS 15 / ASC 606. Tracks contract assets, contract liabilities, and ensures compliance with multi-element arrangement accounting.'
      components={[
        { name: 'Contract Performance Obligations', description: 'Lists all performance obligations per contract with allocation of transaction price' },
        { name: 'Revenue Recognition Schedule', description: 'Period-by-period schedule of revenue to be recognized per contract' },
        { name: 'Contract Asset & Liability Ledger', description: 'Tracks unbilled receivables (contract assets) and advance payments (contract liabilities)' },
        { name: 'SSP (Standalone Selling Price) Manager', description: 'Stores and updates standalone selling prices for performance obligation allocation' },
        { name: 'Modification Tracker', description: 'Handles contract modifications and their impact on revenue recognition' },
      ]}
      tabs={['Contract List', 'Performance Obligations', 'Recognition Schedule', 'Contract Assets & Liabilities']}
      features={['IFRS 15 / ASC 606 compliant revenue recognition', 'Multi-element arrangement allocation', 'Contract modification handling', 'Contract asset and liability tracking', 'Automated recognition schedule generation', 'Cumulative catch-up adjustment calculation', 'Disclosure report generation']}
      dataDisplayed={['Contract ID and customer', 'Total transaction price', 'Performance obligations identified', 'Allocated price per obligation', 'Revenue recognized to date', 'Remaining performance obligation (RPO)', 'Contract asset or liability balance']}
      userActions={['Set up contract performance obligations', 'Allocate transaction price to obligations', 'Record contract modifications', 'Generate recognition schedule', 'Post period revenue recognition entries', 'Review contract assets and liabilities', 'Generate disclosure report']}
      relatedPages={[
        { label: 'Revenue Recognition', href: '/sales/revenue-management/revenue-recognition' },
        { label: 'Deferred Revenue', href: '/sales/revenue-management/deferred-revenue' },
        { label: 'Subscription Billing', href: '/sales/revenue-management/subscription-billing' },
      ]}
    />
  )
}

