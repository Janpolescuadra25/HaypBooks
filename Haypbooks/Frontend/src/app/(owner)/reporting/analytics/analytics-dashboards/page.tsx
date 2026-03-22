'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Analytics Dashboards"
      module="REPORTING"
      breadcrumb="Reporting / Analytics / Analytics Dashboards"
      purpose="Analytics Dashboards provides configurable visual dashboards for real-time financial metrics monitoring. Unlike the standard reports (which are period-end documents), dashboards show live aggregated metrics in chart and KPI card format — updated as transactions are entered. Users can create multiple dashboards (e.g., Executive Dashboard, AR Follow-up Dashboard, Tax Compliance Dashboard) and customize the widgets shown on each. Dashboards can be shared with specific team roles or made visible to all users."
      components={[
        { name: 'Dashboard Canvas', description: 'Grid-based canvas where widgets are arranged by drag-and-drop.' },
        { name: 'Widget Library', description: 'Available widgets: KPI cards (single metric), line charts, bar charts, pie charts, tables, and heatmaps.' },
        { name: 'Data Binding', description: 'Configure each widget\'s data source, metric, time range, and comparison period.' },
        { name: 'Dashboard Sharing', description: 'Share dashboard with specific roles or users, or set as company-wide default.' },
        { name: 'Auto-Refresh', description: 'Configure dashboard auto-refresh interval (every 5/15/30 minutes or manual).' },
      ]}
      tabs={['My Dashboards', 'Shared Dashboards', 'Templates', 'Create New']}
      features={[
        'Configurable, drag-and-drop dashboard builder',
        'Rich widget library (KPI cards, charts, tables)',
        'Live data from all Haypbooks modules',
        'Multiple dashboards per user',
        'Dashboard sharing and access control',
        'Dashboard templates for common use cases',
        'Auto-refresh for live monitoring',
        'Mobile-responsive dashboard layout',
      ]}
      dataDisplayed={[
        'Real-time financial KPIs per widget configuration',
        'Charts of configured metrics',
        'All dashboards created and shared',
        'Dashboard widget configuration',
      ]}
      userActions={[
        'Create a new analytics dashboard',
        'Add and configure widgets',
        'Rearrange widgets via drag-and-drop',
        'Share a dashboard with colleagues',
        'Set a dashboard as default landing page',
        'Use a dashboard template',
        'Export dashboard as PDF',
      ]}
      relatedPages={[
        { label: 'AI Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'Report Builder', href: '/reporting/custom-reports/report-builder' },
        { label: 'Performance Analytics', href: '/ai-analytics/reports/performance-analytics' },
      ]}
    />
  )
}

