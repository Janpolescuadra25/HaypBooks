'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Reorder Points"
      module="INVENTORY"
      breadcrumb="Inventory / Stock / Reorder Points"
      purpose="Reorder Points configures the minimum stock level threshold for each inventory item that triggers a reorder alert or automatic purchase order. Each item can have a reorder point (minimum before restocking), reorder quantity (how much to order), preferred vendor, and lead time days. The system monitors current stock against reorder points and surfaces alerts in the Stock Levels and Reorder Alerts panels. This drives a just-in-time replenishment workflow, preventing stockouts."
      components={[
        { name: 'Reorder Configuration Grid', description: 'All items with current reorder point, reorder quantity, lead time days, and preferred vendor.' },
        { name: 'Reorder Point Editor', description: 'Set/edit reorder point, economic order quantity (EOQ), safety stock level, and lead time for each item.' },
        { name: 'Auto-Reorder Rules', description: 'Configure whether the system should auto-create a draft PO when reorder point is reached, or only alert.' },
        { name: 'Bulk Configuration', description: 'Set reorder parameters for multiple items at once, or by category.' },
      ]}
      tabs={['All Items', 'Below Reorder Point', 'Auto-Reorder Rules', 'Lead Time Settings']}
      features={[
        'Per-item reorder point and quantity configuration',
        'Safety stock calculation support',
        'Lead time days for replenishment planning',
        'Auto-draft PO option on trigger',
        'Category-level reorder parameter templates',
        'Alert notifications when below reorder point',
      ]}
      dataDisplayed={[
        'Reorder point and EOQ per item',
        'Items currently below reorder point',
        'Lead time and safety stock per item',
        'Auto-reorder settings status',
      ]}
      userActions={[
        'Set reorder point for an item',
        'Configure reorder quantity',
        'Set lead time days',
        'Enable auto-draft PO on trigger',
        'Update reorder parameters in bulk',
        'View items below reorder point',
      ]}
      relatedPages={[
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Purchase Orders', href: '/inventory/purchasing/inventory-pos' },
        { label: 'Item List', href: '/inventory/items/item-list' },
      ]}
    />
  )
}

