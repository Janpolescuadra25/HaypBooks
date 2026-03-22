'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stock Levels"
      module="INVENTORY"
      breadcrumb="Inventory / Stock / Stock Levels"
      purpose="Stock Levels provides a real-time snapshot of current inventory quantities across all warehouses and locations. For each item, it shows the on-hand quantity, reserved quantity (committed to open sales orders), available quantity, quantity on order (from open POs), and the reorder point. The stock levels view is the daily operational tool for warehouse staff and procurement to monitor inventory health and trigger replenishment actions."
      components={[
        { name: 'Stock Status Grid', description: 'All items with on-hand qty, reserved qty, available qty, on-order qty, and reorder point. Color-coded: green (adequate), amber (approaching reorder), red (below reorder / out of stock).' },
        { name: 'Location Filter', description: 'Filter stock levels by warehouse, bin location, or legal entity.' },
        { name: 'Reorder Alerts Panel', description: 'Items at or below reorder point that require a restock PO, grouped by preferred vendor.' },
        { name: 'Stock Adjustment Panel', description: 'Adjust physical stock count entry with reason code (damage, shrinkage, correction, count discrepancy).' },
        { name: 'Movement Summary', description: 'Inflows and outflows per item in the selected period: receipts, issues, adjustments.' },
      ]}
      tabs={['Current Stock', 'By Location', 'Reorder Alerts', 'Adjustments', 'Movement Summary']}
      features={[
        'Real-time on-hand stock levels across warehouses',
        'Available vs. reserved quantity tracking',
        'On-order quantity from open POs shown',
        'Reorder point alerts with preferred vendor',
        'Stock adjustment with reason code audit trail',
        'Multi-warehouse view and filtering',
        'Export stock snapshot to Excel',
      ]}
      dataDisplayed={[
        'Per-item: on-hand, reserved, available, on-order quantities',
        'Items below reorder point',
        'Total inventory value at cost by location',
        'Stock movement summary (in/out) by period',
        'Last stock adjustment history',
      ]}
      userActions={[
        'View stock levels by item or location',
        'Filter by warehouse or category',
        'Raise a reorder PO from alert',
        'Enter a stock adjustment',
        'Export stock snapshot',
        'Transfer stock between locations',
      ]}
      relatedPages={[
        { label: 'Item List', href: '/inventory/items/item-list' },
        { label: 'Reorder Points', href: '/inventory/stock/reorder-points' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
        { label: 'Purchase Orders', href: '/inventory/purchasing/inventory-pos' },
      ]}
    />
  )
}

