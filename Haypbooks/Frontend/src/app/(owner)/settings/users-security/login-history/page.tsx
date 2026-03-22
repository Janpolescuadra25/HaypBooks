'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function LoginHistoryPage() {
  return (
    <PageDocumentation
      title="Login History"
      module="SETTINGS"
      breadcrumb="Settings / Users & Security / Login History"
      purpose="Login History shows a complete record of all authentication events for all users in the organization — including successful logins, failed attempts, logouts, and session durations. Security administrators use this page to detect suspicious access patterns, identify unauthorized login attempts, and confirm that multi-factor authentication is being enforced. Records include device type, browser, IP address, and geolocation for each event."
      components={[
        { name: 'Login Events Table', description: 'Chronological table of all auth events with user, timestamp, IP, device, status (success/failed), and action.' },
        { name: 'User Filter', description: 'Dropdown to filter events by a specific user or show all users at once.' },
        { name: 'Date Range Filter', description: 'Date picker to narrow login history to a specific investigation window.' },
        { name: 'Suspicious Activity Flags', description: 'Auto-flagged rows for events that match anomaly patterns: unknown location, multiple failures, new device.' },
        { name: 'Session Revocation', description: 'Admin action to force-terminate an active session for any user from this table.' },
      ]}
      tabs={['All Events', 'Failed Attempts', 'Active Sessions', 'Flagged Activity']}
      features={[
        'View full login history for all users with device and IP data',
        'Filter by user, date range, or event type',
        'See auto-flagged anomalous events for security review',
        'Force-terminate active sessions for any user',
        'Export login history for security audit reports',
        'Identify patterns of failed login attempts by IP',
      ]}
      dataDisplayed={[
        'User name and email',
        'Login timestamp and session duration',
        'IP address and geolocation',
        'Device type, browser, and OS',
        'Event status (success, failed, logout, 2FA challenge)',
      ]}
      userActions={[
        'Filter login history by user or date range',
        'Review flagged suspicious activity',
        'Force-terminate an active user session',
        'Export login history to CSV',
        'Block an IP address from login attempts',
      ]}
    />
  )
}

