'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Item Categories"
      module="INVENTORY"
      breadcrumb="Inventory / Items / Item Categories"
      purpose="Item Categories provides the classification structure for inventory items — organizing products into logical groups (Raw Materials, Work-In-Process, Finished Goods, Supplies, Spare Parts, Merchandise). Categories can have default GL accounts, default tax codes, and default costing methods assigned, which flow automatically to new items created in the category. Categories also drive inventory reports, analysis, and reorder rule grouping."
      components={[
        { name: 'Category Tree', description: 'Hierarchical category tree (Parent > Child categories) for multi-level product classification.' },
        { name: 'Category Editor', description: 'Create or edit a category: name, parent category, default GL accounts (asset, COGS, revenue), default costing method, and default tax code.' },
        { name: 'Category Summary', description: 'Items per category with total stock value for each category.' },
      ]}
      tabs={['Categories', 'Create Category', 'Category Summary']}
      features={[
        'Hierarchical category structure',
        'Default GL account assignment per category',
        'Default costing method per category',
        'Category-level inventory valuation',
        'Category drives filtering in all inventory reports',
      ]}
      dataDisplayed={[
        'Category hierarchy',
        'Number of items per category',
        'Total inventory value per category',
        'Default GL accounts per category',
      ]}
      userActions={[
        'Create a new category',
        'Set default GL accounts for category',
        'Move items between categories',
        'View inventory value by category',
        'Merge or archive a category',
      ]}
      relatedPages={[
        { label: 'Item List', href: '/inventory/items/item-list' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
      ]}
    />
  )
}

