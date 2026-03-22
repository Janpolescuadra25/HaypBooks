'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Compliance Reports"
      module="COMPLIANCE"
      breadcrumb="Compliance / Reporting / Compliance Reports"
      purpose="Compliance Reports generates standard and custom compliance reporting documents for internal governance, board presentations, external audits, and regulatory examinations. Reports include control self-assessment summaries, policy acknowledgment status, risk register snapshots, audit trail extracts, and regulatory returns. All reports can be filtered by period, entity, and scope."
      components={[
        { name: 'Report Library', description: 'Pre-built compliance report templates: Control Assessment Summary, Risk Report, Policy Acknowledgment Report, Audit Log Extract, Segregation of Duties Report.' },
        { name: 'Report Generator', description: 'Configure filters (entity, date range, control area) and generate any compliance report in PDF, Excel, or CSV.' },
        { name: 'Saved Report Configurations', description: 'Save a report configuration for repeated generation (e.g., monthly board compliance pack).' },
        { name: 'Report History', description: 'Archive of previously generated compliance reports with download links and generation metadata.' },
      ]}
      tabs={['Report Library', 'Generate Report', 'Saved Configurations', 'History']}
      features={[
        'Pre-built compliance report templates',
        'Configurable filters for targeted reporting',
        'Export to PDF/Excel/CSV formats',
        'Saved configurations for recurring reports',
        'Compliance report delivery via email',
        'Report generation audit trail',
      ]}
      dataDisplayed={[
        'Control assessment scores and exceptions',
        'Risk register snapshot with current scores',
        'Policy acknowledgment completion rates',
        'Segregation of duties analysis',
        'User access report by role and permission',
        'Audit log extracts with user activity summary',
      ]}
      userActions={[
        'Generate a compliance report',
        'Configure filters for targeted scope',
        'Save a report configuration for reuse',
        'Schedule recurring report delivery',
        'Download previously generated report',
        'Share report via email link',
      ]}
      relatedPages={[
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
        { label: 'Risk Register', href: '/compliance/controls/risk-register' },
        { label: 'Audit Trails', href: '/automation/approvals-governance/audit-trails' },
        { label: 'Regulatory Compliance', href: '/compliance/reporting/regulatory-compliance' },
      ]}
    />
  )
}


