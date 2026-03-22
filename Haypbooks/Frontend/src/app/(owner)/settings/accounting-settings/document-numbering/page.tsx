'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Document Numbering"
      module="SETTINGS"
      breadcrumb="Settings / Accounting Settings / Document Numbering"
      purpose="Document Numbering configures the automatic numbering sequences for all Haypbooks documents — invoices, purchase orders, bills, credit notes, payments, journal entries, and other transaction types. Each document type can have its own prefix, starting number, and padding format (e.g., INV-2025-0001). Proper document numbering ensures sequential, audit-friendly document references and enables easy document retrieval. The numbering resets annually if configured, or continues forever (no annual reset) depending on the business preference."
      components={[
        { name: 'Document Type List', description: 'All document types with current prefix, last number used, next number, and format example.' },
        { name: 'Numbering Format Editor', description: 'Configure: prefix (e.g., "INV"), year inclusion optional, zero-padding digits, and start number.' },
        { name: 'Annual Reset Option', description: 'Configure whether the counter resets to 0001 at the start of each year or continues incrementing perpetually.' },
        { name: 'Manual Override', description: 'For special cases: manually set a specific starting number for a document type.' },
      ]}
      tabs={['Sales Documents', 'Purchase Documents', 'Accounting Documents', 'Settings']}
      features={[
        'Document numbering format configuration per document type',
        'Prefix and zero-padding customization',
        'Annual counter reset option',
        'Manual number override capability',
        'Preview next number before saving changes',
        'Number gap detection audit',
      ]}
      dataDisplayed={[
        'All document types with current numbering configuration',
        'Next number to be assigned per type',
        'Format example per type',
        'Annual reset setting',
      ]}
      userActions={[
        'Update prefix for a document type',
        'Configure zero-padding format',
        'Enable or disable annual reset',
        'Set starting number for a new document type',
        'Preview numbering format',
        'Manually set next number for a specific type',
      ]}
      relatedPages={[
        { label: 'Account Defaults', href: '/settings/accounting-settings/account-defaults' },
        { label: 'Company Profile', href: '/settings/company/company-profile' },
        { label: 'Fiscal Year', href: '/settings/company/fiscal-year' },
      ]}
    />
  )
}

