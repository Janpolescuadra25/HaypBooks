'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="System Health"
      module="AUTOMATION"
      breadcrumb="Automation / Monitoring / System Health"
      purpose="System Health provides a real-time technical health dashboard for the Haypbooks platform showing server status, API response times, database performance, background job queue health, integration status, and any active incidents. It helps administrators monitor platform operations and quickly identify technical issues affecting system performance."
      components={[
        { name: 'Service Status Panel', description: 'Green/yellow/red status indicators for: API Server, Database, File Storage, Email Service, Bank Feed Integration, Payment Gateway.' },
        { name: 'Response Time Chart', description: 'Real-time line chart of API response times over the last 4 hours.' },
        { name: 'Background Job Queue', description: 'Active background job statistics: queue depth, processing rate, and any stalled jobs.' },
        { name: 'Active Incidents Log', description: 'Any currently open incidents with severity, description, and estimated resolution time.' },
        { name: 'Integration Health', description: 'Status of all connected integrations (bank feeds, payment processors, tax APIs) with last successful sync time.' },
      ]}
      tabs={['Overview', 'Services', 'Integrations', 'Job Queue', 'Incidents']}
      features={[
        'Real-time service status monitoring',
        'API performance metrics',
        'Background job queue monitoring',
        'Integration connection health checks',
        'Incident tracking and status updates',
        'Historical uptime and performance trends',
      ]}
      dataDisplayed={[
        'Per-service status (operational / degraded / down)',
        'API response time (p50, p95, p99)',
        'Background job queue depth and processing rate',
        'Integration last successful sync timestamps',
        'Active incidents with severity and status',
        'Uptime percentage for last 30 days',
      ]}
      userActions={[
        'Refresh health status',
        'Drill into a service for detailed metrics',
        'View historical uptime report',
        'Report an incident',
        'Subscribe to status alerts',
        'Trigger manual resync for an integration',
      ]}
      relatedPages={[
        { label: 'Automation Logs', href: '/automation/monitoring/automation-logs' },
        { label: 'Performance Dashboard', href: '/automation/monitoring/performance-dashboard' },
        { label: 'Integrations', href: '/apps-integrations/integration-hub/available-integrations' },
      ]}
    />
  )
}

