'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='AR Aging Alerts'
      module='SALES'
      breadcrumb='Sales / Collections / AR Aging Alerts'
      purpose='Configures and manages automated alerts and notifications triggered when customer accounts reach defined aging thresholds. Ensures collections staff, account managers, and finance teams receive timely reminders to act on overdue balances before they become bad debts.'
      components={[
        { name: 'Alert Rule Builder', description: 'Define alert triggers based on aging bucket, amount threshold, and customer segment' },
        { name: 'Notification Channel Settings', description: 'Configure delivery via email, in-app notification, or SMS for each alert type' },
        { name: 'Alert Activity Log', description: 'History of all alerts triggered with recipient, time, and action taken' },
        { name: 'Escalation Chain Manager', description: 'Set escalation rules that elevate alerts to senior staff if not acted on' },
        { name: 'Alert Suppression Controls', description: 'Suppress alerts for customers in dispute or payment arrangement' },
      ]}
      tabs={['Alert Rules', 'Active Alerts', 'Alert History', 'Escalation Rules']}
      features={['Rule-based alert triggers by aging bucket and amount', 'Multi-channel notification delivery', 'Escalation chains for unresolved alerts', 'Alert suppression for disputed accounts', 'Alert action tracking and logging', 'Customer-specific threshold overrides', 'Summary digest alerts for management']}
      dataDisplayed={['Alert rule name and trigger conditions', 'Customer accounts currently triggering alerts', 'Alert delivery status and timestamp', 'Escalation level and escalation recipient', 'Suppressed accounts and reason', 'Average days to resolution', 'Alert volume trends']}
      userActions={['Create new aging alert rule', 'Configure notification channels', 'View active alerts', 'Respond to alert and log action', 'Suppress alert for disputed account', 'Set escalation chain', 'Review alert history']}
      relatedPages={[
        { label: 'AR Aging', href: '/sales/collections/ar-aging' },
        { label: 'Dunning Management', href: '/sales/collections/dunning-management' },
        { label: 'Customer Statements', href: '/sales/billing/customer-statements' },
      ]}
    />
  )
}
