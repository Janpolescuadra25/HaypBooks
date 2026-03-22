'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Notification Preferences"
      module="SETTINGS"
      breadcrumb="Settings / Notifications / Notification Preferences"
      purpose="Notification Preferences lets each user (and administrators at the organization level) configure which system events generate notifications and through which channel (email, in-app bell, SMS). Users can subscribe to notifications for: new tasks assigned, approvals needed, invoices overdue, payroll run completion, bank feed new transactions, system alerts, and period close reminders. Well-configured notifications ensure the right people are alerted at the right time without notification overload."
      components={[
        { name: 'Personal Notification Settings', description: "Each user's own notification preferences: which events to be notified about, and channel (in-app, email, SMS)." },
        { name: 'Organization-Level Alerts', description: 'Admin can configure mandatory organization-wide alerts that all relevant users receive (e.g., data export, admin login).' },
        { name: 'Module Notification Categories', description: 'Notifications organized by module: Banking, Invoicing, AP, Payroll, Compliance, Tasks, System, Security.' },
        { name: 'Notification Digest', description: 'Option to receive a daily digest instead of individual notifications for non-urgent events.' },
      ]}
      tabs={['My Notifications', 'Org-Level Alerts', 'By Module', 'Digest Settings']}
      features={[
        'Per-user customizable notification preferences',
        'Multi-channel: in-app, email, SMS',
        'Module-by-module notification control',
        'Organization-wide mandatory alerts',
        'Daily digest option for non-urgent notifications',
        'Notification history for missed notifications',
      ]}
      dataDisplayed={[
        "User's current notification subscriptions",
        'Org-level mandatory alerts',
        'Notification delivery history',
        'Unread notification count in-app',
      ]}
      userActions={[
        'Subscribe or unsubscribe to specific notification types',
        'Set preferred notification channel',
        'Enable daily digest mode',
        'Configure org-level mandatory alerts (admin)',
        'View notification history',
      ]}
      relatedPages={[
        { label: 'System Health', href: '/automation/monitoring/system-health' },
        { label: 'User Management', href: '/settings/users/user-management' },
        { label: 'Email Notifications', href: '/automation/smart-automation/email-notifications' },
      ]}
    />
  )
}

