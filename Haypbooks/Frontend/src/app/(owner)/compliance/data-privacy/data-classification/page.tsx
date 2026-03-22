'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Data Classification"
      module="COMPLIANCE"
      breadcrumb="Compliance / Data Privacy / Data Classification"
      purpose="Data Classification manages the framework for classifying all data in the system by sensitivity level (Public, Internal, Confidential, Restricted) to ensure appropriate access controls and handling procedures. Aligned with Republic Act 10173 (Philippine Data Privacy Act) and GDPR principles, it defines what data is collected, who can access it, and how it must be handled and disposed of."
      components={[
        { name: 'Data Classification Matrix', description: 'Grid mapping data types (personal, financial, HR, customer, vendor) to classification levels and required controls.' },
        { name: 'Personal Data Inventory', description: 'Registry of all personally identifiable information (PII) fields in the system: entity, field, data type, storage, and legal basis.' },
        { name: 'Data Handling Rules', description: 'Per-classification-level handling requirements: access controls, encryption, retention period, and disposal method.' },
        { name: 'Consent Records', description: 'Records of data subject consent for PII collection and processing, with withdrawal support.' },
      ]}
      tabs={['Classification Matrix', 'PII Inventory', 'Handling Rules', 'Consent Records']}
      features={[
        'Data classification framework aligned with RA 10173 and GDPR',
        'PII field-level inventory across all modules',
        'Data handling rule enforcement',
        'Consent management and withdrawal tracking',
        'Data subject access request (DSAR) workflow',
        'Data retention and disposal scheduling',
      ]}
      dataDisplayed={[
        'All data types with classification level',
        'PII fields: entity, field name, type, legal basis',
        'Access control requirements per classification',
        'Retention period per data type',
        'Consent record counts and withdrawal rate',
      ]}
      userActions={[
        'Assign classification level to data type',
        'Add new PII field to inventory',
        'Update handling rules for a classification level',
        'Process a data subject access request',
        'Record or withdraw a consent',
        'Export data inventory for DPA notification',
      ]}
      relatedPages={[
        { label: 'Policy Management', href: '/compliance/controls/policy-management' },
        { label: 'Regulatory Compliance', href: '/compliance/reporting/regulatory-compliance' },
        { label: 'Data Retention', href: '/compliance/data-privacy/data-retention' },
        { label: 'Security Log', href: '/settings/security/security-log' },
      ]}
    />
  )
}

