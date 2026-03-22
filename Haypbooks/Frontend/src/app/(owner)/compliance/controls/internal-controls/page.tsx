'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Internal Controls"
      module="COMPLIANCE"
      breadcrumb="Compliance / Controls / Internal Controls"
      purpose="Internal Controls is the framework management page for documenting and monitoring the company's internal control activities. It lists all control activities (preventive and detective), their objectives, testing procedures, frequency, owner, and last test result. This documentation supports audits, regulatory examinations, and ongoing control self-assessments."
      components={[
        { name: 'Control Catalog', description: 'Complete list of all documented internal controls with type (preventive/detective/corrective), process area, frequency, and last tested date.' },
        { name: 'Control Detail', description: 'Full control documentation: control objective, procedure description, evidence required, frequency, owner, and test history.' },
        { name: 'Testing Schedule', description: 'Calendar of upcoming control tests with owner assignments and due dates.' },
        { name: 'Test Results Log', description: 'History of control test outcomes: passed, has exceptions, or failed — with exception details and remediation.' },
      ]}
      tabs={['All Controls', 'Preventive', 'Detective', 'Testing Schedule', 'Test Results']}
      features={[
        'Formal internal control documentation catalog',
        'Control testing schedule and tracking',
        'Exception and finding documentation',
        'Control-to-risk mapping',
        'Remediation tracking for control failures',
        'Export control documentation for external audit',
      ]}
      dataDisplayed={[
        'Control ID, name, and type',
        'Business process area covered',
        'Control objective and procedure description',
        'Testing frequency and last test date',
        'Test result (Pass / Exception / Fail)',
        'Owner and responsible department',
      ]}
      userActions={[
        'Add a new internal control documentation entry',
        'Record control test result',
        'Document control exceptions and remediation',
        'Schedule next control test',
        'Export control catalog for audit package',
        'Link control to risk in the risk register',
      ]}
      relatedPages={[
        { label: 'Risk Register', href: '/compliance/controls/risk-register' },
        { label: 'Policy Management', href: '/compliance/controls/policy-management' },
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
      ]}
    />
  )
}


