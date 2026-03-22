'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Terms"
      module="SALES"
      breadcrumb="Sales / Customers / Credit Terms"
      purpose="Credit Terms manages the standard payment term templates available for assignment to customers (Net 7, Net 15, Net 30, Net 60, COD, 2/10 Net 30, etc.). Each term defines the number of days allowed before payment is due and whether an early payment discount applies. Once defined here, these terms appear in the dropdown when creating invoices and customer records. Custom terms can be defined for specific commercial arrangements."
      components={[
        { name: 'Terms Library', description: 'All configured payment terms with name, days to payment due, early payment discount %, and discount window days.' },
        { name: 'New Term Builder', description: 'Create a custom term: name, net payment days, early payment discount percentage, discount qualifying window.' },
        { name: 'Terms Usage Report', description: 'See how many customers and invoices are using each term template.' },
        { name: 'Default Term Setting', description: 'Set the company-wide default payment term applied to new customers.' },
      ]}
      tabs={['All Terms', 'Create Term', 'Usage']}
      features={[
        'Standard payment term template management',
        'Early payment discount term support (2/10 Net 30)',
        'Custom term creation for special arrangements',
        'Default term configuration',
        'Usage statistics per term',
        'Terms flow through to invoice due date calculation',
      ]}
      dataDisplayed={[
        'All payment terms with name and days',
        'Early payment discount percentage and window',
        'Number of customers using each term',
        'Default payment term setting',
      ]}
      userActions={[
        'Create a new payment term template',
        'Edit an existing term',
        'Set the company default payment term',
        'View which customers use a specific term',
        'Delete an unused term',
      ]}
      relatedPages={[
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
      ]}
    />
  )
}

