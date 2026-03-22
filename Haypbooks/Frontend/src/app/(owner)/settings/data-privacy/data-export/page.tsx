'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DataExportPage() {
  return (
    <PageDocumentation
      title="Data Export"
      module="SETTINGS"
      breadcrumb="Settings / Data & Privacy / Data Export"
      purpose="Data Export enables account owners to extract a structured copy of all company data from Haypbooks — including transactions, contacts, reports, and configuration — for migration, archiving, or regulatory disclosure purposes. Exports can be scoped to specific modules or date ranges and are delivered as downloadable packages in standard formats. This supports data portability rights and business continuity planning."
      components={[
        { name: 'Export Scope Selector', description: 'Checkboxes to select which data categories to include: Transactions, Contacts, Configuration, Reports.' },
        { name: 'Date Range Filter', description: 'Optional date range to restrict transaction data to a specific period within the export.' },
        { name: 'Export Format Options', description: 'Choose between CSV, Excel XLSX, or JSON output format for the exported data package.' },
        { name: 'Export Job Queue', description: 'Status table of all requested exports with progress bar, completion status, and download link.' },
        { name: 'Export Notification', description: 'Email notification toggle to alert the requester when the export package is ready for download.' },
      ]}
      tabs={['New Export Request', 'Export History']}
      features={[
        'Export all or selected categories of business data in one request',
        'Filter export by date range for period-specific data portability',
        'Choose from CSV, XLSX, or JSON output formats',
        'Queue multiple export jobs and track progress',
        'Receive email notification when export is ready',
        'Retain export packages for 7 days before auto-deletion',
      ]}
      dataDisplayed={[
        'Available data categories and estimated record counts',
        'Export job status (queued, processing, ready, expired)',
        'Export file size and format',
        'Requested by user and request timestamp',
        'Download link expiry countdown',
      ]}
      userActions={[
        'Request a new data export with scope and format',
        'Set date range filter for transaction data',
        'Choose export file format',
        'Download completed export package',
        'View export history and re-request expired exports',
      ]}
    />
  )
}

