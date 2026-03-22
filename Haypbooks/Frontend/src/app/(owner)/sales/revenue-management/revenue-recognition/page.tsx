'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Revenue Recognition'
      module='SALES'
      breadcrumb='Sales / Revenue Management / Revenue Recognition'
      purpose='Centralized control center for all revenue recognition activities, providing oversight of the full revenue recognition lifecycle from contract setup through period recognition and disclosure. Ensures compliance with IFRS 15 and ASC 606 across all revenue streams.'
      components={[
        { name: 'Recognition Overview Dashboard', description: 'Summary of recognized, deferred, and remaining performance obligation balances' },
        { name: 'Period Close Revenue Checklist', description: 'Checklist of all recognition entries required for month-end close' },
        { name: 'Revenue Recognition Policy Center', description: 'Documents and enforces revenue recognition policies by product and service type' },
        { name: 'Exception Report', description: 'Flags transactions where recognition criteria may not be met or are inconsistently applied' },
        { name: 'Disclosure Package Builder', description: 'Generates ASC 606 / IFRS 15 footnote disclosures for financial statement preparation' },
      ]}
      tabs={['Recognition Overview', 'Period Close', 'Policy Center', 'Exceptions', 'Disclosures']}
      features={['Complete IFRS 15 / ASC 606 recognition lifecycle', 'Period close revenue recognition checklist', 'Policy enforcement for recognition rules', 'Exception detection and flagging', 'Automated disclosure package generation', 'Remaining performance obligation (RPO) reporting', 'Multi-entity revenue recognition consolidation']}
      dataDisplayed={['Total revenue recognized this period', 'Total deferred revenue balance', 'Remaining performance obligations (RPO)', 'Recognition exceptions count', 'Period close completion percentage', 'Revenue by recognition method', 'Year-over-year recognized revenue comparison']}
      userActions={['Review revenue recognition dashboard', 'Complete period close recognition checklist', 'Investigate recognition exceptions', 'Update recognition policies', 'Generate RPO disclosure', 'Approve recognition journal entries', 'Export ASC 606 disclosure package']}
      relatedPages={[
        { label: 'Contract Revenue', href: '/sales/revenue-management/contract-revenue' },
        { label: 'Deferred Revenue', href: '/sales/revenue-management/deferred-revenue' },
        { label: 'Subscription Billing', href: '/sales/revenue-management/subscription-billing' },
      ]}
    />
  )
}

