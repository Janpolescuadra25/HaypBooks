'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Featured Apps"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Discover / Featured Apps"
      purpose="Curated list of recommended integrations selected by Haypbooks and sorted by popularity. Discover the most widely used tools for payments, banking, payroll, and business operations."
      components={[
        { name: "Featured Banner", description: "Highlighted promoted integration of the month with full-width callout" },
        { name: "Curated Collections", description: "Themed integration packs (e.g. Payroll Bundle, Payments Bundle)" },
        { name: "Popular Apps Grid", description: "Top-installed integrations ranked by active installs" },
        { name: "New Arrivals", description: "Recently added integrations to the marketplace" },
      ]}
      tabs={["Editor's Picks","Popular","New","Bundles"]}
      features={["Editor's picks","Curated bundles by use case","Popularity ranking","New arrivals section","Quick-install from list"]}
      dataDisplayed={["Featured integration details","Bundle contents and descriptions","Install counts for popular apps","New release dates","User ratings"]}
      userActions={["View featured integration","Install integration from list","Browse curated bundles","Filter by business type"]}
    />
  )
}

