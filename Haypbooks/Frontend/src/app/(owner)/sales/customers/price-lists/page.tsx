'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Price Lists'
      module='SALES'
      breadcrumb='Sales / Customers / Price Lists'
      purpose='Manages multiple pricing tiers and customized price lists that can be assigned to customers or customer groups. Supports volume discounts, promotional pricing, currency-specific pricing, and date-effective price changes to handle complex pricing requirements.'
      components={[
        { name: 'Price List Builder', description: 'Create named price lists with product/service prices, currencies, and effective dates' },
        { name: 'Discount Structure Editor', description: 'Define volume-based, percentage, or fixed-amount discount tiers per price list' },
        { name: 'Customer Assignment Panel', description: 'Assign price lists to individual customers or customer groups' },
        { name: 'Price List Comparison Tool', description: 'Side-by-side comparison of prices across multiple lists' },
        { name: 'Price Override Audit Trail', description: 'Records all manual price overrides on invoices with user and reason' },
      ]}
      tabs={['Price Lists', 'By Customer', 'Discount Structures', 'Price History']}
      features={['Multi-tier price list management', 'Volume discount structure configuration', 'Currency-specific pricing per list', 'Date-effective pricing changes', 'Customer and group price list assignment', 'Manual override tracking with audit trail', 'Price list import from Excel']}
      dataDisplayed={['Price list name and currency', 'Product or service names', 'Price per unit per list', 'Discount tiers and conditions', 'Effective date range', 'Customers assigned to list', 'Last price change date']}
      userActions={['Create new price list', 'Add products/services to price list', 'Define discount tiers', 'Assign to customer or group', 'Set date-effective pricing', 'Compare price lists', 'Export price list to Excel']}
      relatedPages={[
        { label: 'Customer Groups', href: '/sales/customers/customer-groups' },
        { label: 'Revenue Management', href: '/sales/revenue-management/contract-revenue' },
        { label: 'Sales Operations', href: '/sales/sales-operations/products-services' },
      ]}
    />
  )
}

