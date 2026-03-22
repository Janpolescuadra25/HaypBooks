'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Company Profile"
      module="SETTINGS"
      breadcrumb="Settings / Company / Company Profile"
      purpose="Company Profile is the master record of the legal and operational identity of the company in Haypbooks. It contains: business name as registered, trade name, business type (sole prop, partnership, corporation), registered address, main office address, website, nature of business, BIR TIN, SEC/DTI registration number, and company logo. This information appears on all printed documents (invoices, reports, payslips) and is used in all BIR-form auto-fill. Keeping this accurate is foundational to the entire accounting system."
      components={[
        { name: 'Business Identity', description: 'Registered business name, trade name, business type, industry classification, and incorporation date.' },
        { name: 'Tax Information', description: 'TIN, SEC/DTI registration number, RDO code (BIR Revenue District Office), and certificate of registration details.' },
        { name: 'Address & Contact', description: 'Registered address, head office address, business phone, email, and website.' },
        { name: 'Logo Upload', description: 'Upload company logo and business stamp/seal for use on invoices, reports, and official documents.' },
        { name: 'Fiscal Information', description: 'Link to fiscal year settings, VAT registration status, and eFPS enrollment status.' },
      ]}
      tabs={['Business Identity', 'Tax Details', 'Address & Contact', 'Logo & Branding', 'Fiscal Settings']}
      features={[
        'Company master data management',
        'BIR TIN and registration details storage',
        'Logo management for document output',
        'Multi-entity support (links to legal entities)',
        'Auto-fill company details on all BIR forms',
        'Business type and industry classification',
      ]}
      dataDisplayed={[
        'Company name and registration details',
        'TIN and BIR registration information',
        'Contact information',
        'Current logo in use',
        'Fiscal year and VAT status',
      ]}
      userActions={[
        'Update company name or registration details',
        'Update TIN or RDO code',
        'Upload new company logo',
        'Update business address',
        'Link to fiscal year settings',
      ]}
      relatedPages={[
        { label: 'Fiscal Year', href: '/settings/company/fiscal-year' },
        { label: 'Currencies', href: '/settings/company/currencies' },
        { label: 'Legal Entities', href: '/organization/structure/legal-entities' },
        { label: 'eFPS Setup', href: '/philippine-tax/compliance/efps-setup' },
      ]}
    />
  )
}

