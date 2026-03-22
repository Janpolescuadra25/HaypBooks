'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Customer Groups'
      module='SALES'
      breadcrumb='Sales / Customers / Customer Groups'
      purpose='Enables segmentation of customers into logical groups for targeted pricing, billing terms, reporting, and communication. Customer groups streamline management of similar customers and allow bulk application of price lists, payment terms, and collection workflows.'
      components={[
        { name: 'Group Manager', description: 'Create, edit, and delete customer groups with name, description, and members' },
        { name: 'Auto-Assignment Rules', description: 'Define criteria for automatic customer group membership such as revenue tier or region' },
        { name: 'Group-Level Defaults', description: 'Set default payment terms, price list, and currency per group' },
        { name: 'Group Communication Panel', description: 'Send bulk communications or statements to all members of a group' },
        { name: 'Group Reporting Filter', description: 'Use groups as a filter dimension in all reporting modules' },
      ]}
      tabs={['Customer Groups', 'Group Members', 'Group Rules', 'Group Defaults']}
      features={['Manual and rule-based group membership', 'Group-level price list and payment term defaults', 'Bulk action support for group members', 'Group usage in reporting filters', 'Group-based dunning sequence assignment', 'Customer count and revenue per group', 'Export group member list']}
      dataDisplayed={['Group name and description', 'Member customer count', 'Total outstanding balance for group', 'Total revenue for group', 'Default price list and payment terms', 'Auto-assignment rule criteria', 'Date created and last modified']}
      userActions={['Create new customer group', 'Add or remove group members', 'Set group-level defaults', 'Configure auto-assignment rules', 'Send communication to group', 'Apply group filter in reports', 'Export customer group list']}
      relatedPages={[
        { label: 'Price Lists', href: '/sales/customers/price-lists' },
        { label: 'Customer Documents', href: '/sales/customers/customer-documents' },
        { label: 'Dunning Management', href: '/sales/collections/dunning-management' },
      ]}
    />
  )
}

