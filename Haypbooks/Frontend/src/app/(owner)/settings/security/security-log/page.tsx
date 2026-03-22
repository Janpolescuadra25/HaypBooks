'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Security Log"
      module="SETTINGS"
      breadcrumb="Settings / Security / Security Log"
      purpose="The Security Log (also called the Audit Security Log) is the complete record of all security-relevant events in the Haypbooks system — logins (success and failure), password changes, 2FA enrollments and resets, security setting changes, user account changes, role and permission modifications, and data export events. The security log is immutable (cannot be deleted or modified) and serves as the forensic record for incident investigation, compliance audits, and internal controls review."
      components={[
        { name: 'Security Event Log', description: 'Chronological log of all security events with timestamp, event type, user, IP address, device, and outcome.' },
        { name: 'Event Type Filter', description: 'Filter by: Login Success, Login Failed, Logout, Password Change, Role Changed, User Created/Deactivated, Permission Changed, 2FA Event, Data Export.' },
        { name: 'Suspicious Activity Alerts', description: 'Auto-flag unusual events: multiple failed logins, login from new country/IP, unusual hour access.' },
        { name: 'Export for Audit', description: 'Export the security log for compliance review or external audit.' },
      ]}
      tabs={['All Events', 'Login Events', 'User Changes', 'Permission Changes', 'Suspicious Activity']}
      features={[
        'Immutable security event audit log',
        'All login and authentication events',
        'User management change tracking',
        'Permission and role change history',
        'Suspicious activity detection and alerting',
        'Export for external audit',
        'Search by user, IP, or event type',
      ]}
      dataDisplayed={[
        'All security events with timestamp and user',
        'Failed login attempts with IP',
        'User account changes with administrator',
        'Permission changes with before/after',
        'Suspicious activity flags',
      ]}
      userActions={[
        'Browse security event log',
        'Filter by event type or date range',
        'Search by user or IP address',
        'Investigate a security incident',
        'Export security log to CSV/PDF',
        'Configure suspicious activity alert thresholds',
      ]}
      relatedPages={[
        { label: 'Security Settings', href: '/settings/security/security-settings' },
        { label: 'User Management', href: '/settings/users/user-management' },
        { label: 'Audit Trails', href: '/automation/monitoring/audit-trails' },
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
      ]}
    />
  )
}

