'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bin Locations"
      module="INVENTORY"
      breadcrumb="Inventory / Warehouses / Bin Locations"
      purpose="Bin Locations provides sub-warehouse location management — racking zones, aisle numbers, shelf designations (A1-B3, Shelf 4, Zone C), or freezer/ambient/dry area segregation within a warehouse. Assigning items to specific bin locations enables bin-picking in order fulfillment and precise physical stock count by bin. This is especially valuable for medium-to-large warehouses where knowing which bay/rack holds a product saves significant picking time."
      components={[
        { name: 'Bin Configuration Grid', description: 'All defined bin locations within each warehouse with bin code, zone, type, and current items stored there.' },
        { name: 'Bin Editor', description: 'Create or manage a bin: warehouse, zone, aisle, bin code, type (standard/refrigerated/hazmat), and capacity.' },
        { name: 'Item-to-Bin Assignment', description: 'Assign items to their primary and alternate bin locations.' },
        { name: 'Bin Stock Inquiry', description: 'View all items and quantities currently in a specific bin.' },
      ]}
      tabs={['All Bins', 'By Zone', 'Item-Bin Assignment', 'Bin Inquiry']}
      features={[
        'Sub-warehouse bin location management',
        'Zone and aisle-level organization',
        'Item primary bin assignment',
        'Bin-level stock count support',
        'Storage type classification (ambient, cold, hazmat)',
        'Bin capacity tracking',
      ]}
      dataDisplayed={[
        'All bin locations per warehouse',
        'Items and quantities currently in each bin',
        'Bin utilization and capacity',
        'Items with no bin assignment',
      ]}
      userActions={[
        'Create new bin location',
        'Assign items to bins',
        'View stock in a specific bin',
        'Move items between bins',
        'Print bin labels',
        'Deactivate unused bins',
      ]}
      relatedPages={[
        { label: 'Warehouse List', href: '/inventory/warehouses/warehouse-list' },
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Transfers', href: '/inventory/warehouses/transfers' },
      ]}
    />
  )
}

