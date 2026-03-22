'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Inventory Valuation"
      module="INVENTORY"
      breadcrumb="Inventory / Reports / Inventory Valuation"
      purpose="Inventory Valuation Report shows the total value of all inventory on hand at any given date — using the configured costing method (WAC, FIFO, or Standard). It lists each item, its quantity on hand, cost per unit, and total value. The total inventory value from this report should tie to the Inventory Asset account on the Balance Sheet. This report is essential for monthly financial reporting, insurance valuations, and external audit support for inventory asset verification."
      components={[
        { name: 'Valuation Summary by Category', description: 'Total inventory value grouped by category with item count and total cost.' },
        { name: 'Item Detail Rows', description: 'Each item: SKU, name, category, warehouse, on-hand quantity, cost per unit (per costing method), and total value.' },
        { name: 'Date Selector', description: 'Run valuation as-of-today or as-of any historic date (for prior period reporting or audit requests).' },
        { name: 'GL Reconciliation Indicator', description: 'Comparison of total inventory report value vs. inventory GL balance — shows any reconciling difference.' },
      ]}
      tabs={['Summary', 'Item Detail', 'By Location', 'GL Reconciliation']}
      features={[
        'As-of-date inventory valuation',
        'Costing method in use is clearly shown',
        'Per-item, per-category, per-location views',
        'GL reconciliation check built in',
        'Export to Excel/PDF for balance sheet support',
        'FIFO cost layer detail available',
      ]}
      dataDisplayed={[
        'All items with quantity, unit cost, and total value',
        'Total inventory value vs. GL balance',
        'Category breakdown of inventory value',
        'Location breakdown',
        'Costing method used',
      ]}
      userActions={[
        'Run inventory valuation as of today',
        'Run valuation as of a prior period end',
        'Filter by warehouse or category',
        'Export to Excel for audit or balance sheet preparation',
        'Investigate GL reconciling differences',
      ]}
      relatedPages={[
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Item List', href: '/inventory/items/item-list' },
        { label: 'Costing Method', href: '/inventory/costing/costing-method' },
          { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
      ]}
    />
  )
}

