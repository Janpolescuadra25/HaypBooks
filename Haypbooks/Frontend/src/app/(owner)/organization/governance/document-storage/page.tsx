'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Document Storage"
      module="ORGANIZATION"
      breadcrumb="Organization / Governance / Document Storage"
      purpose="Document Storage is the central corporate governance document repository for storing, organizing, and retrieving company formation and compliance documents. It holds articles of incorporation, board resolutions, SEC filings, business permits, franchise agreements, shareholder agreements, and other legal/governance documents. Documents are organized by entity, category, and effective date with version control and access restrictions."
      components={[
        { name: 'Document Library', description: 'Searchable document list with thumbnail preview, entity, category, upload date, expiry, and version.' },
        { name: 'Folder Structure', description: 'Organized folders: Company Formation, Tax Registrations, Business Permits, Board Resolutions, Contracts, Compliance.' },
        { name: 'Upload Form', description: 'Upload document with metadata: entity, category, effective date, expiry date, description, and access rights.' },
        { name: 'Version History', description: 'Each document maintains a full version history; previous versions are retained and accessible.' },
        { name: 'Expiry Tracker', description: 'Highlights documents expiring within 30/60/90 days with renewal reminders.' },
      ]}
      tabs={['All Documents', 'By Entity', 'By Category', 'Expiring Soon', 'Upload']}
      features={[
        'Organized corporate document repository',
        'Document version control and history',
        'Expiry date tracking with advance alerts',
        'Access control per document category',
        'Full-text search within document names and metadata',
        'Bulk document upload with batch metadata entry',
      ]}
      dataDisplayed={[
        'Document name, type, and file format',
        'Associated legal entity',
        'Category and sub-category',
        'Upload date, effective date, and expiry date',
        'Version number and last modified by',
        'Document access level (Public / Internal / Restricted)',
      ]}
      userActions={[
        'Upload a new document',
        'Update an existing document (creates new version)',
        'Download any document',
        'Set or update expiry date',
        'Configure access restrictions',
        'Move document to different folder/category',
        'Share document link with specific users',
      ]}
      relatedPages={[
        { label: 'Filing Calendar', href: '/organization/governance/filing-calendar' },
        { label: 'Vendor Documents', href: '/expenses/vendors/vendor-documents' },
        { label: 'Employee Documents', href: '/payroll-workforce/workforce/employee-documents' },
        { label: 'Policy Management', href: '/compliance/controls/policy-management' },
      ]}
    />
  )
}

