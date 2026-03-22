'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function NewAssetPage() {
  return (
    <PageDocumentation
      title="New Asset"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Asset Management / New Asset"
      purpose="Guided form to capitalize and register a new fixed asset, linking it to a purchase order or bill and setting depreciation parameters."
      components={[
        { name: "Asset Details Form", description: "Name, serial number, category, location, and department fields" },
        { name: "Financial Settings", description: "Acquisition cost, purchase date, useful life, salvage value, and depreciation method" },
        { name: "GL Account Defaults", description: "Auto-populated from category with manual override option" },
        { name: "Document Attachment", description: "Upload purchase invoice or receipt as supporting document" },
      ]}
      tabs={[
        "Asset Details",
        "Depreciation Setup",
        "GL Accounts",
        "Documents",
      ]}
      features={[
        "Category-driven defaults",
        "Purchase order/bill linkage",
        "Depreciation projection chart before saving",
        "Multi-currency acquisition cost",
        "Auto-generate asset code",
      ]}
      dataDisplayed={[
        "Form fields for new asset entry",
        "Depreciation schedule preview",
        "Linked purchase record",
        "Estimated first-year depreciation",
      ]}
      userActions={[
        "Fill in asset details",
        "Select depreciation method",
        "Link to purchase order or bill",
        "Attach invoice",
        "Save and capitalize asset",
      ]}
    />
  )
}

