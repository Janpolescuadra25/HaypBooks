'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="API Documentation"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Developer Tools / API Documentation"
      purpose="Interactive API reference covering all Haypbooks endpoints. Includes authentication guide, request/response examples, SDKs in multiple languages, and a live request tester."
      components={[
        { name: "Endpoint Reference", description: "Full list of REST endpoints with method, path, and description" },
        { name: "Request Builder", description: "Interactive form to build and test API requests live against the sandbox" },
        { name: "Code Samples", description: "Auto-generated code examples in JavaScript, Python, PHP, and cURL" },
        { name: "Authentication Guide", description: "Step-by-step guide for API key and OAuth 2.0 authentication" },
        { name: "SDK Downloads", description: "Official client libraries for major programming languages" },
      ]}
      tabs={["Endpoints","Authentication","Webhooks","SDKs","Changelog"]}
      features={["Interactive try-it console","Multiple language code samples","Full schema documentation","OAuth 2.0 guide","Webhook event reference"]}
      dataDisplayed={["All API endpoints grouped by module","Request parameters and body schemas","Response schemas with example JSON","Error codes and meaning","Rate limit info"]}
      userActions={["Browse endpoint reference","Test endpoints live","Copy code samples","Download SDK","View schema definitions"]}
    />
  )
}

