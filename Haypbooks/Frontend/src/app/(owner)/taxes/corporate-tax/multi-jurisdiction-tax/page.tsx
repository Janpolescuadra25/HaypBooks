'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function MultiJurisdictionTaxPage() {
  return (
    <PageDocumentation
      title="Multi-Jurisdiction Tax"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Corporate Tax / Multi-Jurisdiction Tax"
      purpose="Multi-Jurisdiction Tax manages tax obligations when the business operates across multiple states, provinces, or countries, each with distinct tax rates, apportionment formulas, and filing requirements. This module allocates income using configured apportionment factors (sales, property, payroll) and tracks tax obligations separately per jurisdiction. It prevents double taxation and ensures compliance with nexus rules in each operating region."
      components={[
        { name: 'Jurisdiction Registry', description: 'Table of all jurisdictions where the business has nexus, with tax rates and apportionment methods.' },
        { name: 'Apportionment Formula Config', description: 'Setup for the apportionment factor weights (equal-weighted or sales-weighted payroll-property-sales).' },
        { name: 'Income Allocation Summary', description: 'Matrix showing income allocated to each jurisdiction after applying apportionment formulas.' },
        { name: 'Nexus Determination Tool', description: 'Assessment wizard to determine whether activities in a location create taxable nexus.' },
        { name: 'Filing Calendar by Jurisdiction', description: 'Calendar overlay showing filing deadlines per jurisdiction to prevent missed obligations.' },
      ]}
      tabs={['Jurisdictions', 'Apportionment', 'Income Allocation', 'Nexus Assessment', 'Filing Calendar']}
      features={[
        'Register all active tax jurisdictions with individual rates',
        'Configure apportionment formula per jurisdiction type',
        'Allocate income across jurisdictions automatically',
        'Assess nexus exposure in new markets',
        'Track tax filing deadlines per jurisdiction on a calendar',
        'Generate combined vs. separate entity filing analysis',
      ]}
      dataDisplayed={[
        'Jurisdiction name, type, and statutory tax rate',
        'Apportionment factors (sales %, property %, payroll %)',
        'Income allocated per jurisdiction',
        'Tax liability per jurisdiction',
        'Filing due dates per jurisdiction',
      ]}
      userActions={[
        'Add or update jurisdiction registrations',
        'Configure apportionment formula weights',
        'Run income allocation calculation',
        'Assess nexus in a new location',
        'View and export jurisdiction filing calendar',
      ]}
    />
  )
}

