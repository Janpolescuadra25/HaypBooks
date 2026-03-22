'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Data Retention"
      module="COMPLIANCE"
      breadcrumb="Compliance / Data Privacy / Data Retention"
      purpose="Data Retention manages the policies and schedules for how long different types of data are kept in the system before being archived or purged. Financial records (minimum 10 years under BIR rules), HR records, customer data, and transaction logs each have different statutory retention requirements. This page configures and tracks those requirements, schedules automated archiving, and logs all data disposal actions."
      components={[
        { name: 'Retention Policy Table', description: 'All data types with configured retention period, statutory basis, current record count, and next review date.' },
        { name: 'Retention Schedule Builder', description: 'Configure retention rules per data category: years to retain, archiving method, and disposal action after period ends.' },
        { name: 'Archive Queue', description: 'Data eligible for archiving this period with count, oldest record date, and archive action button.' },
        { name: 'Disposal Log', description: 'Immutable log of all data archival and disposal events with actor, timestamp, and record counts.' },
      ]}
      tabs={['Retention Policies', 'Archive Queue', 'Disposal Log', 'Statutory References']}
      features={[
        'Configurable retention periods per data type',
        'Statutory minimum retention enforcement (BIR, SEC, DOLE)',
        'Automated archiving workflow',
        'Immutable disposal audit trail',
        'Legal hold flag to prevent disposal of contested data',
        'Data retention compliance dashboard',
      ]}
      dataDisplayed={[
        'Data categories with retention period (years)',
        'Statutory basis for each retention period',
        'Record counts per category',
        'Data eligible for archiving or disposal this period',
        'Historical disposal events with record counts',
      ]}
      userActions={[
        'Set retention period for a data category',
        'Initiate archiving run for eligible data',
        'Place a legal hold on specific records',
        'Approve data disposal after review',
        'Export retention compliance summary report',
        'View historical disposal log',
      ]}
      relatedPages={[
        { label: 'Data Classification', href: '/compliance/data-privacy/data-classification' },
        { label: 'Policy Management', href: '/compliance/controls/policy-management' },
        { label: 'Audit Trails', href: '/automation/approvals-governance/audit-trails' },
      ]}
    />
  )
}

