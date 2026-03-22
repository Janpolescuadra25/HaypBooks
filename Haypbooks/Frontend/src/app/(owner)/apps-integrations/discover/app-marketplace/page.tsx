'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="App Marketplace"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Discover / App Marketplace"
      purpose="Browse and install 100+ third-party app integrations. Filter by category such as payments, CRM, e-commerce, and payroll to find the tools your business needs."
      components={[
        { name: "App Gallery", description: "Searchable grid of integrations with name, logo, category, and install button" },
        { name: "Category Sidebar", description: "Filter integrations by category, publisher, or region" },
        { name: "App Detail Modal", description: "Integration overview with features, required permissions, and screenshots" },
        { name: "Install Flow", description: "OAuth authorization or API key entry to connect the app to Haypbooks" },
      ]}
      tabs={["All Apps","By Category","Popular","New Arrivals"]}
      features={["100+ integrations","Category and keyword search","Permission review before install","Ratings and reviews","One-click install"]}
      dataDisplayed={["Integration name, logo, and description","Category and publisher","User rating and install count","Required permissions","Supported sync direction"]}
      userActions={["Search and browse integrations","Filter by category","View integration details","Install integration","Revoke integration access"]}
    />
  )
}

