'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Asset Disposal"
      module="ACCOUNTING"
      breadcrumb="Accounting / Fixed Assets / Asset Disposal"
      purpose="Asset Disposal manages the retirement, sale, or write-off of fixed assets. When an asset is disposed of, the system calculates the gain or loss on disposal (difference between net book value and proceeds received), removes the asset cost and accumulated depreciation from the GL, and posts the resulting gain/loss to the appropriate P&L account. This page handles the full disposal accounting workflow including partial disposals and insurance write-offs."
      components={[
        { name: 'Disposal Form', description: 'Select asset, disposal type (sale, write-off, trade-in), disposal date, and sale proceeds. System calculates gain/loss automatically.' },
        { name: 'Gain/Loss Calculation', description: 'Clear breakdown: NBV at disposal date, less proceeds, equals gain or (loss) on disposal.' },
        { name: 'Journal Entry Preview', description: 'Preview of the disposal journal entry: debit accumulated depreciation + debit cash/bank proceeds, credit asset cost, credit/debit gain or loss.' },
        { name: 'Disposal History', description: 'Archive of all disposed assets with disposal date, type, NBV, proceeds, and gain/loss.' },
        { name: 'Disposed Asset Status', description: 'Once disposed, asset shows as "Disposed" in the register with disposal date and reason.' },
      ]}
      tabs={['Dispose Asset', 'Disposal History', 'Gain/Loss Summary']}
      features={[
        'Full disposal accounting with gain/loss calculation',
        'Multiple disposal types: sale, scrapping, trade-in, write-off, insurance claim',
        'Automatic journal entry generation for disposal',
        'Partial disposal support for partially disposed assets',
        'Disposal authorization workflow for high-value assets',
        'Integration with asset register to update status',
      ]}
      dataDisplayed={[
        'Asset NBV at disposal date',
        'Disposal proceeds received',
        'Gain or (loss) on disposal',
        'Disposal journal entry details',
        'All historical disposals with amounts',
        'YTD gain/loss on disposal total',
      ]}
      userActions={[
        'Record sale/write-off/trade-in of an asset',
        'Enter disposal proceeds',
        'Review and post disposal journal entry',
        'View disposal history',
        'Export disposal schedule for audit',
        'Approve high-value disposal (if approval required)',
      ]}
      relatedPages={[
        { label: 'Asset Register', href: '/accounting/fixed-assets/asset-register' },
        { label: 'Depreciation', href: '/accounting/fixed-assets/depreciation' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
      ]}
    />
  )
}

