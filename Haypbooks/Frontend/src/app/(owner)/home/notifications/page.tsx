'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Notifications"
      module="HOME"
      breadcrumb="Home / Notifications"
      purpose="The Notifications page is the central notification inbox for the Haypbooks platform, surfacing all system-generated alerts, activity updates, action requests, approval notifications, payment events, and mentions for the logged-in user. It consolidates all cross-module activity into a single prioritized feed so users never miss time-sensitive actions that require their attention."
      components={[
        { name: 'Notification Feed', description: 'Chronological list of all notifications with unread indicator dot, event type icon, message, source module badge, and timestamp.' },
        { name: 'Category Filter Tabs', description: 'Tabs to filter: All, Unread, Action Required, Approvals, Payments, Alerts, System, Mentions.' },
        { name: 'Mark All Read', description: 'Bulk action button to mark all notifications as read or to archive all dismissed items.' },
        { name: 'Notification Settings', description: 'Quick link to notification preferences for controlling delivery methods and event subscriptions.' },
        { name: 'Empty State', description: 'Friendly empty state illustration when no unread notifications exist.' },
      ]}
      tabs={['All', 'Unread', 'Action Required', 'Approvals', 'Payments', 'Alerts']}
      features={[
        'Real-time notification delivery',
        'Priority sorting (action required first)',
        'Deep link from notification to source record',
        'Grouped notifications for related events',
        'Configurable delivery: in-app, email, SMS',
        'Notification retention history with search',
        'Unread count badge in global navigation',
      ]}
      dataDisplayed={[
        'Notification message and event description',
        'Source module and event type',
        'Linked record reference (e.g., Invoice #1042)',
        'Timestamp and relative time (e.g., "2 hours ago")',
        'Triggering user or system process',
        'Read / unread status',
      ]}
      userActions={[
        'Click notification to open source record',
        'Mark individual notification as read',
        'Mark all notifications as read',
        'Archive or dismiss notifications',
        'Filter by notification category',
        'Configure notification preferences',
        'Search past notification history',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'Notification Preferences', href: '/settings/notifications/system-alerts' },
        { label: 'Email Digest', href: '/settings/notifications/email-digest-settings' },
      ]}
    />
  )
}

