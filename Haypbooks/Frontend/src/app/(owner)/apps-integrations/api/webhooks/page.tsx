'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Webhooks"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / API / Webhooks"
      purpose="Webhooks allow Haypbooks to push real-time event notifications to external systems via HTTP POST requests. When a configured event occurs in Haypbooks (invoice created, payment received, payroll run completed, bank transaction synced), the system immediately POSTs event data to the configured webhook endpoint URL. Webhooks are used for building real-time integrations — e.g., trigger an automated action in another system the moment an invoice is marked paid in Haypbooks, without the external system needing to poll the API."
      components={[
        { name: 'Webhook List', description: 'All configured webhooks: name, endpoint URL, subscribed events, status, and last delivery.' },
        { name: 'Create Webhook Form', description: 'Configure endpoint URL, secret key (for signature verification), and select which events to subscribe to.' },
        { name: 'Event Type Selector', description: 'All subscribable events: invoice.created, invoice.paid, payment.received, payroll.completed, bill.created, bank.transaction.synced, etc.' },
        { name: 'Delivery Log', description: 'Per webhook: history of all delivery attempts with response code and latency. Retry failed deliveries.' },
        { name: 'Test Webhook', description: 'Send a test event payload to verify the endpoint is reachable and processes correctly.' },
      ]}
      tabs={['Active Webhooks', 'Delivery Log', 'Create New']}
      features={[
        'Real-time event push to external systems',
        'Event subscription selection',
        'HMAC signature for webhook security verification',
        'Delivery log and retry for failed deliveries',
        'Test webhook delivery',
        'IP allowlist for webhook source verification',
      ]}
      dataDisplayed={[
        'All webhooks with status and last delivery',
        'Subscribed events per webhook',
        'Delivery history with response codes',
        'Failed deliveries needing retry',
      ]}
      userActions={[
        'Create a new webhook endpoint',
        'Select events to subscribe',
        'Test a webhook delivery',
        'View delivery history',
        'Retry a failed delivery',
        'Disable or delete a webhook',
      ]}
      relatedPages={[
        { label: 'API Keys', href: '/apps-integrations/api/api-keys' },
        { label: 'API Documentation', href: '/apps-integrations/api/api-docs' },
        { label: 'Installed Apps', href: '/apps-integrations/connected-apps/installed-apps' },
      ]}
    />
  )
}

