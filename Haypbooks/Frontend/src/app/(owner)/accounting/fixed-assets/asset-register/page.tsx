'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Asset Register"
      module="ACCOUNTING"
      breadcrumb="Accounting / Fixed Assets / Asset Register"
      purpose="The Asset Register is the complete inventory of all tangible and intangible assets owned by the company. Each asset record captures the acquisition date, cost, accumulated depreciation, net book value, useful life, depreciation method, location, and current status. The asset register integrates with the GL to post depreciation entries and serves as the primary tool for fixed asset accounting, audit support, insurance valuation, and capital expenditure tracking."
      components={[
        { name: 'Asset List', description: 'Grid of all assets with: asset number, name, category, acquisition date, cost, accumulated depreciation, NBV, and status.' },
        { name: 'Asset Detail Card', description: 'Full profile for each asset: description, serial number, location, custodian, depreciation method, useful life, residual value, and GL accounts.' },
        { name: 'Depreciation Summary', description: 'Monthly depreciation schedule showing opening NBV, depreciation amount, and closing NBV for each asset.' },
        { name: 'Category Summary', description: 'Asset portfolio summary by category (Land, Buildings, Vehicles, Equipment, Furniture, Software, Intangibles).' },
        { name: 'Capital Expenditure Tracker', description: 'Track approved CapEx budget vs. actual spending on new asset acquisitions.' },
      ]}
      tabs={['All Assets', 'By Category', 'Depreciation Schedule', 'Disposals', 'CapEx Tracker']}
      features={[
        'Complete fixed asset register with all accounting data',
        'Multiple depreciation methods: straight-line, declining balance, sum-of-years',
        'Automatic depreciation journal entry posting to GL',
        'Asset location and custodian tracking',
        'Asset disposal workflow with gain/loss calculation',
        'Capital expenditure tracking vs. budget',
        'Export asset register for audit and insurance',
      ]}
      dataDisplayed={[
        'Asset number, name, category, and location',
        'Acquisition cost and date',
        'Accumulated depreciation and net book value',
        'Monthly depreciation amount',
        'Useful life remaining (years/months)',
        'Depreciation method and rate',
      ]}
      userActions={[
        'Add a new asset to the register',
        'Run monthly depreciation for all assets',
        'Dispose or transfer an asset',
        'Update asset details or reclassify',
        'Revalue an asset (PFRS 16 revaluation model)',
        'Export asset register to Excel for audit',
        'Generate depreciation journal entries',
      ]}
      relatedPages={[
        { label: 'Depreciation', href: '/accounting/fixed-assets/depreciation' },
        { label: 'Asset Disposal', href: '/accounting/fixed-assets/asset-disposal' },
        { label: 'Asset Revaluation', href: '/accounting/fixed-assets/asset-revaluation' },
          { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
      ]}
    />
  )
}

