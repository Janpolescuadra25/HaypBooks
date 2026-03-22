'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Stock Movements"
      module="INVENTORY"
      breadcrumb="Inventory / Stock / Stock Movements"
      purpose="Stock Movements is the complete ledger of every inventory movement — receipts from vendors, issues to customers/jobs, stock adjustments, transfers between locations, returns, and inter-company movements. Every transaction that increases or decreases inventory quantity is recorded as a movement with a timestamp, reference document, user, and quantity. The movement ledger provides a full audit trail for stock reconciliation and stock count variance investigation."
      components={[
        { name: 'Movement Ledger', description: 'Chronological list of all stock movements with date, item, qty moved (in/out), movement type, reference document, location, and posted by.' },
        { name: 'Movement Types Filter', description: 'Filter by: Goods Receipt, Invoice Issue, Manual Adjustment, Transfer In/Out, Return, Write-Off, Opening Balance, Production Issue/Receipt.' },
        { name: 'Reference Document Links', description: 'Each movement links to the source document (PO receipt, invoice, adjustment form) for full traceability.' },
        { name: 'Balance Column', description: 'Running balance column showing stock on hand after each movement for the selected item.' },
      ]}
      tabs={['All Movements', 'Receipts', 'Issues', 'Adjustments', 'Transfers']}
      features={[
        'Complete stock movement history per item',
        'Running balance with each movement',
        'Source document traceability',
        'Filter by movement type, date range, item, or location',
        'Export to Excel for reconciliation',
        'FIFO/WACC cost per movement shown',
      ]}
      dataDisplayed={[
        'All movements with quantity and type',
        'Reference document per movement',
        'Cost value of each movement',
        'Running stock balance after each movement',
        'User who recorded the movement',
      ]}
      userActions={[
        'Browse full movement history for an item',
        'Filter by movement type or date range',
        'Drill into the source reference document',
        'Export movement ledger to Excel',
        'Reconcile physical count against movement balance',
      ]}
      relatedPages={[
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
        { label: 'Item List', href: '/inventory/items/item-list' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
      ]}
    />
  )
}

