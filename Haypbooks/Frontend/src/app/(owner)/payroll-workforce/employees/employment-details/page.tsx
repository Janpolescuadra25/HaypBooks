'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employment Details"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Employees / Employment Details"
      purpose="Employment Details manages the formal employment record of each employee — employment classification, probationary period, regularization date, reporting structure, work schedule, employment contract reference, and separation details for resigned employees. This page is the source of truth for employment history and is referenced during regularization processing, separation pay calculation, and government compliance reporting (particularly for certificates of employment and clearances)."
      components={[
        { name: 'Employment Timeline', description: 'Key employment dates: hire date, probationary end, regularization date, any promotions/transfers, and separation date.' },
        { name: 'Classification Detail', description: 'Employment type (Regular, Probationary, Contractual/Project-based), work arrangement (on-site, hybrid, remote), work schedule (5-day, shift).' },
        { name: 'Reporting Structure', description: 'Immediate superior/direct manager and secondary reporting lines.' },
        { name: 'Separation Details', description: 'For resigned/terminated: separation date, reason, last day of work, backpay computation status.' },
        { name: 'Contract History', description: 'Archive of employment contracts and amendments with effective dates.' },
      ]}
      tabs={['Current Employment', 'Employment History', 'Contract History', 'Separation Details']}
      features={[
        'Complete employment classification and status history',
        'Probationary period tracking with regularization alert',
        'Separation workflow: documentation and backpay trigger',
        'Certificate of employment generation',
        'Reporting line management',
        'Work schedule assignment',
      ]}
      dataDisplayed={[
        'Current employment type and status',
        'Hire date, regularization date, and tenure',
        'Probationary employees nearing regularization',
        'Separation details for separated employees',
        'Contract history',
      ]}
      userActions={[
        'Update employment classification',
        'Record regularization',
        'Assign work schedule',
        'Process separation and trigger backpay',
        'Generate certificate of employment',
        'View employee employment history',
      ]}
      relatedPages={[
        { label: 'Employee List', href: '/payroll-workforce/employees/employee-list' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Leave Balances', href: '/payroll-workforce/leaves/leave-balances' },
      ]}
    />
  )
}

