'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="API Keys"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Developer Tools / API Keys"
      purpose="Create and manage API keys for programmatic access to Haypbooks data. Assign scoped permissions, set expiration dates, and revoke keys when no longer needed."
      components={[
        { name: "API Key List", description: "Table of all active and revoked API keys with name, permissions, and last used" },
        { name: "Create Key Form", description: "Form to name a new key and assign permission scopes (read, write, admin)" },
        { name: "Key Detail Panel", description: "View key permissions, creation date, expiration, and usage log" },
        { name: "Revoke Controls", description: "Immediately invalidate any API key" },
      ]}
      tabs={["Active Keys","Revoked Keys"]}
      features={["Scoped permissions (read/write/admin)","Key expiration dates","Usage tracking","Instant revocation","Multiple environments (sandbox/live)"]}
      dataDisplayed={["API key name and prefix","Assigned scopes and permissions","Creation and expiration dates","Last used timestamp","Creator user name"]}
      userActions={["Create new API key","Copy key secret (shown once)","View key details","Revoke key","Regenerate key"]}
    />
  )
}

