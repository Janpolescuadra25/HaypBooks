'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Regulatory Compliance"
      module="COMPLIANCE"
      breadcrumb="Compliance / Reporting / Regulatory Compliance"
      purpose="Regulatory Compliance tracks the company's compliance status across all applicable regulatory frameworks — SEC, BIR, DOLE, LGU, PSA, and industry-specific regulations. Each regulatory requirement is tracked with its current compliance status, last filing date, next due date, responsible party, and evidence documentation. It provides an at-a-glance compliance dashboard for the organization's regulatory posture."
      components={[
        { name: 'Regulatory Framework Overview', description: 'Summary tiles per regulatory body showing: total requirements, compliant count, at-risk count, and overdue count.' },
        { name: 'Requirements Checklist', description: 'Per-framework checklist of all requirements with status, responsible user, last filed, and next due date.' },
        { name: 'Evidence Attachments', description: 'Attach compliance evidence documents (filing receipts, permits, certificates) to each requirement.' },
        { name: 'Status Dashboard', description: 'RAG status dashboard across all regulatory frameworks with trend indicators.' },
      ]}
      tabs={['Overview', 'SEC', 'BIR', 'DOLE', 'LGU', 'Industry-Specific']}
      features={[
        'Multi-regulatory framework compliance tracking',
        'RAG status per requirement',
        'Evidence document attachment',
        'Responsible party assignment',
        'Regulatory deadline alerts',
        'Compliance posture trend over time',
        'Export compliance status report for management',
      ]}
      dataDisplayed={[
        'Regulatory requirements by framework',
        'Compliance status (Compliant / At Risk / Non-Compliant)',
        'Last filed date and next due date per requirement',
        'Responsible owner assignment',
        'Evidence documents attached',
        'Overall compliance score per regulatory body',
      ]}
      userActions={[
        'Update compliance status for a requirement',
        'Attach evidence document',
        'Assign responsible party',
        'Add custom regulatory requirement',
        'Export compliance report by framework',
        'Set reminder for upcoming regulatory deadline',
      ]}
      relatedPages={[
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
        { label: 'Filing Calendar', href: '/organization/governance/filing-calendar' },
        { label: 'PH Tax Compliance', href: '/philippine-tax/compliance/tax-compliance-calendar' },
        { label: 'Document Storage', href: '/organization/governance/document-storage' },
      ]}
    />
  )
}

