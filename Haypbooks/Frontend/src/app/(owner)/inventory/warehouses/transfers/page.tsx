'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Transfers"
      module="INVENTORY"
      breadcrumb="Inventory / Warehouses / Transfers"
      purpose="Transfers manages the movement of inventory between warehouses or locations. A transfer order is created to move items from a source location to a destination location — reducing stock at source and adding to destination. Transfers can be authorized (require approval above a quantity or value threshold), recorded with a transit time (in-transit status between dispatch and receipt), and are fully auditable. All transfers create matching stock movement records at both ends."
      components={[
        { name: 'Transfer Order List', description: 'All transfer orders with source warehouse, destination warehouse, items, quantity, transfer date, and status (Pending/In-Transit/Received).' },
        { name: 'Transfer Order Creator', description: 'Create a transfer: select source and destination, add items and quantities, set transfer date, and requestor.' },
        { name: 'Dispatch Confirmation', description: 'Source warehouse confirms dispatch — items move to "In-Transit" status.' },
        { name: 'Receipt Confirmation', description: 'Destination warehouse confirms receipt — items move from "In-Transit" to destination stock.' },
        { name: 'Discrepancy Recording', description: 'Record any quantity discrepancy between dispatched and received quantities.' },
      ]}
      tabs={['All Transfers', 'Pending', 'In Transit', 'Received', 'Discrepancies']}
      features={[
        'Inter-warehouse inventory transfer management',
        'In-transit status for transfers not yet received',
        'Dispatch and receipt confirmation workflow',
        'Discrepancy recording and resolution',
        'Full movement audit trail for both warehouses',
        'Transfer approval for large quantity moves',
      ]}
      dataDisplayed={[
        'All transfers with source, destination, and status',
        'In-transit stock (dispatched but not received)',
        'Transfer history with discrepancy summary',
        'Stock impact on both locations',
      ]}
      userActions={[
        'Create a new transfer order',
        'Confirm dispatch of transfer',
        'Confirm receipt at destination',
        'Record quantity discrepancy',
        'Cancel a pending transfer',
        'View transfer history',
      ]}
      relatedPages={[
        { label: 'Warehouse List', href: '/inventory/warehouses/warehouse-list' },
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Stock Movements', href: '/inventory/stock/stock-movements' },
      ]}
    />
  )
}

