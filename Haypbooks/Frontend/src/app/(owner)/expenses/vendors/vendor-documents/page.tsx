'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor Documents"
      module="EXPENSES"
      breadcrumb="Expenses / Vendors / Vendor Documents"
      purpose="Vendor Documents is the centralized document repository for all vendor compliance and commercial documents — business registration certificates, BIR TIN documents, accreditation certificates, contracts, pricing agreements, and non-disclosure agreements. Keeping these organized by vendor ensures the AP team can quickly access required documents during audit, compliance checks, or payment processing (some payments require active vendor accreditation verification)."
      components={[
        { name: 'Document Library', description: 'Browse all vendor documents by vendor or category. Each document shows file type, upload date, uploaded by, and validity/expiry date.' },
        { name: 'Document Upload', description: 'Upload a document for a specific vendor: select vendor, document type, file, validity period, and expiry date.' },
        { name: 'Expiry Alerts', description: 'Documents approaching expiry (30/60/90 days) highlighted for timely renewal requests.' },
        { name: 'Document Request Management', description: 'Send document requests to vendors asking them to submit updated documents by a deadline.' },
      ]}
      tabs={['All Documents', 'By Vendor', 'Expiring Soon', 'Request History']}
      features={[
        'Centralized vendor document storage',
        'Document expiry tracking with renewal alerts',
        'Document request workflow to vendors',
        'Document type categorization',
        'Bulk document export per vendor (for audit packages)',
      ]}
      dataDisplayed={[
        'All vendor documents with type and validity',
        'Documents expiring within 30/60/90 days',
        'Vendors with missing required documents',
        'Document request send date and response status',
      ]}
      userActions={[
        'Upload a vendor document',
        'Set document expiry date and renewal reminder',
        'Request updated document from vendor',
        'Download a vendor document',
        'Export all documents for a vendor',
        'Mark a document as superseded',
      ]}
      relatedPages={[
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Document Storage', href: '/organization/governance/document-storage' },
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
      ]}
    />
  )
}


