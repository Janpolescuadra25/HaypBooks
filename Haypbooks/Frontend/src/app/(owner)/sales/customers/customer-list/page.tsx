'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Customer List"
      module="SALES"
      breadcrumb="Sales / Customers / Customer List"
      purpose="Customer List is the master directory of all customer accounts in the system. Each customer record stores the contact details, billing address, credit terms, credit limit, assigned sales person, payment history, and current AR balance. The customer list is the starting point for creating invoices, quotes, and managing the commercial relationship. Customers can be imported in bulk, tagged, segmented, and searched for rapid lookup."
      components={[
        { name: 'Customer Table', description: 'All customers with name, contact person, phone, email, payment terms, credit limit, current balance, and status (active/inactive).' },
        { name: 'Customer Profile Card', description: 'Full customer details: company info, contacts, billing/shipping addresses, credit terms, GL account, tax registration details.' },
        { name: 'AR Balance Summary per Customer', description: 'Current outstanding AR balance, aging summary, and last payment date for each customer.' },
        { name: 'Customer Segmentation Tags', description: 'Tag customers by segment (VIP, Retail, Wholesale, Government) for filtered reporting.' },
        { name: 'Activity Timeline', description: 'Timeline of all transactions with the customer: invoices, payments, credit notes, and communications.' },
      ]}
      tabs={['All Customers', 'Active', 'Overdue', 'By Segment', 'Imported']}
      features={[
        'Comprehensive customer master data management',
        'Credit term and credit limit assignment',
        'Customer-level AR balance and aging view',
        'Customer segmentation and tagging',
        'Activity and transaction timeline per customer',
        'Bulk import from CSV/Excel',
        'Export customer list for CRM or mailing',
      ]}
      dataDisplayed={[
        'Customer name, contact, email, and phone',
        'Credit terms (Net 30, Net 60, COD, etc.)',
        'Credit limit',
        'Current AR balance and aging buckets',
        'Last invoice date and last payment date',
        'Total revenue YTD from customer',
      ]}
      userActions={[
        'Add a new customer',
        'Edit customer contact details',
        'Update credit terms or credit limit',
        'View customer AR balance and invoices',
        'Tag customer with segment',
        'Export customer list',
        'Deactivate an inactive customer',
        'Import customer from CSV',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Estimates', href: '/sales/estimates/estimate-list' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
        { label: 'AR Aging', href: '/reporting/reports-center/ar-aging' },
      ]}
    />
  )
}

