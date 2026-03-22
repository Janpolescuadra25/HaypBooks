'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AssetLocationsPage() {
  return (
    <PageDocumentation
      title="Asset Locations"
      module="ACCOUNTING — FIXED ASSETS"
      breadcrumb="Accounting / Fixed Assets / Asset Management / Asset Locations"
      purpose="Maintain a registry of physical locations where assets are deployed, enabling location-based reporting and asset tracking."
      components={[
        { name: "Location List", description: "All registered locations with address and asset count" },
        { name: "Location Form", description: "Create/edit form for location name, address, and responsible manager" },
        { name: "Assets at Location", description: "Drill-down view of all assets assigned to a specific location" },
      ]}
      tabs={[
        "All Locations",
        "Create New",
      ]}
      features={[
        "Hierarchical location structure (site > building > floor)",
        "Asset count per location",
        "Location transfer history",
        "QR code printing for location labels",
      ]}
      dataDisplayed={[
        "Location name and code",
        "Address and contact",
        "Number of assets at location",
        "Asset net book value by location",
      ]}
      userActions={[
        "Create a new location",
        "Edit location details",
        "View assets at a location",
        "Transfer assets between locations",
        "Export location report",
      ]}
    />
  )
}

