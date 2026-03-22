'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="App Marketplace"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Connected Apps / Marketplace"
      purpose="The App Marketplace is the directory of all third-party applications and integrations available to connect with Haypbooks. Users can browse apps by category (banking, e-commerce, payment gateways, POS, CRM, HR, logistics, government portals), view integration details, and install with one-click OAuth authorization. Integrations sync data bidirectionally to eliminate duplicate data entry across multiple systems — for example, syncing sales orders from Shopify directly into Haypbooks as invoices."
      components={[
        { name: 'App Directory', description: 'Browse all available integrations organized by category: Banking, E-commerce, Payments, Government, HR, CRM, Logistics, Other.' },
        { name: 'App Detail Page', description: 'Per app: description, what data is synced, how often, required permissions, pricing (if applicable), and user reviews.' },
        { name: 'Install / Connect Button', description: 'OAuth-based authorization to connect the external system to Haypbooks. Opens authorization flow in the external app.' },
        { name: 'New App Requests', description: 'Request an integration not yet in the marketplace — submit to Haypbooks product team.' },
      ]}
      tabs={['All Apps', 'Banking', 'E-commerce', 'Payments', 'Government', 'HR & Payroll', 'Installed']}
      features={[
        'Third-party app integration marketplace',
        'One-click OAuth-based installation',
        'Apps organized by business category',
        'Integration data flow description',
        'New integration request submission',
        'App rating and review system',
        'Enterprise-only integrations marked',
      ]}
      dataDisplayed={[
        'All available integrations',
        'Installed vs. available apps',
        'What data each integration syncs',
        'Integration sync frequency',
      ]}
      userActions={[
        'Browse integrations by category',
        'View integration details',
        'Install an integration',
        'Request a new integration',
        'View installed apps',
      ]}
      relatedPages={[
        { label: 'Installed Apps', href: '/apps-integrations/connected-apps/installed-apps' },
        { label: 'API Keys', href: '/apps-integrations/api/api-keys' },
        { label: 'Sync Settings', href: '/apps-integrations/data-sync/sync-settings' },
      ]}
    />
  )
}

