'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Product Catalog"
      module="SALES"
      breadcrumb="Sales / Sales Settings / Product Catalog"
      purpose="The Product Catalog (also called Items or Products & Services) is the master list of all sellable products and services — the items that appear in invoice and estimate line items. Each item has a name, description, unit price, unit of measure, income account mapping, and tax code. Service items are mapped to service revenue accounts; physical product items can optionally track inventory. Having a catalog eliminates re-typing descriptions and prices on every invoice."
      components={[
        { name: 'Item List', description: 'All catalog items with name, type (product/service), default price, unit, income account, tax code, and status.' },
        { name: 'Item Detail Editor', description: 'Full item record: name, description, unit, default price, income account, tax treatment, cost of goods account, and inventory tracking toggle.' },
        { name: 'Category Manager', description: 'Organize items by category (e.g., Consulting, Software, Hardware, Subscription) for invoicing filters and reports.' },
        { name: 'Bulk Price Update', description: 'Apply a percentage price increase or fixed-amount change to a group of items.' },
        { name: 'Import Items', description: 'Bulk import product catalog from CSV/Excel template.' },
      ]}
      tabs={['All Items', 'Products', 'Services', 'By Category', 'Archived']}
      features={[
        'Central item/product master for invoicing',
        'Auto-fill price and tax when item selected on invoice',
        'Income account mapping per item',
        'Inventory tracking option for physical items',
        'Bulk price update capability',
        'Category organization for reporting',
        'CSV/Excel bulk import',
      ]}
      dataDisplayed={[
        'All catalog items with standard prices',
        'Category and type distribution',
        'Items with no income account configured',
        'Last price update date',
        'Most frequently used items (by invoice frequency)',
      ]}
      userActions={[
        'Add a new product or service item',
        'Update a standard price',
        'Assign income account and tax code',
        'Bulk update prices by percentage',
        'Archive an obsolete item',
        'Import items from CSV',
        'Export item list for review',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Estimate List', href: '/sales/estimates/estimate-list' },
        { label: 'Inventory Items', href: '/inventory/items/item-list' },
      ]}
    />
  )
}

