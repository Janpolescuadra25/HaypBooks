'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function SystemAlertsPage() {
  return (
    <PageDocumentation
      title="System Alerts"
      module="SETTINGS"
      breadcrumb="Settings / Notifications / System Alerts"
      purpose="System Alerts manages real-time in-app and email notifications triggered by specific business events such as overdue invoices, low inventory thresholds, failed payments, or approaching budget limits. Each alert type can be individually enabled or disabled, and threshold values can be customized to match the business's tolerance levels. Alerts ensure the team stays informed of time-sensitive issues without logging in to check manually."
      components={[
        { name: 'Alert Rules Table', description: 'List of all available alert types with enable/disable toggle, threshold field, and notification channel.' },
        { name: 'Threshold Config', description: 'Numeric input fields to set the trigger threshold for quantity-based alerts like low stock or overdue days.' },
        { name: 'Notification Channel Selector', description: 'Per-alert toggle to send via in-app notification, email, or both.' },
        { name: 'Alert History Log', description: 'Recent history of triggered alerts with event description, severity, and response status.' },
        { name: 'Test Alert Button', description: 'Trigger a test notification to verify that a configured alert channel is working correctly.' },
      ]}
      tabs={['Financial Alerts', 'Operations Alerts', 'Security Alerts', 'Custom Alerts']}
      features={[
        'Enable or disable individual alert rules for each event type',
        'Set custom thresholds for quantity and amount-based alerts',
        'Route alerts to in-app, email, or both channels per rule',
        'Test alert delivery before relying on it for critical notifications',
        'View alert trigger history to review past system events',
        'Create custom alerts for business-specific event conditions',
      ]}
      dataDisplayed={[
        'Alert type and event description',
        'Enable/disable status per alert',
        'Configured threshold values',
        'Notification channel (in-app, email)',
        'Last triggered date and outcome',
      ]}
      userActions={[
        'Enable or disable specific alert rules',
        'Set alert threshold values',
        'Configure notification delivery channel',
        'Send a test alert notification',
        'View and acknowledge recent alert history',
      ]}
    />
  )
}

