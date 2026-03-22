'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Government Reports"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compliance / Government Reports"
      badge="PH ONLY"
      purpose="Government Reports generates all mandatory Philippine government agency submissions required of employers — SSS, PhilHealth, HDMF (Pag-IBIG), and BIR payroll-related reports. These include monthly contribution schedules, remittance reports, and forms required for compliance. Generating these reports from the payroll data eliminates manual preparation errors and ensures on-time filing. The filing calendar integration alerts the payroll team of upcoming submission deadlines."
      components={[
        { name: 'SSS Report Generator', description: 'Generate SSS R3 (Contribution Summary), SSS Loan Collection List, and ML2 (Maternity Notification) for the period.' },
        { name: 'PhilHealth Report Generator', description: 'Generate PhilHealth RF-1 (Contribution Report) in the electronic format required by PhilHealth.' },
        { name: 'HDMF/Pag-IBIG Report Generator', description: 'Generate HDMF Collection List for regular contributions and MPL loan remittance schedule.' },
        { name: 'BIR 1601C Generator', description: 'Monthly withholding tax remittance form 1601C with total amount of tax withheld from employees.' },
        { name: 'Filing Calendar', description: 'Upcoming deadlines for all government agency submissions with days remaining.' },
      ]}
      tabs={['SSS', 'PhilHealth', 'HDMF / Pag-IBIG', 'BIR Withholding', 'Filing Calendar']}
      features={[
        'SSS R3 contribution report and submission file',
        'PhilHealth RF-1 electronic format',
        'HDMF collection list for regular and MPL',
        'BIR 1601C monthly withholding remittance',
        'Filing deadline calendar with alerts',
        'E-filing format generation (EFPS, SSS online, SBRNet)',
        'Remittance history and filing status tracking',
      ]}
      dataDisplayed={[
        'Total contributions computed per agency',
        'Per-employee contribution breakdown',
        'Filing deadlines and days remaining',
        'Remittance history per agency',
        'Variance from prior period (for review)',
      ]}
      userActions={[
        'Generate SSS R3 for the period',
        'Generate PhilHealth RF-1',
        'Generate HDMF collection list',
        'Generate BIR 1601C',
        'Download government filing format (e-payment file)',
        'Mark filing as submitted',
        'View filing and remittance history',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: '13th Month', href: '/payroll-workforce/compliance/13th-month' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
        { label: 'BIR Forms', href: '/philippine-tax/bir-forms/1601c' },
      ]}
    />
  )
}

