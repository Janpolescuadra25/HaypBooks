'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Data Backup"
      module="SETTINGS"
      breadcrumb="Settings / Data / Data Backup"
      purpose="Data Backup manages the backup and restore configuration for the company's Haypbooks data. All data is automatically backed up by Haypbooks on a continuous basis, but this page gives company administrators visibility into backup status, backup history, and the ability to trigger a manual backup or request a data restore. It also allows downloading a full data export for the company's own off-system archive — important for long-term data retention compliance and as a safety net."
      components={[
        { name: 'Backup Status', description: 'Last successful backup timestamp, backup frequency, and data coverage (all modules).' },
        { name: 'Backup History', description: 'Log of all backups: timestamp, size, status (success/in-progress/failed).' },
        { name: 'Manual Backup Trigger', description: 'Request an immediate backup outside the normal schedule.' },
        { name: 'Restore Request', description: 'Request data restore from a specific backup point — initiates a support request to Haypbooks.' },
        { name: 'Data Export', description: 'Download a full export of all company data as a structured data pack (JSON or CSV) for off-system archive.' },
      ]}
      tabs={['Backup Status', 'Backup History', 'Restore', 'Data Export']}
      features={[
        'Automated continuous data backup visibility',
        'Backup history log',
        'Manual backup trigger',
        'Restore from backup request',
        'Full data export for off-system archive',
        'Data retention policy visibility',
      ]}
      dataDisplayed={[
        'Last backup timestamp and status',
        'Backup frequency and coverage',
        'Backup history log',
        'Data export availability',
      ]}
      userActions={[
        'View backup status and history',
        'Trigger manual backup',
        'Request data restore',
        'Download full data export',
        'Archive export for long-term retention',
      ]}
      relatedPages={[
        { label: 'Audit Log', href: '/settings/data/audit-log' },
        { label: 'Security Settings', href: '/settings/security/security-settings' },
        { label: 'Subscription', href: '/settings/billing/subscription' },
      ]}
    />
  )
}

