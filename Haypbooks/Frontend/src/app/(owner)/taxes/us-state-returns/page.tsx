'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function UsStateReturnsPage() {
  return (
    <PageDocumentation
      title="US State Returns"
      module="TAXES"
      badge="US ONLY"
      breadcrumb="Taxes / US State Returns"
      purpose="US State Returns manages the preparation and filing of state income tax and franchise tax returns for all states where the business has a filing obligation. With different forms, rates, apportionment formulas, and due dates per state, this module centralizes the multi-state compliance workflow to prevent missed filings. It supports state income tax apportionment from the Multi-Jurisdiction Tax module and integrates state e-filing portals where available."
      components={[
        { name: 'State Return Dashboard', description: 'Overview table of all states with filing obligations, return type, status, and due date.' },
        { name: 'Apportionment Integration', description: 'Imports apportionment factors from the Multi-Jurisdiction Tax module for each state return.' },
        { name: 'State-Specific Schedule Builder', description: 'Populates state-specific modifications and additions/subtractions schedules from GL data.' },
        { name: 'E-Filing by State', description: 'State portal integration for states supporting direct e-filing submission.' },
        { name: 'Estimated State Tax Tracker', description: 'Tracks quarterly estimated state income tax payment obligations per filing state.' },
      ]}
      tabs={['State Returns Overview', 'Return Preparation', 'Estimated Payments', 'E-Filing Status']}
      features={[
        'Manage state return obligations across all nexus states',
        'Import apportionment data from multi-jurisdiction tax module',
        'Populate state-specific modification schedules',
        'E-file to state portals where integration is available',
        'Track quarterly estimated state tax payments',
        'View all due dates on a unified state compliance calendar',
      ]}
      dataDisplayed={[
        'Filing state and return form type',
        'Apportionment percentage per state',
        'State taxable income and tax computed',
        'Filing status and confirmation number',
        'Estimated payment schedule per state',
      ]}
      userActions={[
        'Prepare state return with apportionment data',
        'Populate state modification schedules',
        'Record estimated state tax payment',
        'E-file where state portal available',
        'View state compliance calendar',
      ]}
    />
  )
}

