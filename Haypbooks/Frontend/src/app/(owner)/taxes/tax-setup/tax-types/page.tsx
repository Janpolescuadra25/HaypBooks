'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxTypesPage() {
  return (
    <PageDocumentation
      title="Tax Types"
      module="TAXES"
      breadcrumb="Taxes / Tax Setup / Tax Types"
      purpose="Tax Types defines the categories of taxes the business is subject to — such as VAT, GST, Corporate Income Tax, Withholding Tax, Payroll Tax, and local business taxes — and configures the core properties of each type. Each tax type determines how it is calculated, when it applies, which authority it is paid to, and how it is reported. The tax type registry is the foundation from which rates, codes, and rules are built."
      components={[
        { name: 'Tax Type Registry', description: 'Table of all active tax types with name, calculation basis, authority, and frequency.' },
        { name: 'Type Configuration Form', description: 'Form to define a new tax type: name, category, basis (percentage of sale, fixed, sliding), and agency link.' },
        { name: 'Reporting Frequency', description: 'Configure how often this tax type must be reported and remitted (monthly, quarterly, annually).' },
        { name: 'Account Assignments', description: 'Map the tax type to its liability and expense GL accounts.' },
        { name: 'Enabled Jurisdictions', description: 'Checkboxes showing which registered jurisdictions have this tax type enabled.' },
      ]}
      tabs={['All Types', 'Sales Taxes', 'Income Taxes', 'Withholding Taxes', 'Payroll Taxes']}
      features={[
        'Register all applicable tax types for the business',
        'Configure calculation method per tax type',
        'Set reporting and remittance frequency per type',
        'Map tax types to GL liability and expense accounts',
        'Enable tax types per jurisdiction',
        'Link tax types to their reporting agency',
      ]}
      dataDisplayed={[
        'Tax type name and category',
        'Calculation basis and rate structure',
        'Reporting frequency',
        'Linked tax authority',
        'Enabled jurisdictions',
      ]}
      userActions={[
        'Add a new tax type',
        'Configure calculation and reporting settings',
        'Assign GL account mappings',
        'Enable tax type for specific jurisdictions',
        'Link to tax agency',
      ]}
    />
  )
}

