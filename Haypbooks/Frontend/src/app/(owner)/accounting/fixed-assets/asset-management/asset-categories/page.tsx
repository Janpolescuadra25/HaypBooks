'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetCategoriesPage() {
  return (
    <PageDocumentation
      title="Asset Categories"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Asset Management / Asset Categories"
      purpose="Define and manage asset categories (e.g., Vehicles, Equipment, Furniture) that control default depreciation method, useful life, and GL account mappings."
      components={[
        { name: "Category List", description: "All asset categories with default depreciation settings" },
        { name: "Category Form", description: "Create/edit form for category name, depreciation method, useful life, and salvage value rate" },
        { name: "GL Account Mapping", description: "Link each category to the corresponding asset, accumulated depreciation, and depreciation expense accounts" },
      ]}
      tabs={[
        "All Categories",
        "Create New",
      ]}
      features={[
        "Depreciation method defaults (SL, DB, Units)",
        "Useful life presets",
        "GL account auto-mapping",
        "Category-level reporting",
        "Import/export categories",
      ]}
      dataDisplayed={[
        "Category name and code",
        "Default depreciation method",
        "Default useful life (months/years)",
        "Linked GL accounts",
        "Number of assets in category",
      ]}
      userActions={[
        "Create a new asset category",
        "Edit depreciation defaults",
        "Map GL accounts",
        "Delete an unused category",
        "Export category list",
      ]}
    />
  )
}

