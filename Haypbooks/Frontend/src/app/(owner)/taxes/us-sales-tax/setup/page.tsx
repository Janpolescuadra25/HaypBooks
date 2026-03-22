'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function UsSalesTaxSetupPage() {
  return (
    <PageDocumentation
      title="US Sales Tax Setup"
      module="TAXES"
      badge="US ONLY"
      breadcrumb="Taxes / US Sales Tax / Setup"
      purpose="US Sales Tax Setup configures state and local sales tax collection obligations for the business across all US jurisdictions where it has nexus — whether economic, physical, or marketplace nexus. This setup links to each state's required tax rates (which vary by county and city), configures product taxability rules, and manages exemption certificate workflows. Keeping sales tax setup current with nexus determinations and rate changes is critical after South Dakota v. Wayfair changed the US economic nexus landscape."
      components={[
        { name: 'Nexus State Registry', description: 'Map-based and table-based view of all US states where nexus is established with registration numbers.' },
        { name: 'Rate Lookup Integration', description: 'Integration with a sales tax rate database (e.g., Avalara, TaxJar) for real-time jurisdiction rates.' },
        { name: 'Product Taxability Matrix', description: 'Grid of product/service categories vs. states showing taxability status for each combination.' },
        { name: 'Exemption Certificate Vault', description: 'Store and manage customer sales tax exemption certificates with validity tracking.' },
        { name: 'Economic Nexus Thresholds', description: 'Dashboard showing YTD sales per state vs. economic nexus thresholds to flag approaching limits.' },
      ]}
      tabs={['Nexus States', 'Rate Configuration', 'Product Taxability', 'Exemption Certificates', 'Economic Nexus Tracker']}
      features={[
        'Register all nexus states with registration numbers',
        'Connect to real-time rate database for accurate jurisdiction rates',
        'Configure product taxability per state',
        'Store and manage customer exemption certificates',
        'Monitor economic nexus thresholds per state',
        'Alert when approaching economic nexus in new states',
      ]}
      dataDisplayed={[
        'Nexus states and registration numbers',
        'Current sales tax rates by jurisdiction',
        'Product taxability status per state',
        'Exemption certificate expiry dates',
        'YTD sales vs. economic nexus thresholds',
      ]}
      userActions={[
        'Add or remove nexus states',
        'Connect rate database integration',
        'Configure product taxability overrides',
        'Upload customer exemption certificates',
        'Review economic nexus threshold dashboard',
      ]}
    />
  )
}

