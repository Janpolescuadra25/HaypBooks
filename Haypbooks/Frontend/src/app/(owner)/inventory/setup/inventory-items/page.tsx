'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Inventory Items"
      module="INVENTORY"
      breadcrumb="Inventory / Setup / Items"
      purpose="Complete inventory item master. Create and manage all purchasable, saleable, and manufactured items with full cost, pricing, unit, and warehouse location configuration."
      components={[
        { name: "Item List", description: "All inventory items with SKU, name, category, unit cost, and on-hand quantity" },
        { name: "Create Item Form", description: "Comprehensive item setup: name, SKU, description, category, units, cost, price, accounts" },
        { name: "Item Detail View", description: "Full item profile with transaction history, stock levels, and costing" },
        { name: "Images and Attachments", description: "Product images and specification documents per item" },
        { name: "Pricing Tiers", description: "Define quantity-based or customer-group-based pricing tiers" },
      ]}
      tabs={["All Items","Active","Inactive","Services","Non-Inventory"]}
      features={["Full item lifecycle management","Multi-warehouse stock tracking","FIFO/LIFO/Average cost methods","Pricing tiers","Barcode/QR support"]}
      dataDisplayed={["Item name, SKU, and category","Unit of measure","Current unit cost and selling price","On-hand quantity","GL accounts (inventory, COGS, revenue)"]}
      userActions={["Create new item","Edit item details","Set pricing tiers","View stock levels","Deactivate item"]}
    />
  )
}

