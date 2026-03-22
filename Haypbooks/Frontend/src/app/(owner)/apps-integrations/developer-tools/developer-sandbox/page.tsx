'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Developer Sandbox"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Developer Tools / Developer Sandbox"
      purpose="Isolated test environment with pre-populated mock data for safely testing API integrations. All operations in the sandbox are isolated and do not affect live company data."
      components={[
        { name: "Sandbox Dashboard", description: "Overview of sandbox environment status, mock data summary, and reset controls" },
        { name: "Mock Data Manager", description: "Pre-seeded sample entities (customers, invoices, transactions) for testing" },
        { name: "Sandbox API Keys", description: "Separate API keys scoped only to the sandbox environment" },
        { name: "Reset Controls", description: "Reset the sandbox to factory defaults or a specific data snapshot" },
      ]}
      tabs={["Overview","Mock Data","API Keys","Logs","Reset"]}
      features={["Fully isolated from live data","Pre-seeded mock data","Sandbox-specific API keys","One-click environment reset","Side-by-side comparison with live"]}
      dataDisplayed={["Sandbox environment health","Mock record counts by entity","Sandbox API key list","Last reset date","Testing notes log"]}
      userActions={["Generate sandbox API key","Reset sandbox data","Seed custom mock data","View sandbox logs","Switch between sandbox and live"]}
    />
  )
}

