'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CompanyDetailsPage() {
  return (
    <PageDocumentation
      title="Company Details"
      module="SETTINGS"
      breadcrumb="Settings / Company Profile / Company Details"
      purpose="Company Details stores the core identity information for your business — legal name, trade name, registration numbers, address, logo, and contact details. This information is used across invoices, purchase orders, tax filings, and other printed documents. Keeping company details accurate ensures all customer-facing documents and regulatory submissions reflect the correct legal entity."
      components={[
        { name: 'Company Identity Form', description: 'Fields for legal name, trade name, business type, and registration or EIN number.' },
        { name: 'Address Block', description: 'Form section for registered address, mailing address, and optional branch address entries.' },
        { name: 'Logo Uploader', description: 'Image upload control supporting PNG/JPG up to 2 MB; preview shows how logo appears on invoices.' },
        { name: 'Contact Info Section', description: 'Primary phone, email, website, and social media fields for business contact display.' },
        { name: 'Regulatory IDs Panel', description: 'Fields for tax IDs, VAT registration numbers, and industry-specific identifiers by region.' },
      ]}
      tabs={['Basic Info', 'Address', 'Branding', 'Regulatory IDs', 'Social & Contact']}
      features={[
        'Store and update core legal identity and trade name information',
        'Upload company logo for use on invoices, reports, and PDF documents',
        'Manage multiple addresses (registered, mailing, branch locations)',
        'Record tax identification numbers and VAT registration IDs',
        'Control which details appear on customer-facing documents vs. internal views',
        'Track change history to see who updated company details and when',
      ]}
      dataDisplayed={[
        'Legal company name, trade name, and business type',
        'Registered and mailing addresses',
        'Tax ID, VAT number, and other regulatory identifiers',
        'Primary phone, email, and website',
        'Logo image with current invoice preview',
      ]}
      userActions={[
        'Update company legal name or trade name',
        'Upload or replace company logo',
        'Edit registered or mailing address',
        'Add or update tax identification numbers',
        'Save changes and preview on sample invoice',
      ]}
    />
  )
}

