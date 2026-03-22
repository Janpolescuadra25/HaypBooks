'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Asset Revaluation"
      module="ACCOUNTING"
      breadcrumb="Accounting / Fixed Assets / Asset Revaluation"
      purpose="Asset Revaluation supports the revaluation model under PAS 16 (and PFRS for SMEs) where certain asset classes (typically land and buildings) are carried at fair value rather than historical cost. Users can record revaluation uplifts (increasing asset value via other comprehensive income) or revaluation decrements/impairments (decreasing asset value to P&L). The system generates the appropriate journal entries and updates the asset's depreciation base to the new revalued amount."
      components={[
        { name: 'Revaluation Entry Form', description: 'Select asset, enter new fair value, revaluation effective date, and valuation basis (independent appraisal reference). System computes revaluation difference.' },
        { name: 'Revaluation Impact Preview', description: 'Shows: old NBV, new fair value, surplus/deficit amount, and journal entry preview with OCI or P&L treatment.' },
        { name: 'Revaluation Surplus Account', description: 'Tracks cumulative revaluation surplus in OCI per asset class with balance history.' },
        { name: 'Revaluation History', description: 'Full history of all revaluations per asset with dates, old values, and new values.' },
        { name: 'Impairment Testing', description: 'Flag assets for impairment testing with impairment loss calculation and journal entry.' },
      ]}
      tabs={['Revalue Asset', 'Surplus Accounts', 'Revaluation History', 'Impairment']}
      features={[
        'Revaluation model support per PAS 16',
        'Automatic OCI vs. P&L treatment determination',
        'Revaluation surplus account tracking',
        'Post-revaluation depreciation recalculation',
        'Impairment testing workflow and loss posting',
        'Valuation evidence document attachment',
        'Revaluation cycle scheduling',
      ]}
      dataDisplayed={[
        'Asset historical cost vs. current revalued amount',
        'Revaluation surplus balance per asset class',
        'Revaluation gain/loss posted to OCI or P&L',
        'Post-revaluation depreciation calculation',
        'Revaluation history per asset',
        'Impairment indicators and test results',
      ]}
      userActions={[
        'Enter new fair value for an asset',
        'Attach valuation report as evidence',
        'Preview and post revaluation journal entries',
        'View revaluation surplus account balance',
        'Record an impairment loss',
        'Schedule next revaluation review',
      ]}
      relatedPages={[
        { label: 'Asset Register', href: '/accounting/fixed-assets/asset-register' },
        { label: 'Depreciation', href: '/accounting/fixed-assets/depreciation' },
        { label: 'FX Revaluation', href: '/accounting/revaluations/fx-revaluation' },
          { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
      ]}
    />
  )
}

