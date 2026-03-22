'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxAgenciesPage() {
  return (
    <PageDocumentation
      title="Tax Agencies"
      module="TAXES"
      breadcrumb="Taxes / Tax Setup / Tax Agencies"
      purpose="Tax Agencies is the directory of all government tax authorities to which the business has filing and payment obligations. Each agency record stores the authority name, contact information, payment methods, portal URLs, and bank details for remittances. This central reference is used throughout the system to correctly route tax liabilities, payments, and filings to the appropriate authority."
      components={[
        { name: 'Agency Directory Table', description: 'List of all configured tax agencies with name, type (federal, state, local), and country.' },
        { name: 'Agency Detail Form', description: 'Form fields for authority name, address, payment instructions, portal URL, and account number.' },
        { name: 'Payment Methods Panel', description: 'Configuration of accepted payment methods per agency: bank transfer, check, e-payment portal.' },
        { name: 'Filing Contact Info', description: "Contact details for the agency's taxpayer support or filing desk." },
        { name: 'Linked Tax Types', description: 'Shows which tax types in the system are configured to report and remit to this agency.' },
      ]}
      tabs={['All Agencies', 'Federal / National', 'State / Provincial', 'Local']}
      features={[
        'Maintain a complete directory of all tax authorities',
        'Store payment instructions and portal URLs per agency',
        'Configure accepted payment methods per authority',
        'Link tax types to the correct agency for automatic routing',
        'Store agency contact information for compliance queries',
        'Track which jurisdictions each agency covers',
      ]}
      dataDisplayed={[
        'Agency name and type (federal/state/local)',
        'Address and contact information',
        'Portal URL and e-filing system name',
        'Payment methods and bank account details',
        'Tax types linked to this agency',
      ]}
      userActions={[
        'Add a new tax agency record',
        'Update agency payment instructions',
        'Link tax types to this agency',
        'Access agency portal via stored URL',
        'Edit agency contact details',
      ]}
    />
  )
}

