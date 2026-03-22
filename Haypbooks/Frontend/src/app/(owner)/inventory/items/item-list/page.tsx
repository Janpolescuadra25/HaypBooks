'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Item List"
      module="INVENTORY"
      breadcrumb="Inventory / Items / Item List"
      purpose="Item List is the master catalog of all inventory items — physical goods that the company buys, holds, and sells. Each inventory item contains a SKU, description, unit of measure, cost price, selling price, GL accounts (asset, COGS, revenue), tax codes, and reorder parameters. Inventory items are linked to stock levels, purchase orders, sales invoices, and cost of goods sold (COGS) automatically. Non-inventory service items are managed in the Sales Product Catalog."
      components={[
        { name: 'Item Catalog Table', description: 'All inventory items with SKU, name, category, unit, cost price, selling price, current stock level, and status.' },
        { name: 'Item Detail Editor', description: 'Full item record: SKU, name, description, category, UOM, standard cost, selling price, inventory GL account, COGS account, income account, tax code, reorder point, and preferred vendor.' },
        { name: 'Stock Status Indicator', description: 'Shows current level, in-stock/low-stock/out-of-stock status, and reorder point for quick scan.' },
        { name: 'Price History', description: 'Historical cost and selling price changes per item with effective dates.' },
        { name: 'Item Import', description: 'Bulk insert items from CSV/Excel template.' },
      ]}
      tabs={['All Items', 'Active', 'Low Stock', 'Out of Stock', 'Discontinued']}
      features={[
        'Full product master data management',
        'Cost and selling price management per item',
        'GL account mapping per item (asset, COGS, revenue)',
        'Reorder point and preferred vendor configuration',
        'Price history tracking',
        'Bulk CSV/Excel import',
        'Item categorization for reporting',
      ]}
      dataDisplayed={[
        'All inventory items with SKU, cost, and stock level',
        'Low stock and out-of-stock alerts',
        'Average cost per item (weighted or FIFO)',
        'Item count by category',
        'Total inventory value at cost',
      ]}
      userActions={[
        'Add a new inventory item',
        'Update standard cost or selling price',
        'Set reorder point and reorder quantity',
        'Assign preferred vendor',
        'Archive or discontinue an item',
        'Bulk import items from CSV',
        'Export item list',
      ]}
      relatedPages={[
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Purchase Orders', href: '/inventory/purchasing/inventory-pos' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
        { label: 'Product Catalog (Sales)', href: '/sales/sales-settings/product-catalog' },
      ]}
    />
  )
}

