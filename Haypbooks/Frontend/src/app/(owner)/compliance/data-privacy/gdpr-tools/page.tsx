'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Privacy Tools"
      module="COMPLIANCE"
      breadcrumb="Compliance / Data Privacy / Privacy Tools"
      purpose="Privacy Tools provides operational workflows for data subject rights management — including the right to access, right to erasure (right to be forgotten), right to portability, and consent management. It also provides a privacy impact assessment (PIA) tool for evaluating new data processing activities. Aligned with Philippine RA 10173 (Data Privacy Act) and GDPR requirements."
      components={[
        { name: 'Data Subject Request Inbox', description: 'Incoming data subject access requests (DSARs) with type (access/erasure/portability), date, requestor, and status.' },
        { name: 'DSAR Processing Workflow', description: 'Step-by-step workflow for processing each request type: locate data, verify identity, extract/anonymize/delete, respond.' },
        { name: 'Privacy Impact Assessment (PIA) Form', description: 'Structured form for evaluating new data processing activities: data types, purpose, risks, and mitigations.' },
        { name: 'Consent Dashboard', description: 'Overview of all collected consents with withdrawal rate and expiry alerts.' },
      ]}
      tabs={['Data Subject Requests', 'PIA Assessments', 'Consent Management', 'Breach Register']}
      features={[
        'End-to-end DSAR processing workflow',
        'Identity verification step before data access',
        'Automated data location across all modules for access requests',
        'Data erasure and anonymization workflow',
        'Privacy impact assessment documentation',
        'Data breach incident register',
        'Consent lifecycle management',
      ]}
      dataDisplayed={[
        'All pending and completed DSARs with status',
        'DSAR age and statutory response deadline',
        'PIA assessments with risk rating',
        'Consent counts, withdrawal rate, and expiry',
        'Data breach incidents with notification status',
      ]}
      userActions={[
        'Open and process a data subject request',
        'Record identity verification outcome',
        'Generate data access package for subject',
        'Initiate data erasure workflow',
        'Create a new PIA assessment',
        'Record a data breach incident',
        'Manage consent withdrawal',
      ]}
      relatedPages={[
        { label: 'Data Classification', href: '/compliance/data-privacy/data-classification' },
        { label: 'Data Retention', href: '/compliance/data-privacy/data-retention' },
        { label: 'Regulatory Compliance', href: '/compliance/reporting/regulatory-compliance' },
      ]}
    />
  )
}

