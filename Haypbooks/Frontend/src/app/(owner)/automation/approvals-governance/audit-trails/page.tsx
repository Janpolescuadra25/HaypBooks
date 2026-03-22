'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Audit Trails"
      module="AUTOMATION"
      breadcrumb="Automation / Approvals & Governance / Audit Trails"
      purpose="Audit Trails is the comprehensive immutable system log recording every meaningful action taken by any user or automated process within Haypbooks. Every record creation, modification, deletion, login, approval, setting change, and export is logged with the actor, timestamp, IP address, and before/after values. This page provides search and export access to the full audit log for compliance verification, dispute resolution, and security investigation."
      components={[
        { name: 'Audit Log Table', description: 'Chronological list of all audit events with actor, action type, module, affected record, timestamp, and IP.' },
        { name: 'Advanced Search', description: 'Search by user, date range, action type, module, record ID, or IP address.' },
        { name: 'Change Detail Panel', description: 'For data changes: shows field name, before value, and after value side-by-side.' },
        { name: 'Export', description: 'Export filtered audit log to CSV or PDF for compliance submission.' },
        { name: 'Retention Settings', description: 'Configure how long audit logs are retained (minimum: 7 years for financial compliance).' },
      ]}
      tabs={['All Events', 'User Actions', 'System Events', 'Data Changes', 'Security Events']}
      features={[
        'Tamper-proof immutable audit log',
        'Full before/after change tracking for all data mutations',
        'User login/logout and session tracking',
        'Export and filter for compliance submission',
        'IP address and browser agent logging',
        'Long-term retention (7+ years) for financial records',
      ]}
      dataDisplayed={[
        'Event timestamp and type',
        'Actor (user name, user ID, or system process)',
        'Action performed (create/update/delete/approve/export/login)',
        'Affected module and record reference',
        'IP address and session ID',
        'Before and after field values for data changes',
      ]}
      userActions={[
        'Search audit log by user or date range',
        'Filter by action type or module',
        'View change detail for a specific event',
        'Export filtered audit log to CSV',
        'Configure log retention policy',
      ]}
      relatedPages={[
        { label: 'Automation Logs', href: '/automation/monitoring/automation-logs' },
        { label: 'Security Log', href: '/settings/security/security-log' },
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
      ]}
    />
  )
}

