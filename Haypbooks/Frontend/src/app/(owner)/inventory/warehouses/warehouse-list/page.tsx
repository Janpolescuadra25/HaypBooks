'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Warehouse List"
      module="INVENTORY"
      breadcrumb="Inventory / Warehouses / Warehouse List"
      purpose="Warehouse List manages the multiple physical storage locations where inventory is held — main warehouses, branch warehouses, consignment locations, and temporary holding areas. Each warehouse record contains its name, address, responsible manager, and associated legal entity. Inventory stock levels are tracked separately per warehouse, enabling per-location stock views, inter-warehouse transfers, and location-specific stock counts."
      components={[
        { name: 'Warehouse Directory', description: 'All warehouses with name, code, location, responsible person, entity, and status.' },
        { name: 'Warehouse Detail', description: 'Full warehouse record: name, code, address, manager, entity association, type (own/consignment/3PL), and bin configuration.' },
        { name: 'Warehouse Summary', description: 'Items count, total stock value, and utilization for each warehouse.' },
      ]}
      tabs={['All Warehouses', 'Active', 'Consignment Locations']}
      features={[
        'Multi-warehouse management',
        'Consignment and 3PL location support',
        'Per-warehouse stock value and item count',
        'Warehouse-to-entity association',
        'Stock count by warehouse',
        'Transfer between warehouses',
      ]}
      dataDisplayed={[
        'All warehouses with location and manager',
        'Total stock value per warehouse',
        'Item count per warehouse',
        'Warehouse type and entity',
      ]}
      userActions={[
        'Add a new warehouse',
        'Edit warehouse details',
        'View stock levels at a warehouse',
        'Initiate inter-warehouse transfer',
        'Deactivate a closed warehouse',
      ]}
      relatedPages={[
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Transfers', href: '/inventory/warehouses/transfers' },
        { label: 'Bin Locations', href: '/inventory/warehouses/bin-locations' },
      ]}
    />
  )
}

