'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Inventory Categories"
      module="INVENTORY"
      breadcrumb="Inventory / Setup / Categories"
      purpose="Organize inventory items into categories and sub-categories for reporting, pricing, and management. Assign default GL accounts and tax settings per category."
      components={[
        { name: "Category Tree", description: "Hierarchical list of all categories and sub-categories" },
        { name: "Create Category Form", description: "Name, parent category, default GL inventory account, and description" },
        { name: "Default Settings", description: "Assign default tax codes, cost method, and accounts per category" },
        { name: "Item Count", description: "Number of items assigned to each category" },
        { name: "Move Items", description: "Bulk reassign items from one category to another" },
      ]}
      tabs={["All Categories","Item Assignments"]}
      features={["Hierarchical category structure","Default GL account per category","Default tax code","Cost method setting","Bulk item reassignment"]}
      dataDisplayed={["Category name and hierarchy level","Number of items","Default GL account","Default tax code","Category description"]}
      userActions={["Create category","Edit category settings","Move items between categories","Set default accounts","Deactivate category"]}
    />
  )
}

