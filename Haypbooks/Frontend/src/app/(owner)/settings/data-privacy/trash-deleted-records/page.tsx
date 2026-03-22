'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TrashDeletedRecordsPage() {
  return (
    <PageDocumentation
      title="Trash & Deleted Records"
      module="SETTINGS"
      breadcrumb="Settings / Data & Privacy / Trash & Deleted Records"
      purpose="Trash & Deleted Records is a safety net that holds soft-deleted records for a recovery window before permanent deletion, giving administrators the ability to restore accidentally deleted customers, transactions, documents, or configurations. Records in the trash are excluded from all normal views and reports but remain accessible here for restoration. After the retention window expires, records are permanently purged from the system."
      components={[
        { name: 'Deleted Records Table', description: 'Filterable table of all soft-deleted records with type, name, delete date, and deleted-by user.' },
        { name: 'Record Type Filter', description: 'Dropdown to filter the trash view by record type: Customers, Vendors, Transactions, Documents.' },
        { name: 'Restore Action', description: 'Per-row restore button that returns a deleted record to its original location with all linked data intact.' },
        { name: 'Permanent Delete Action', description: 'Guarded permanent delete button for records that should be purged before the auto-expiry window.' },
        { name: 'Expiry Countdown', description: 'Visual indicator on each row showing days remaining before the record is permanently auto-purged.' },
      ]}
      tabs={['All Deleted', 'Transactions', 'Contacts', 'Documents', 'Configuration']}
      features={[
        'View all soft-deleted records across the system in one place',
        'Restore deleted records with all linked data intact',
        'Filter trash by record type and deletion date',
        'Permanently delete records before auto-purge window',
        'Search for a specific deleted record by name or ID',
        'See who deleted each record and when',
      ]}
      dataDisplayed={[
        'Record type, name, and ID',
        'Deleted by user and deletion timestamp',
        'Days remaining until permanent purge',
        'Original module and parent record',
        'Record status at time of deletion',
      ]}
      userActions={[
        'Restore a deleted record to active state',
        'Permanently delete a record from trash',
        'Filter trash by record type',
        'Search for specific deleted records',
        'Review deletion audit (who deleted what)',
      ]}
    />
  )
}

