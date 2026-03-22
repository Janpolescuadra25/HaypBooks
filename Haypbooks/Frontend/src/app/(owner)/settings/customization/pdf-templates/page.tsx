'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PdfTemplatesPage() {
  return (
    <PageDocumentation
      title="PDF Templates"
      module="SETTINGS"
      breadcrumb="Settings / Customization / PDF Templates"
      purpose="PDF Templates controls the visual layout and content of all customer-facing printed documents including invoices, quotes, purchase orders, receipts, and statements. Businesses customize these templates to match brand guidelines, include required legal language, and structure information for their industry. Multiple templates can be created and assigned to different document types or customer segments."
      components={[
        { name: 'Template Gallery', description: 'Grid of existing PDF templates with document type, preview thumbnail, and default indicator.' },
        { name: 'Visual Template Editor', description: 'Drag-and-drop designer for arranging header, footer, body columns, logo, and custom text blocks.' },
        { name: 'Field Token Picker', description: 'Panel of available data tokens (e.g., {{customer_name}}, {{invoice_total}}) to insert into template.' },
        { name: 'Live PDF Preview', description: 'Real-time rendered PDF preview that updates as template changes are made in the editor.' },
        { name: 'Template Assignment Rules', description: 'Configure which template is used per customer group, currency, or document type.' },
      ]}
      tabs={['Invoice Templates', 'Quote Templates', 'PO Templates', 'Statement Templates', 'Receipt Templates']}
      features={[
        'Design custom PDF layouts for invoices, quotes, POs, and statements',
        'Drag-and-drop positioning for logo, address blocks, line items, and totals',
        'Insert dynamic data tokens that auto-populate with transaction data',
        'Preview rendered PDF before saving template changes',
        'Assign different templates per document type or customer segment',
        'Set a default template for each document category',
      ]}
      dataDisplayed={[
        'Template name, document type, and last modified date',
        'Preview thumbnail of each template',
        'Default template designation per document type',
        'Number of documents generated using each template',
        'Template token coverage (fields populated vs. available)',
      ]}
      userActions={[
        'Create a new PDF template from blank or existing template',
        'Edit layout with drag-and-drop designer',
        'Insert dynamic data tokens',
        'Preview the rendered PDF',
        'Set as default template for a document type',
        'Assign template to specific customer groups',
      ]}
    />
  )
}

