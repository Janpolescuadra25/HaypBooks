'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Data Export Jobs"
      module="AUTOMATION"
      breadcrumb="Automation / Scheduled Jobs / Data Export Jobs"
      purpose="Data Export Jobs manages automated scheduled data exports from Haypbooks to external destinations (SFTP servers, cloud storage, ERP systems). These exports deliver structured data extracts (CSV, JSON, XML) on a schedule for downstream data warehouse feeds, external reporting tools, payroll processors, and government filing portals."
      components={[
        { name: 'Export Job List', description: 'All configured export jobs with name, data type, destination, schedule, last run status, and last delivery time.' },
        { name: 'Job Builder', description: 'Configure an export job: select data entity (transactions, invoices, payroll, GL entries), output format, destination, and schedule.' },
        { name: 'Destination Config', description: 'Setup export destinations: SFTP credentials, cloud storage bucket, API endpoint, or email attachment.' },
        { name: 'Run History', description: 'Execution history per job with record count exported, file size, delivery status, and any errors.' },
      ]}
      tabs={['Export Jobs', 'Create Job', 'Run History', 'Destinations']}
      features={[
        'Scheduled automated data extracts',
        'Multiple destination types: SFTP, S3, Azure Blob, API, email',
        'Configurable field selection and filters per export',
        'Format options: CSV, JSON, XML, Excel',
        'Incremental exports (only new/changed records since last run)',
        'Secure credential management for external destinations',
      ]}
      dataDisplayed={[
        'Export job name, data entity type, and format',
        'Destination and schedule',
        'Last run status and timestamp',
        'Records exported in last run',
        'Error log for failed export jobs',
      ]}
      userActions={[
        'Create a new export job',
        'Configure export filters and field selection',
        'Set up export destination with credentials',
        'Run job manually on demand',
        'Pause or resume a scheduled job',
        'View delivery history and error logs',
      ]}
      relatedPages={[
        { label: 'Report Scheduler', href: '/automation/scheduled-jobs/report-scheduler' },
        { label: 'Integrations', href: '/apps-integrations/integration-hub/available-integrations' },
        { label: 'Audit Trails', href: '/automation/approvals-governance/audit-trails' },
      ]}
    />
  )
}

