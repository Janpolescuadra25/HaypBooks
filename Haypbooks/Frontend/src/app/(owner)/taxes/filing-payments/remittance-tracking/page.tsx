'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function RemittanceTrackingPage() {
  return (
    <PageDocumentation
      title="Remittance Tracking"
      module="TAXES"
      breadcrumb="Taxes / Filing & Payments / Remittance Tracking"
      purpose="Remittance Tracking monitors all tax remittance transactions — withholding taxes, VAT remittances, and payroll tax deposits — ensuring that amounts withheld from transactions are actually paid to the correct tax authority by the required deadline. This page prevents late payment penalties by surfacing upcoming remittance due dates and tracking which withheld amounts have been remitted vs. still outstanding."
      components={[
        { name: 'Remittance Calendar', description: 'Calendar view of all upcoming and past remittance due dates color-coded by remittance type.' },
        { name: 'Outstanding Remittances Table', description: 'List of withheld amounts not yet remitted with origin transaction, amount, and due date.' },
        { name: 'Remittance Entry Form', description: 'Form to record a remittance payment: amount, date, reference number, and tax authority.' },
        { name: 'Cumulative Liability Balance', description: 'Running total of total withholding liability vs. amounts already remitted to date.' },
        { name: 'Penalty Risk Alerts', description: 'Alerts on overdue remittances with calculated penalty estimates if not paid immediately.' },
      ]}
      tabs={['Upcoming Remittances', 'Overdue', 'Remitted', 'Summary by Tax Type']}
      features={[
        'Track all outstanding withholding and VAT remittance obligations',
        'Calendar view of all remittance due dates',
        'Record payment of each remittance with reference number',
        'Calculate and alert on overdue remittance penalty risk',
        'View cumulative remittance liability vs. amount remitted',
        'Break down remittances by tax type and authority',
      ]}
      dataDisplayed={[
        'Tax type and authority receiving remittance',
        'Origin period and transaction reference',
        'Amount withheld and amount remitted',
        'Remittance due date and payment status',
        'Overdue days and penalty risk estimate',
      ]}
      userActions={[
        'Record a remittance payment',
        'View upcoming and overdue remittances',
        'Acknowledge or dismiss a remittance alert',
        'Export remittance schedule',
        'Reconcile withheld amounts against remitted amounts',
      ]}
    />
  )
}

