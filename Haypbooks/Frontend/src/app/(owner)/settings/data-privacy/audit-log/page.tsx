'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AuditLogPage() {
  return (
    <PageDocumentation
      title="Audit Log"
      module="SETTINGS"
      breadcrumb="Settings / Data & Privacy / Audit Log"
      purpose="Audit Log records every significant user action and system event — including logins, data edits, deletions, exports, and configuration changes — creating an immutable trail for security and compliance purposes. Auditors and administrators use this log to investigate anomalies, confirm who changed what and when, and demonstrate compliance with internal controls or external regulations. Logs are retained for the duration defined by the company's data retention policy."
      components={[
        { name: 'Event Timeline Table', description: 'Chronological table of all audit events with actor, action type, affected record, and timestamp.' },
        { name: 'Advanced Filters Bar', description: 'Multi-field filter supporting actor (user), event type, module, date range, and IP address.' },
        { name: 'Event Detail Panel', description: 'Slide-out panel showing full event context: before/after values, session ID, and IP geolocation.' },
        { name: 'Export Controls', description: 'Options to export filtered audit log entries to CSV or PDF for external compliance reporting.' },
        { name: 'Retention Policy Display', description: 'Banner showing current log retention duration and next purge date under company policy.' },
      ]}
      tabs={['All Events', 'User Actions', 'System Events', 'Security Events', 'Data Changes']}
      features={[
        'Immutable chronological log of all user and system actions',
        'Filter by user, module, action type, date range, or IP address',
        'View before/after values for every data modification event',
        'Export filtered log for external audit submissions',
        'Track failed login attempts and security events separately',
        'Review data export and deletion events for data governance',
      ]}
      dataDisplayed={[
        'Event type and description',
        'Actor (user name and ID) and timestamp',
        'Affected record type and ID',
        'IP address and device/browser info',
        'Before and after values for data change events',
      ]}
      userActions={[
        'Filter audit log by user, date, module, or event type',
        'View full event detail with before/after comparison',
        'Export audit log to CSV or PDF',
        'Search for specific record or user activity',
        'Review security events tab for access anomalies',
      ]}
    />
  )
}

