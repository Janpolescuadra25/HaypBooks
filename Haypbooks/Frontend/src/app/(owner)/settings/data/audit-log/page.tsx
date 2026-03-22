'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Audit Log"
      module="SETTINGS"
      breadcrumb="Settings / Data / Audit Log"
      purpose="The Audit Log is a comprehensive, immutable record of every data-changing action made in Haypbooks — who created, edited, approved, or deleted what record and when. It is distinct from the Security Log (which covers authentication and access events): the Audit Log covers transactional and data changes — invoices created/edited/deleted, journal entries posted, GL accounts changed, user permissions modified, settings changed. The Audit Log is required for financial statement integrity, internal controls, and external audit purposes."
      components={[
        { name: 'Audit Log Feed', description: 'Chronological record of all actions with user, timestamp, entity type (Invoice/Journal/Payment), record ID, and change type (Create/Edit/Delete/Approve).' },
        { name: 'Before/After Comparison', description: 'For edits: show field-by-field what changed — old value vs. new value.' },
        { name: 'Filter and Search', description: 'Filter by user, date range, module, record type, or action type.' },
        { name: 'Audit Export', description: 'Export audit log for external auditors or regulatory submission.' },
        { name: 'Record-Level Audit History', description: 'From any transaction record, view its complete audit trail: who created it, all edits, and who approved it.' },
      ]}
      tabs={['Complete Audit Log', 'By Module', 'By User', 'Critical Changes', 'Audit Export']}
      features={[
        'Immutable audit trail for all data changes',
        'Before/after field comparison for edits',
        'Multi-dimension filtering (user/module/date)',
        'Record-level audit history access',
        'Critical change highlighting (GL, permissions, settings)',
        'Export for external audit purpose',
        'Perpetual retention (no data expiry)',
      ]}
      dataDisplayed={[
        'All data changes with user and timestamp',
        'Before and after values for edits',
        'Deleted records (not recoverable from UI)',
        'Critical changes (GL, settings, user changes)',
        'Records with no audit trail gap',
      ]}
      userActions={[
        'Browse audit log',
        'Filter by user, date, module, or action',
        'View before/after for a specific edit',
        'View audit trail for a specific record',
        'Export audit log for external auditor',
      ]}
      relatedPages={[
        { label: 'Security Log', href: '/settings/security/security-log' },
        { label: 'Data Backup', href: '/settings/data/data-backup' },
        { label: 'Audit Trails', href: '/automation/monitoring/audit-trails' },
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
      ]}
    />
  )
}

