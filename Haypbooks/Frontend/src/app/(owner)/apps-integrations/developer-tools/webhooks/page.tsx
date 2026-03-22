'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Webhooks"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Developer Tools / Webhooks"
      purpose="Configure webhooks to receive real-time event notifications at your HTTP endpoints whenever records change in Haypbooks. Supports retry logic and delivery verification."
      components={[
        { name: "Webhook List", description: "All configured webhooks with URL, status, event subscriptions, and delivery rate" },
        { name: "Create Webhook Form", description: "Register a new endpoint URL and select which events to subscribe to" },
        { name: "Event Catalog", description: "Full list of available webhook events by module" },
        { name: "Delivery Log", description: "History of webhook delivery attempts with HTTP response codes and payloads" },
        { name: "Secret Signing", description: "HMAC signature configuration to verify webhook authenticity" },
      ]}
      tabs={["My Webhooks","Event Catalog","Delivery Logs"]}
      features={["100+ event types across modules","HMAC signature verification","Automatic retry on failure","Delivery log with payloads","Event filtering"]}
      dataDisplayed={["Webhook endpoint URL","Subscribed event types","Last delivery status and timestamp","Delivery success rate","Response time"]}
      userActions={["Add webhook endpoint","Select event subscriptions","Test webhook delivery","View delivery logs","Disable or delete webhook"]}
    />
  )
}

