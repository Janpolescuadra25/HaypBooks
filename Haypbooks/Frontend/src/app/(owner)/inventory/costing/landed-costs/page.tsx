'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Landed Costs"
      module="INVENTORY"
      breadcrumb="Inventory / Costing / Landed Costs"
      purpose="Landed Costs manages the allocation of additional import-related costs (freight, insurance, customs duties, brokerage fees, port charges) to the cost of imported inventory. When goods are imported, the landed cost of each item includes all costs to get the inventory to the warehouse — not just the supplier invoice price. Haypbooks allows users to enter the additional charges and allocate them across the items in a receipt using an allocation method (by quantity, by value, or by weight/volume)."
      components={[
        { name: 'Landed Cost Entry', description: 'Attach additional costs to a goods receipt: select receipt, enter cost items (freight, duties, insurance) per vendor, and choose allocation method.' },
        { name: 'Cost Allocation Preview', description: 'Show how each landed cost will be distributed across the received items before posting.' },
        { name: 'Import Cost Tracker', description: 'Track all import shipments with total landed cost vs. supplier invoice price.' },
        { name: 'Duty Rate Library', description: 'Maintain common customs duty rates per product code (HS code) for Philippines Bureau of Customs tariff rates.' },
      ]}
      tabs={['Pending Allocation', 'Posted Landed Costs', 'Cost Allocation Preview', 'Duty Rate Library']}
      features={[
        'Allocation of import-related costs to inventory cost',
        'Multiple allocation methods: by quantity, value, weight',
        'Customs duty rate library by HS code',
        'GL journal entries generated for landed cost posting',
        'Integration with PO receiving records',
        'Landed cost analysis: total cost vs. supplier invoice',
      ]}
      dataDisplayed={[
        'Open receipts awaiting landed cost allocation',
        'Landed cost components per shipment',
        'Cost per unit after landed cost allocation',
        'Total customs duty paid per period',
        'Import cost as % of supplier price',
      ]}
      userActions={[
        'Attach landed costs to a goods receipt',
        'Choose cost allocation method',
        'Preview allocation per item before posting',
        'Post landed cost allocation',
        'Maintain customs duty rate library',
        'Export landed cost analysis',
      ]}
      relatedPages={[
        { label: 'PO Receiving', href: '/expenses/purchase-orders/po-receiving' },
        { label: 'Costing Method', href: '/inventory/costing/costing-method' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
      ]}
    />
  )
}

