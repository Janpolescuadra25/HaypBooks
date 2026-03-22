'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Costing Method"
      module="INVENTORY"
      breadcrumb="Inventory / Costing / Costing Method"
      purpose="Costing Method configures how the cost of inventory is calculated and tracked — the foundation of inventory valuation and COGS recognition. The available methods are Weighted Average Cost (WAC), First-In-First-Out (FIFO), Last-In-First-Out (LIFO, US only), and Standard Cost. The method can be set company-wide or per item category. Changing the costing method requires a revaluation of existing inventory. The accuracy of COGS and gross margin depends entirely on the correctness of the costing method and cost data."
      components={[
        { name: 'Costing Method Selector', description: 'Set company-wide default costing method: WAC, FIFO, LIFO (US) or Standard Cost.' },
        { name: 'Per-Category Override', description: 'Override the default method for specific item categories if different treatment is required.' },
        { name: 'Cost Layer Viewer', description: 'For FIFO: shows all cost layers (batches) currently in stock with quantity and unit cost per layer.' },
        { name: 'Standard Cost Management', description: 'For Standard Cost: set standard cost per item, variance analysis when actual cost differs from standard.' },
        { name: 'Revaluation Tool', description: 'When changing method, calculate the revaluation adjustment required and post to cost adjustment GL account.' },
      ]}
      tabs={['Method Settings', 'Cost Layers (FIFO)', 'Standard Costs', 'Variance Analysis']}
      features={[
        'Company-wide and per-category costing method',
        'FIFO cost layer management',
        'WAC automatic recalculation on receipt',
        'Standard cost with variance analysis',
        'Revaluation workflow on method change',
        'Cost per unit display in all inventory views',
      ]}
      dataDisplayed={[
        'Current costing method setting',
        'FIFO cost layers (quantity and unit cost per batch)',
        'WAC current weighted average unit cost',
        'Standard cost vs. actual cost variance',
        'Total inventory value under current method',
      ]}
      userActions={[
        'Set or change costing method',
        'Set standard cost per item',
        'View FIFO cost layers',
        'Run variance analysis (standard vs. actual)',
        'Post revaluation on costing method change',
      ]}
      relatedPages={[
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
        { label: 'Item List', href: '/inventory/items/item-list' },
        { label: 'Cost Adjustments', href: '/inventory/costing/cost-adjustments' },
      ]}
    />
  )
}

