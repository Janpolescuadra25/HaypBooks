'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function WithholdingSetupPage() {
  return (
    <PageDocumentation
      title="Withholding Setup"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Tax Setup / Withholding Setup"
      purpose="Withholding Setup configures all aspects of the business's withholding tax obligations — including the tax categories (compensation, expanded, final), the applicable ATC codes, rates per payee classification, and the GL account assignments for each. This setup drives automatic withholding computation on payroll and purchase transactions, and ensures the correct BIR forms and remittance schedules are triggered for each withholding type."
      components={[
        { name: 'Withholding Type Config', description: 'Table of withholding categories (compensation/expanded/final) with associated BIR forms and frequencies.' },
        { name: 'ATC Code Registry', description: 'List of all Alphanumeric Tax Codes with income classification, applicable rate, and status.' },
        { name: 'Rate Table per ATC', description: 'Configurable rate table for each ATC code with thresholds and applicable percentage.' },
        { name: 'GL Account Assignment', description: 'Map each withholding type to its tax payable liability account and expense account.' },
        { name: 'Remittance Schedule', description: 'Configure payment schedule (monthly/quarterly) and the corresponding BIR form per withholding type.' },
      ]}
      tabs={['Withholding Types', 'ATC Codes', 'Rate Tables', 'GL Assignments', 'Remittance Schedule']}
      features={[
        'Configure all BIR withholding types with corresponding forms',
        'Set up and maintain ATC code registry',
        'Define rates per ATC code and income classification',
        'Map withholding types to GL accounts',
        'Configure remittance schedule per withholding type',
        'Auto-populate vendor withholding from ATC code setup',
      ]}
      dataDisplayed={[
        'Withholding type and BIR form number',
        'ATC code, income classification, and rate',
        'GL account assignments',
        'Remittance frequency and due date',
        'ATC code active/inactive status',
      ]}
      userActions={[
        'Add or update ATC codes and rates',
        'Configure GL account mappings',
        'Set remittance schedule per withholding type',
        'Activate or deactivate ATC codes',
        'Export withholding configuration',
      ]}
    />
  )
}

