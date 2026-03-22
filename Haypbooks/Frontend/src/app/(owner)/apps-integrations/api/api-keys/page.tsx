'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="API Keys"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / API / API Keys"
      purpose="API Keys manages the authentication credentials for developers and systems using the Haypbooks REST API to build custom integrations. Each API key has a name (describing its purpose), permission scope (read-only, read-write, or specific modules), creation date, last used date, and expiry. API keys are the authorization mechanism for accessing Haypbooks data programmatically. Security best practices: use the minimum needed scope, rotate keys regularly, revoke unused keys immediately, and never share keys in source code."
      components={[
        { name: 'API Key List', description: 'All API keys: name, partial key display (masked), scope, created, last used, and status (active/expired/revoked).' },
        { name: 'Create API Key Form', description: 'Name the key, select permissions scope (modules and read/write access), set optional expiry date.' },
        { name: 'Key Reveal (One-time)', description: 'After creation, the full key is shown once — user must copy it immediately. It is never shown again.' },
        { name: 'Usage Log', description: 'API request log per key: timestamp, endpoint called, IP address, and response code.' },
        { name: 'Revoke Key', description: 'Immediately revoke an API key — any system using it will lose access instantly.' },
      ]}
      tabs={['Active Keys', 'Revoked Keys', 'Usage Log']}
      features={[
        'API key creation and management',
        'Per-key permission scope definition',
        'Key expiry configuration',
        'API usage log per key',
        'Immediate key revocation',
        'Rate limit per key configuration',
        'IP restriction per key',
      ]}
      dataDisplayed={[
        'All API keys with status and last-used date',
        'Permission scope per key',
        'API request history per key',
        'Revoked keys archive',
      ]}
      userActions={[
        'Create a new API key',
        'Copy API key on creation',
        'View usage log for a key',
        'Revoke an API key',
        'Set key expiry or IP restriction',
        'Export API usage log',
      ]}
      relatedPages={[
        { label: 'Webhooks', href: '/apps-integrations/api/webhooks' },
        { label: 'API Documentation', href: '/apps-integrations/api/api-docs' },
        { label: 'Security Log', href: '/settings/security/security-log' },
      ]}
    />
  )
}

