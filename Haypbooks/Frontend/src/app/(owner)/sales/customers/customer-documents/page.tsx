'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Customer Documents'
      module='SALES'
      breadcrumb='Sales / Customers / Customer Documents'
      purpose='Central document management repository for all customer-related files including contracts, proposals, signed agreements, credit applications, and correspondence. Keeps customer documents organized, versioned, and accessible to authorized team members.'
      components={[
        { name: 'Document Repository Table', description: 'Browsable list of all documents per customer with file type, date, and version' },
        { name: 'Document Upload Widget', description: 'Drag-and-drop file upload with auto-tagging by document type and customer' },
        { name: 'Document Version Manager', description: 'Tracks versions of documents with change notes and history' },
        { name: 'Search and Filter Bar', description: 'Full-text search and filter by document type, date range, and uploader' },
        { name: 'Permission Controls', description: 'Set view and edit permissions on sensitive documents per user role' },
      ]}
      tabs={['All Documents', 'Contracts', 'Proposals', 'Invoices', 'Correspondence']}
      features={['Centralized customer document repository', 'Document versioning and history', 'Document tagging by type and customer', 'Full-text document search', 'User permission controls per document', 'Document expiry tracking', 'Bulk download and export']}
      dataDisplayed={['Document name, type, and format', 'Customer name linked to document', 'Upload date and uploaded by', 'Version number', 'Document expiry date (if set)', 'Access permission settings', 'Download count']}
      userActions={['Upload new customer document', 'Tag document by type', 'Update document version', 'Set document permissions', 'Search for specific customer document', 'Download or share document', 'Archive expired document']}
      relatedPages={[
        { label: 'Customer Groups', href: '/sales/customers/customer-groups' },
        { label: 'Customer Statements', href: '/sales/billing/customer-statements' },
        { label: 'Contracts', href: '/projects/project-setup/contracts' },
      ]}
    />
  )
}

