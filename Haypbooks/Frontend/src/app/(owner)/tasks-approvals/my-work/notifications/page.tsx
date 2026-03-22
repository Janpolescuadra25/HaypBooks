'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Notifications"
      module="TASKS"
      breadcrumb="Tasks & Approvals / My Work / Notifications"
      purpose="The Notifications page is the in-app notification center showing all system events, mentions, action requests, and alerts relevant to the logged-in user. It centralizes all notifications in a chronological feed so users never miss important updates. Notifications are categorized by type and urgency, with direct links to the source record or action."
      components={[
        { name: 'Notification Feed', description: 'Chronological list of all notifications with unread indicator, notification type icon, message, timestamp, and source record link.' },
        { name: 'Category Tabs', description: 'Filter by notification type: All, Action Required, Mentions, System Alerts, Approvals, Payments, Reports.' },
        { name: 'Mark All Read', description: 'Bulk action to mark all notifications as read or clear all dismissed notifications.' },
        { name: 'Notification Settings Link', description: 'Quick link to notification preferences to control which events generate notifications.' },
      ]}
      tabs={['All', 'Unread', 'Action Required', 'Mentions', 'System Alerts']}
      features={[
        'Real-time notification delivery via web socket',
        'Unread badge count shown in navigation',
        'Deep links to source record from notification',
        'Notification grouping for related events',
        'Configurable notification delivery (in-app, email, SMS)',
        'Archive of all notifications with search',
      ]}
      dataDisplayed={[
        'Notification message and event type',
        'Source module and linked record',
        'Timestamp and time since notification',
        'Unread / read status',
        'Actor (user or system that triggered the event)',
      ]}
      userActions={[
        'Click notification to navigate to source record',
        'Mark individual notification as read',
        'Mark all as read in bulk',
        'Dismiss / archive notifications',
        'Configure notification preferences',
        'Search notification history',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'My Approvals', href: '/tasks-approvals/my-work/my-approvals' },
        { label: 'System Alerts', href: '/settings/notifications/system-alerts' },
        { label: 'Email Digest Settings', href: '/settings/notifications/email-digest-settings' },
      ]}
    />
  )
}

