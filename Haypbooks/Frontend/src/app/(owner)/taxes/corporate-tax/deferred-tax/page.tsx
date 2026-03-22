'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DeferredTaxPage() {
  return (
    <PageDocumentation
      title="Deferred Tax"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Corporate Tax / Deferred Tax"
      purpose="Deferred Tax manages the recognition and tracking of temporary differences between accounting income and taxable income that create future tax obligations or assets. This module calculates deferred tax liabilities (DTL) and deferred tax assets (DTA) arising from timing differences on depreciation, provisions, and revenue recognition. Proper deferred tax management ensures compliance with IAS 12 and ASC 740 and prevents surprises at year-end tax settlement."
      components={[
        { name: 'Temporary Differences Table', description: 'Tracks each timing difference: carrying amount, tax base, and resulting deferred tax asset or liability.' },
        { name: 'DTA / DTL Summary Cards', description: 'KPI cards showing total deferred tax asset, total deferred tax liability, and net deferred tax position.' },
        { name: 'Tax Rate Configuration', description: 'Input for the enacted tax rate used to calculate deferred tax balances per jurisdiction.' },
        { name: 'Movement Ledger', description: 'Period-by-period movement schedule showing opening balance, additions, reversals, and closing balance.' },
        { name: 'Recovery Assessment Panel', description: 'Tool to assess probability of DTA recovery and flag any valuation allowance requirements.' },
      ]}
      tabs={['Summary', 'Temporary Differences', 'Movement Schedule', 'Valuation Allowance']}
      features={[
        'Identify and quantify all taxable and deductible temporary differences',
        'Calculate DTA and DTL balances using enacted statutory tax rates',
        'Generate deferred tax movement schedule for period-end reporting',
        'Assess DTA recoverability and apply valuation allowances where needed',
        'Roll forward deferred tax positions across accounting periods',
        'Link to IAS 12 / ASC 740 disclosure notes in financial statements',
      ]}
      dataDisplayed={[
        'Temporary difference type and carrying amounts',
        'Tax base and net temporary difference',
        'Deferred tax asset or liability per difference',
        'Net DTA/(DTL) position and movement',
        'Enacted tax rate and jurisdiction',
      ]}
      userActions={[
        'Add or update temporary difference entries',
        'Set statutory tax rate per jurisdiction',
        'Apply or remove valuation allowance on DTA',
        'Generate movement schedule report',
        'Export deferred tax schedule for audit',
      ]}
    />
  )
}

