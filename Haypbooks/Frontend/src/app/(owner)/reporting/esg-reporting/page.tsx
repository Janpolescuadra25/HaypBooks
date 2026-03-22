'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='ESG Reporting'
      module='REPORTING'
      breadcrumb='Reporting / ESG Reporting'
      purpose='Supports Environmental, Social, and Governance (ESG) data collection, metric tracking, and disclosure reporting. Enables organizations to track sustainability metrics, prepare ESG disclosures in GRI, SASB, and TCFD frameworks, and demonstrate accountability to stakeholders.'
      components={[
        { name: 'ESG Metrics Dashboard', description: 'Overview of environmental, social, and governance KPIs in one view' },
        { name: 'Framework Alignment Mapper', description: 'Maps collected data to GRI Standards, SASB, TCFD, and SEC climate rules' },
        { name: 'Data Collection Forms', description: 'Structured forms for capturing energy use, waste, workforce, and governance data' },
        { name: 'ESG Disclosure Generator', description: 'Produces formatted ESG reports suitable for annual reports and investor communications' },
        { name: 'Year-over-Year Comparison', description: 'Tracks ESG metric improvement or deterioration over reporting periods' },
      ]}
      tabs={['Environmental', 'Social', 'Governance', 'Disclosures', 'Framework Mapping']}
      features={['Multi-framework support: GRI, SASB, TCFD', 'Structured ESG data collection forms', 'Automated ESG disclosure document generation', 'Year-over-year ESG trend tracking', 'Audit trail for ESG data entries', 'Goal-setting for ESG improvement', 'Export for sustainability reports and investor packs']}
      dataDisplayed={['Carbon emissions (Scope 1, 2, 3)', 'Energy consumption and renewable percentage', 'Water usage and waste metrics', 'Workforce diversity and inclusion metrics', 'Employee safety incident rates', 'Board composition and governance metrics', 'ESG goal progress']}
      userActions={['Enter environmental metrics', 'Record social and workforce data', 'Update governance disclosures', 'Map data to ESG framework', 'Generate ESG disclosure report', 'Set ESG improvement goals', 'Export ESG report package']}
      relatedPages={[
        { label: 'Performance Center', href: '/reporting/performance-center' },
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Custom Reports', href: '/reporting/custom-reports' },
      ]}
    />
  )
}

