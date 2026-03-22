'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Risk Register"
      module="COMPLIANCE"
      breadcrumb="Compliance / Controls / Risk Register"
      purpose="The Risk Register maintains a formal inventory of identified business and financial risks, their likelihood and impact assessments, mitigation strategies, and ownership. It is updated regularly as part of the enterprise risk management process. Each risk has an owner, a current risk score, mitigation actions, control effectiveness rating, and residual risk level."
      components={[
        { name: 'Risk Matrix Heat Map', description: '5x5 likelihood-impact heat map. Each risk is plotted as a bubble; color indicates inherent risk (red/amber/green).' },
        { name: 'Risk Register Table', description: 'Full list of all risks with ID, description, category, likelihood, impact, inherent score, control activities, residual score, and owner.' },
        { name: 'Risk Detail Card', description: 'Full risk profile: description, category, related processes, mitigation actions, control effectiveness, target residual score, and review date.' },
        { name: 'Add Risk Form', description: 'Create a new risk entry with all assessment fields.' },
        { name: 'Review Schedule', description: 'Scheduled periodic review dates per risk with reminder alerts for risk owners.' },
      ]}
      tabs={['Heat Map', 'Risk Register', 'By Category', 'By Owner', 'Review Schedule']}
      features={[
        'Formal enterprise risk register with likelihood-impact scoring',
        'Heat map visualization of risk portfolio',
        'Mitigation plan tracking per risk',
        'Control effectiveness assessment',
        'Risk owner assignment and review scheduling',
        'Risk trend tracking over time',
        'Export risk register to PDF for board reporting',
      ]}
      dataDisplayed={[
        'Risk ID, title, and category',
        'Likelihood score (1–5) and impact score (1–5)',
        'Inherent risk score and residual risk score',
        'Risk owner and review due date',
        'Mitigation actions with completion status',
        'Control activities and effectiveness rating',
      ]}
      userActions={[
        'Add a new risk to the register',
        'Update likelihood and impact scores',
        'Record mitigation actions completed',
        'Assign risk owner',
        'Schedule periodic risk review',
        'Export risk register for audit or board presentation',
        'Mark a risk as closed/resolved',
      ]}
      relatedPages={[
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
        { label: 'Policy Management', href: '/compliance/controls/policy-management' },
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
        { label: 'Audit Trails', href: '/automation/approvals-governance/audit-trails' },
      ]}
    />
  )
}

