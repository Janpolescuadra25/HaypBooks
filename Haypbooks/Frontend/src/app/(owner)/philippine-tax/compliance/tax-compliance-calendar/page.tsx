'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Tax Compliance Calendar"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Compliance / Tax Compliance Calendar"
      badge="PH ONLY"
      purpose="The Tax Compliance Calendar is the master calendar of all BIR and government agency filing deadlines for the organization. It covers monthly, quarterly, and annual BIR forms (2550M, 2550Q, 1601C, 1601EQ, 1702Q, 1702RT, 1604C), SSS, PhilHealth, and HDMF remittance deadlines, local government license renewals, annual SEC report submissions, and other regulatory filing requirements. The calendar shows upcoming deadlines, filing status for past periods, and allows the tax team to record filings as completed."
      components={[
        { name: 'Calendar View', description: 'Month-by-month visual calendar with all filing deadlines color-coded by agency and urgency.' },
        { name: 'Deadline List', description: 'Table of upcoming deadlines: form, agency, period covered, deadline date, days remaining, and status.' },
        { name: 'Filing Status Tracker', description: 'For each deadline: mark as filed, enter confirmation number, attach proof of filing, and note date filed.' },
        { name: 'Past Due Alerts', description: 'Overdue filings highlighted in red with days overdue and estimated penalty.' },
        { name: 'Email Reminder Settings', description: 'Configure automated email reminders to tax team at 30/15/7/2 days before each deadline.' },
      ]}
      tabs={['Calendar', 'Upcoming Deadlines', 'Filing Status', 'Overdue', 'Reminder Settings']}
      features={[
        'Comprehensive BIR, SSS, PhilHealth, HDMF deadline calendar',
        'Filing status tracking with confirmation number recording',
        'Proof of filing attachment per deadline',
        'Email reminders before deadlines',
        'Overdue compliance alert with penalty estimate',
        'Annual calendar generation with eFPS filing group offsets',
        'Local government license renewal tracking',
      ]}
      dataDisplayed={[
        'All upcoming filing deadlines with days remaining',
        'Filing status: pending, filed, overdue',
        'Confirmation numbers for filed returns',
        'Overdue items with days overdue',
        'Annual overview of all compliance deadlines',
      ]}
      userActions={[
        'View all upcoming deadlines',
        'Mark a filing as completed',
        'Enter confirmation number and payment reference',
        'Attach proof of filing document',
        'Set reminders for specific filings',
        'Export compliance calendar to PDF',
      ]}
      relatedPages={[
        { label: 'BIR Forms', href: '/philippine-tax/bir-forms/form-2550m' },
        { label: 'EFPS Setup', href: '/philippine-tax/compliance/efps-setup' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
      ]}
    />
  )
}

