'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DataBackupPage() {
  return (
    <PageDocumentation
      title="Data Backup"
      module="SETTINGS"
      breadcrumb="Settings / Data & Privacy / Data Backup"
      purpose="Data Backup manages automated and manual backups of your entire Haypbooks company data, ensuring a recovery point is always available in case of accidental deletion or system issues. Administrators can schedule recurring backups, trigger manual snapshots, and download backup archives for offline storage. Backup status and health are visible at a glance so issues can be caught early."
      components={[
        { name: 'Backup Schedule Config', description: 'Form to set backup frequency (daily, weekly, monthly) and preferred time window for automated backups.' },
        { name: 'Backup History Table', description: 'Log of all past backups with date, size, type (auto/manual), and status (success/failed/in-progress).' },
        { name: 'Manual Backup Trigger', description: 'Button to initiate an on-demand backup snapshot immediately outside the scheduled cycle.' },
        { name: 'Download Archive', description: 'Download button on completed backups to retrieve the encrypted backup file for offline storage.' },
        { name: 'Retention Settings', description: 'Configure how many backup copies to retain before older backups are automatically purged.' },
      ]}
      tabs={['Backup Schedule', 'Backup History', 'Retention Policy']}
      features={[
        'Schedule automatic backups on daily, weekly, or monthly cadence',
        'Trigger manual backups at any time for pre-change snapshots',
        'Download encrypted backup archives for external storage',
        'Configure backup retention count to manage storage',
        'Receive email alerts on backup failures',
        'View backup size trend to anticipate storage needs',
      ]}
      dataDisplayed={[
        'Next scheduled backup date and time',
        'Last successful backup timestamp and file size',
        'Backup history with status per entry',
        'Retention count (current kept vs. max allowed)',
        'Total backup storage consumed',
      ]}
      userActions={[
        'Configure automated backup schedule',
        'Run a manual backup immediately',
        'Download a backup archive',
        'Set backup retention count',
        'View and troubleshoot failed backup entries',
      ]}
    />
  )
}

