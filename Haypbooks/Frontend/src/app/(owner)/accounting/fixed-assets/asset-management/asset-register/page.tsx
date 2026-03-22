'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetRegisterPage() {
  return (
    <PageDocumentation
      title="Asset Register"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Asset Management / Asset Register"
      purpose="The master list of all capital assets owned by the company, showing acquisition cost, accumulated depreciation, and net book value in real time."
      components={[
        { name: "Asset Table", description: "Sortable/filterable list of all assets with key financial figures" },
        { name: "Asset Detail Panel", description: "Expandable panel showing full asset history and depreciation schedule" },
        { name: "Bulk Actions Bar", description: "Select multiple assets to depreciate, transfer, or dispose" },
        { name: "Filter Bar", description: "Filter by category, location, status, and acquisition date range" },
      ]}
      tabs={[
        "All Assets",
        "Active",
        "Fully Depreciated",
        "Disposed",
        "In Transfer",
      ]}
      features={[
        "Real-time net book value",
        "Depreciation schedule preview",
        "Bulk disposal/transfer",
        "Asset photo attachment",
        "QR/barcode label printing",
        "Integration with purchasing",
      ]}
      dataDisplayed={[
        "Asset name, code, and serial number",
        "Acquisition date and cost",
        "Depreciation method and useful life",
        "Accumulated depreciation to date",
        "Net book value",
        "Location and assigned department",
        "Asset status",
      ]}
      userActions={[
        "Add a new asset",
        "Run depreciation for selected assets",
        "Initiate asset transfer",
        "Record disposal",
        "Attach photo or document",
        "Export asset register to Excel",
      ]}
    />
  )
}

