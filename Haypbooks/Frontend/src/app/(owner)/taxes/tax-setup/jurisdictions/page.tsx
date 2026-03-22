'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function JurisdictionsPage() {
  return (
    <PageDocumentation
      title="Jurisdictions"
      module="TAXES"
      breadcrumb="Taxes / Tax Setup / Jurisdictions"
      purpose="Jurisdictions registers all the geographic tax jurisdictions in which the business has tax obligations — countries, states, provinces, and cities — and associates the applicable tax rules, rates, and filing requirements for each. This foundational setup drives automatic jurisdiction-based tax calculation on transactions and ensures the correct rules are applied based on the transaction's location. Multi-jurisdiction businesses use this to manage their full compliance footprint."
      components={[
        { name: 'Jurisdiction Registry Table', description: 'List of all registered jurisdictions with type (country/state/city), tax system, and status.' },
        { name: 'Jurisdiction Detail Form', description: 'Configuration form for each jurisdiction: tax authority, registration number, and applicable tax types.' },
        { name: 'Tax Type Assignment', description: 'Assign which tax types (VAT, GST, Sales Tax, Withholding) apply within each jurisdiction.' },
        { name: 'Nexus Tracking', description: 'Mark which jurisdictions have established nexus requiring collection and registration.' },
        { name: 'Registration Status', description: 'Track registration date, registration number, and renewal dates per jurisdiction.' },
      ]}
      tabs={['All Jurisdictions', 'Active', 'Nexus Established', 'Registration Status']}
      features={[
        'Register all tax jurisdictions with applicable tax systems',
        'Assign tax types and rates per jurisdiction',
        'Track nexus status and obligated registration per location',
        'Store registration numbers and renewal dates',
        'Link jurisdictions to filing schedules and due dates',
        'Deactivate jurisdictions when nexus is removed',
      ]}
      dataDisplayed={[
        'Jurisdiction name, type, and country',
        'Applicable tax types',
        'Registration number and status',
        'Nexus determination date',
        'Associated tax rates and rates effective date',
      ]}
      userActions={[
        'Add a new tax jurisdiction',
        'Assign tax types to a jurisdiction',
        'Mark nexus establishment',
        'Enter or update registration number',
        'Deactivate an inactive jurisdiction',
      ]}
    />
  )
}

